import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  CheckCircle,
  Clock,
  FileCheck,
  FileText,
  AlertCircle,
  Download,
  CreditCard,
  Ban,
  Send,
  CheckCircle2,
  Mail,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { GuestDocumentUpload } from "@/components/GuestDocumentUpload";
import { SimpleDownloadButton } from "@/components/SimpleDownloadButton";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

/* ------------------------------------------------------------------ */
/*  Timeline step definitions                                         */
/* ------------------------------------------------------------------ */

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  date: string | null;
  state: "completed" | "current" | "future";
  subtitle?: string;
}

function buildTimeline(order: any): TimelineStep[] {
  const history: Record<string, string> = order.status_history || {};
  const status = order.status;

  const raw: {
    key: string;
    label: string;
    icon: string;
    completedWhen: () => string | null;
    currentWhen?: () => boolean;
    futureSubtitle?: string;
  }[] = [
    {
      key: "commande_recue",
      label: "Commande recue",
      icon: "\ud83d\udccb",
      completedWhen: () => order.created_at || history.commande_recue || null,
    },
    {
      key: "paiement_confirme",
      label: "Paiement confirme",
      icon: "\ud83d\udcb3",
      completedWhen: () => order.paid_at || history.paiement_confirme || (order.paye ? order.created_at : null),
    },
    {
      key: "documents_verifies",
      label: "Documents verifies",
      icon: "\ud83d\udcc4",
      completedWhen: () =>
        history.documents_verifies ||
        (["valide", "finalise"].includes(status) ? history.en_traitement || order.validated_at : null),
      currentWhen: () => status === "en_traitement",
      futureSubtitle: "En attente de verification",
    },
    {
      key: "dossier_ants",
      label: "Dossier soumis a l'ANTS",
      icon: "\ud83c\udfdb\ufe0f",
      completedWhen: () => history.dossier_ants || (["valide", "finalise"].includes(status) ? order.validated_at : null),
      currentWhen: () => status === "valide" && !history.cpi_disponible,
    },
    {
      key: "cpi_disponible",
      label: "CPI disponible",
      icon: "\ud83d\udcec",
      completedWhen: () => history.cpi_disponible || null,
      currentWhen: () => status === "valide" && !!history.cpi_disponible && !history.carte_grise_expediee,
    },
    {
      key: "carte_grise_expediee",
      label: "Carte grise expediee",
      icon: "\u2705",
      completedWhen: () =>
        history.carte_grise_expediee || (status === "finalise" ? history.finalise || order.updated_at : null),
    },
  ];

  let foundCurrent = false;
  const steps: TimelineStep[] = [];

  for (const step of raw) {
    const dateStr = step.completedWhen();
    if (dateStr) {
      steps.push({ key: step.key, label: step.label, icon: step.icon, date: dateStr, state: "completed" });
    } else if (!foundCurrent && step.currentWhen?.()) {
      foundCurrent = true;
      steps.push({
        key: step.key,
        label: step.label,
        icon: step.icon,
        date: null,
        state: "current",
        subtitle: "En cours",
      });
    } else if (!foundCurrent) {
      foundCurrent = true;
      steps.push({
        key: step.key,
        label: step.label,
        icon: step.icon,
        date: null,
        state: "current",
        subtitle: step.futureSubtitle || "En cours",
      });
    } else {
      steps.push({ key: step.key, label: step.label, icon: step.icon, date: null, state: "future" });
    }
  }

  return steps;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDemarcheLabel(type: string) {
  const map: Record<string, string> = {
    CG: "Carte grise",
    DA: "Declaration d'achat",
    DC: "Declaration de cession",
    DI: "Duplicata",
    CT: "Changement titulaire",
  };
  return map[type] || type;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

const SuiviCommande = () => {
  const { trackingNumber } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [adminSentDocuments, setAdminSentDocuments] = useState<any[]>([]);
  const [carteGriseUrl, setCarteGriseUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [factureUrl, setFactureUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [reuploadedDocs, setReuploadedDocs] = useState<Set<string>>(new Set());
  const [isSubmittingReupload, setIsSubmittingReupload] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  /* ---- data fetching ---- */

  const loadOrder = useCallback(async () => {
    if (!trackingNumber) return;
    try {
      const { data: response, error } = await supabase.functions.invoke("get-guest-order", {
        body: { tracking_number: trackingNumber },
      });

      if (error || !response?.success || !response?.data?.order) {
        toast({ title: "Commande introuvable", description: "Verifiez votre numero de suivi", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const orderData = response.data.order;
      setOrder(orderData);

      const allDocs = response.data.documents || [];
      const customerDocs = allDocs.filter(
        (doc: any) => doc.type_document !== "carte_grise_finale" && !doc.type_document?.startsWith("admin_")
      );
      setDocuments(customerDocs);
      setAdminSentDocuments(response.data.adminDocuments || []);

      const cgDoc = allDocs.find((d: any) => d.type_document === "carte_grise_finale");
      setCarteGriseUrl(cgDoc?.url || null);

      setIsLoading(false);
      setLastRefresh(new Date());

      const { data: facture } = await supabase
        .from("factures")
        .select("pdf_url")
        .eq("guest_order_id", orderData.id)
        .single();
      if (facture?.pdf_url) setFactureUrl(facture.pdf_url);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger la commande", variant: "destructive" });
      setIsLoading(false);
    }
  }, [trackingNumber]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!trackingNumber) return;
    const interval = setInterval(() => loadOrder(), 30000);
    return () => clearInterval(interval);
  }, [trackingNumber, loadOrder]);

  /* ---- handlers ---- */

  const handleResubmissionPayment = async () => {
    if (!order) return;
    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-resubmission-payment", {
        body: { order_id: order.id, amount: order.resubmission_payment_amount || 10 },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast({ title: "Erreur", description: "Impossible de creer le paiement", variant: "destructive" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleValidateReupload = async () => {
    setIsSubmittingReupload(true);
    try {
      await supabase.from("guest_orders").update({ documents_complets: true, status: "en_traitement" }).eq("id", order.id);
      if (order.email) {
        await supabase.functions.invoke("send-guest-order-email", {
          body: {
            type: "documents_received",
            orderData: {
              tracking_number: order.tracking_number,
              email: order.email,
              nom: order.nom,
              prenom: order.prenom,
              immatriculation: order.immatriculation,
              montant_ttc: order.montant_ttc,
              marque: order.marque,
              modele: order.modele,
            },
          },
        });
      }
      toast({ title: "Documents envoyes !", description: "Vos documents ont ete soumis avec succes." });
      setReuploadedDocs(new Set());
      loadOrder();
    } catch {
      toast({ title: "Erreur", description: "Une erreur est survenue lors de l'envoi.", variant: "destructive" });
    } finally {
      setIsSubmittingReupload(false);
    }
  };

  /* ---- loading / not found ---- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A] mx-auto" />
          <p className="text-sm text-gray-500">Chargement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Commande introuvable</h1>
          <p className="text-gray-500">Verifiez votre numero de suivi et reessayez.</p>
          <a
            href="/recherche-suivi"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B2A4A] text-white rounded-full text-sm font-medium hover:bg-[#263a5e] transition-colors"
          >
            Nouvelle recherche
          </a>
        </div>
      </div>
    );
  }

  /* ---- derived data ---- */

  const timeline = buildTimeline(order);

  const rejectedDocs = [
    ...new Set(documents.filter((d) => d.validation_status === "rejected").map((d) => d.type_document)),
  ];

  const groupedDocuments = documents.filter((d) => !(d.side === "verso" && !d.url));

  /* ---- render ---- */

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* ===== CSS for pulse animation ===== */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 1; }
          80%, 100% { transform: scale(1.8); opacity: 0; }
        }
        .timeline-pulse::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: rgba(59, 130, 246, 0.3);
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* ===== Header ===== */}
      <header className="bg-[#1B2A4A] text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
          <p className="text-blue-300 text-sm font-medium tracking-wide uppercase mb-2">Suivi de commande</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Suivi de votre commande</h1>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
            <span className="text-sm text-blue-200">N. de suivi</span>
            <span className="text-lg font-mono font-bold tracking-wider">{order.tracking_number}</span>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-xs text-blue-300">
            <RefreshCw className="w-3 h-3" />
            Mise a jour auto &middot; {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 -mt-6 pb-16 space-y-6">
        {/* ===== Visual Timeline ===== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-8">Progression</h2>

          <div className="relative">
            {timeline.map((step, i) => {
              const isLast = i === timeline.length - 1;
              const isCompleted = step.state === "completed";
              const isCurrent = step.state === "current";
              const isFuture = step.state === "future";

              return (
                <div key={step.key} className="flex gap-4 md:gap-6">
                  {/* Circle + line */}
                  <div className="relative flex flex-col items-center">
                    <div
                      className={cn(
                        "relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 transition-all",
                        isCompleted && "bg-emerald-500 text-white shadow-md shadow-emerald-200",
                        isCurrent && "bg-blue-500 text-white shadow-md shadow-blue-200 timeline-pulse",
                        isFuture && "bg-gray-100 text-gray-400 border-2 border-gray-200"
                      )}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <span className="text-base">{step.icon}</span>}
                    </div>
                    {!isLast && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 min-h-[40px]",
                          isCompleted ? "bg-emerald-300" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn("pb-8", isLast && "pb-0")}>
                    <p
                      className={cn(
                        "font-semibold leading-tight",
                        isCompleted && "text-[#1B2A4A]",
                        isCurrent && "text-blue-600",
                        isFuture && "text-gray-400"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-sm text-gray-400 mt-1">{formatDate(step.date)}</p>
                    )}
                    {isCurrent && step.subtitle && (
                      <span className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                        <Clock className="w-3 h-3" />
                        {step.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===== Order Details Card ===== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5">Details de la commande</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Demarche", value: getDemarcheLabel(order.demarche_type || "CG") },
              { label: "Immatriculation", value: order.immatriculation },
              { label: "Montant", value: `${Number(order.montant_ttc || 0).toFixed(2)} EUR` },
              { label: "Date de commande", value: order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : "-" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="font-semibold text-[#1B2A4A]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Document Alert (rejected) ===== */}
        {rejectedDocs.length > 0 && (
          <section className="bg-red-50 rounded-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-700 mb-1">
                  {rejectedDocs.length === 1 ? "Un document a ete refuse" : `${rejectedDocs.length} documents ont ete refuses`}
                </h3>
                <p className="text-sm text-red-600 mb-4">
                  Veuillez renvoyer les documents ci-dessous pour que votre dossier puisse etre traite.
                </p>

                {order.requires_resubmission_payment && !order.resubmission_paid ? (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4">
                    <div className="flex items-start gap-3">
                      <Ban className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-orange-700 mb-2">
                          Paiement de {order.resubmission_payment_amount || 10} EUR requis avant renvoi.
                        </p>
                        <button
                          onClick={handleResubmissionPayment}
                          disabled={isProcessingPayment}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                          {isProcessingPayment ? "Chargement..." : `Payer ${order.resubmission_payment_amount || 10} EUR`}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {rejectedDocs.map((docType) => {
                  const isBlocked = order.requires_resubmission_payment && !order.resubmission_paid;
                  const isReuploaded = reuploadedDocs.has(docType);
                  const newDoc = documents.find((d) => d.type_document === docType && d.validation_status === "pending");
                  const rejectedDoc = documents.find((d) => d.type_document === docType && d.validation_status === "rejected");

                  return (
                    <div
                      key={docType}
                      className={cn(
                        "mb-3 p-4 rounded-xl border transition-colors",
                        isReuploaded || newDoc ? "bg-emerald-50 border-emerald-200" : "bg-white border-red-200"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-[#1B2A4A] flex items-center gap-2">
                          {docType}
                          {(isReuploaded || newDoc) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Ajoute
                            </span>
                          )}
                        </p>
                      </div>
                      {rejectedDoc?.rejection_reason && !isReuploaded && !newDoc && (
                        <p className="text-sm text-red-500 mb-3">Raison : {rejectedDoc.rejection_reason}</p>
                      )}
                      {!isReuploaded && !newDoc && (
                        <GuestDocumentUpload
                          orderId={order.id}
                          documentType={docType}
                          label={`Renvoyer : ${docType}`}
                          existingFiles={[]}
                          isBlocked={isBlocked}
                          blockedMessage={`Veuillez payer ${order.resubmission_payment_amount || 10} EUR pour renvoyer.`}
                          onUploadComplete={() => {
                            setReuploadedDocs((prev) => new Set([...prev, docType]));
                            loadOrder();
                            toast({ title: "Document telecharge", description: "Cliquez sur 'Valider' pour envoyer." });
                          }}
                        />
                      )}
                      {(isReuploaded || newDoc) && newDoc && (
                        <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                          <FileCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-emerald-700">{newDoc.nom_fichier}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {!(order.requires_resubmission_payment && !order.resubmission_paid) && reuploadedDocs.size > 0 && (
                  <button
                    onClick={handleValidateReupload}
                    disabled={isSubmittingReupload}
                    className="w-full mt-2 h-12 rounded-full font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmittingReupload ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Valider et envoyer ({reuploadedDocs.size}/{rejectedDocs.length})</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ===== Admin comment ===== */}
        {order.commentaire && (
          <section className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
            <h3 className="font-semibold text-amber-700 mb-2">Message de l'administration</h3>
            <p className="text-gray-700 text-sm">{order.commentaire}</p>
          </section>
        )}

        {/* ===== Carte Grise available ===== */}
        {carteGriseUrl && (
          <section className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 p-8 text-center">
            <div className="mx-auto w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-200">
              <FileCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-bold text-emerald-700 mb-2">Votre carte grise est disponible !</h2>
            <p className="text-gray-600 mb-6">Felicitations ! Vous pouvez la telecharger ci-dessous.</p>
            <a
              href={carteGriseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-500 text-white rounded-full font-semibold hover:bg-emerald-600 transition-colors shadow-md"
            >
              <Download className="w-5 h-5" /> Telecharger ma carte grise
            </a>
          </section>
        )}

        {/* ===== Admin Documents ===== */}
        {adminSentDocuments.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Documents de l'administration</h2>
            <div className="space-y-3">
              {adminSentDocuments.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <p className="font-medium text-[#1B2A4A]">{doc.nom_fichier}</p>
                    {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      Envoye le {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <SimpleDownloadButton
                    url={doc.url}
                    filename={doc.nom_fichier}
                    trackingNumber={trackingNumber}
                    variant="default"
                    size="default"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-white rounded-full hover:bg-[#263a5e] transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" /> Telecharger
                  </SimpleDownloadButton>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== Facture ===== */}
        {factureUrl && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-[#1B2A4A]">Facture</p>
                  <p className="text-sm text-gray-400">Telecharger votre facture</p>
                </div>
              </div>
              <a
                href={factureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B2A4A] text-white rounded-full hover:bg-[#263a5e] transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" /> Telecharger
              </a>
            </div>
          </section>
        )}

        {/* ===== My Documents ===== */}
        {groupedDocuments.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-[#1B2A4A] mb-5">Mes documents</h2>
            <div className="space-y-3">
              {groupedDocuments.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1B2A4A] truncate">{doc.type_document}</p>
                    {doc.side && <p className="text-xs text-gray-400 capitalize">{doc.side}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {doc.validation_status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                        <Clock className="w-3 h-3" /> En attente
                      </span>
                    )}
                    {doc.validation_status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Valide
                      </span>
                    )}
                    {doc.validation_status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Refuse
                      </span>
                    )}
                    <SimpleDownloadButton
                      url={doc.url}
                      filename={doc.nom_fichier || doc.type_document}
                      trackingNumber={order.tracking_number}
                      variant="ghost"
                      size="icon"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== Need Help ===== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-lg font-bold text-[#1B2A4A] mb-5">Besoin d'aide ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href={`mailto:${siteConfig.emails.support}`}
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-[#1B2A4A] text-sm">Email</p>
                <p className="text-xs text-gray-400">{siteConfig.emails.support}</p>
              </div>
            </a>
            <a
              href="/faq"
              className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <HelpCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-[#1B2A4A] text-sm">FAQ</p>
                <p className="text-xs text-gray-400">Questions frequentes</p>
              </div>
            </a>
          </div>
        </section>

        {/* ===== Footer branding ===== */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            {siteConfig.siteName} &middot; {siteConfig.domain}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuiviCommande;
