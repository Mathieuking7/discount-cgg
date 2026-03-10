import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DocumentUpload } from "@/components/DocumentUpload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { QuestionnaireResponses } from "@/components/QuestionnaireResponses";
import {
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Upload,
  Eye,
  Mail,
  Phone,
  Zap,
  FileCheck as FileCheckIcon,
  CreditCard,
  Loader2,
  Plus,
  Car,
  Clock,
  Gift,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FactureButton } from "@/components/FactureButton";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site.config";

const statusLabels: Record<string, string> = {
  en_saisie: "En saisie",
  en_attente: "En attente",
  paye: "Paye",
  valide: "Valide",
  finalise: "Finalise",
  refuse: "Refuse",
};

const typeLabels: Record<string, string> = {
  DA: "Declaration d'achat",
  DC: "Declaration de cession",
  CG: "Carte grise",
  CG_DA: "CG + DA",
  DA_DC: "DA + DC",
  CG_IMPORT: "Import etranger",
};

// Stepper steps
const progressSteps = [
  { key: "en_attente", label: "Soumise", icon: Clock },
  { key: "paye", label: "Payee", icon: CreditCard },
  { key: "valide", label: "Validee", icon: CheckCircle },
  { key: "finalise", label: "Finalisee", icon: FileText },
];

function getStepIndex(status: string): number {
  if (status === "refuse") return -1;
  const idx = progressSteps.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export default function DemarcheDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demarche, setDemarche] = useState<any>(null);
  const [vehicule, setVehicule] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [documentLabels, setDocumentLabels] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [trackingServices, setTrackingServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [uploadSlots, setUploadSlots] = useState<number[]>([1]);
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
    type: string;
  }>({ isOpen: false, url: "", name: "", type: "" });

  useEffect(() => {
    if (searchParams.get("resubmission_paid") === "true") {
      toast({ title: "Paiement accepte", description: "Vous pouvez maintenant renvoyer vos documents." });
      window.history.replaceState({}, "", `/demarche/${id}`);
    }
  }, [searchParams, id, toast]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) loadData();
  }, [user, id]);

  const loadData = async () => {
    if (!user || !id) return;
    const { data: garageData } = await supabase.from("garages").select("*").eq("user_id", user.id).single();
    if (!garageData) {
      toast({ title: "Erreur", description: "Garage non trouve", variant: "destructive" });
      navigate("/dashboard");
      return;
    }
    const { data: demarcheData } = await supabase.from("demarches").select("*").eq("id", id).eq("garage_id", garageData.id).single();
    if (!demarcheData) {
      toast({ title: "Erreur", description: "Demarche non trouvee", variant: "destructive" });
      navigate("/mes-demarches");
      return;
    }
    setDemarche(demarcheData);
    if (demarcheData.vehicule_id) {
      const { data: vehiculeData } = await supabase.from("vehicules").select("*").eq("id", demarcheData.vehicule_id).single();
      if (vehiculeData) setVehicule(vehiculeData);
    }
    const { data: documentsData } = await supabase.from("documents").select("*").eq("demarche_id", id).order("created_at", { ascending: false });
    const uniqueDocs = documentsData ? Array.from(new Map(documentsData.map((doc) => [doc.id, doc])).values()) : [];
    setDocuments(uniqueDocs);
    const { data: notifData } = await supabase.from("notifications").select("*").eq("demarche_id", id).order("created_at", { ascending: false });
    setNotifications(notifData || []);
    const { data: trackingData } = await supabase.from("tracking_services").select("*").eq("demarche_id", id);
    setTrackingServices(trackingData || []);
    const { data: actionData } = await supabase.from("actions_rapides").select("id").eq("code", demarcheData.type).single();
    if (actionData) {
      const { data: actionDocs } = await supabase.from("action_documents").select("*").eq("action_id", actionData.id).order("ordre");
      if (actionDocs) {
        const labels: Record<string, string> = {};
        actionDocs.forEach((doc, idx) => { labels[`doc_${idx + 1}`] = doc.nom_document; });
        setDocumentLabels(labels);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`demarche-detail-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "documents", filter: `demarche_id=eq.${id}` }, () => loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "demarches", filter: `id=eq.${id}` }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const getValidationBadge = (status: string) => {
    switch (status) {
      case "validated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold bg-green-50 text-green-800 border border-green-300 font-sans">
            <CheckCircle className="h-3 w-3" /> Valide
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold bg-[#ED2939]/10 text-[#ED2939] border border-[#ED2939]/30 font-sans">
            <XCircle className="h-3 w-3" /> Refuse
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 font-sans">
            <AlertCircle className="h-3 w-3" /> En attente
          </span>
        );
    }
  };

  const handleResubmissionPayment = async () => {
    if (!demarche) return;
    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-resubmission-payment", {
        body: { demarche_id: demarche.id, amount: demarche.resubmission_payment_amount || 10 },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
      else throw new Error("URL de paiement non recue");
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de creer le paiement", variant: "destructive" });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const isUploadBlocked = demarche?.requires_resubmission_payment && !demarche?.resubmission_paid;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002395] mx-auto" />
          <p className="mt-4 text-gray-500 font-sans">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!demarche) return null;

  const rejectedDocuments = documents.filter((d) => d.validation_status === "rejected");
  const currentStepIdx = getStepIndex(demarche.status);
  const isRefused = demarche.status === "refuse";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => navigate("/mes-demarches")}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1A1A1A] transition-colors mb-6 min-h-[48px] font-sans"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a mes demarches
          </button>
        </motion.div>

        {/* Status Banner - full width */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {(demarche.paye || demarche.status === "paye") && !isRefused && (
            <div className="mb-6 p-4 bg-green-600 text-white flex items-center gap-3">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold font-sans">Paiement accepte</p>
                <p className="text-sm opacity-90 font-sans">Votre paiement a ete valide avec succes</p>
              </div>
            </div>
          )}
          {isRefused && (
            <div className="mb-6 p-4 bg-[#ED2939] text-white flex items-center gap-3">
              <XCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold font-sans">Demarche refusee</p>
                <p className="text-sm opacity-90 font-sans">Consultez les commentaires pour plus d'informations.</p>
              </div>
            </div>
          )}
          {demarche.is_free_token && !demarche.paye && !isRefused && (
            <div className="mb-6 p-4 bg-emerald-600 text-white flex items-center gap-3">
              <Gift className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold font-sans">Demarche offerte</p>
                <p className="text-sm opacity-90 font-sans">Cette demarche est gratuite grace a votre jeton offert</p>
              </div>
            </div>
          )}
          {demarche.status === "en_attente" && !demarche.paye && !demarche.is_free_token && (
            <div className="mb-6 p-4 bg-amber-500 text-white flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                <p className="font-semibold font-sans">En attente de paiement</p>
                <p className="text-sm opacity-90 font-sans">Veuillez proceder au paiement pour finaliser votre demarche</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Progress Stepper - editorial numbered steps */}
        {!isRefused && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border-b border-gray-200 pb-8 mb-8"
          >
            <p className="text-xs uppercase tracking-widest text-gray-500 font-sans mb-6">Progression</p>
            <div className="flex items-start">
              {progressSteps.map((step, i) => {
                const isCompleted = currentStepIdx > i;
                const isCurrent = currentStepIdx === i;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {/* Connector line */}
                    {i > 0 && (
                      <div className="absolute top-5 right-1/2 w-full h-px -z-0">
                        <div className={`h-full ${isCompleted || isCurrent ? "bg-[#002395]" : "bg-gray-200"} transition-colors`} />
                      </div>
                    )}
                    <div
                      className={`relative z-10 w-10 h-10 flex items-center justify-center text-sm font-bold font-sans transition-all ${
                        isCompleted
                          ? "bg-[#002395] text-white"
                          : isCurrent
                          ? "bg-white text-[#002395] border-2 border-[#002395]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <span
                      className={`mt-3 text-xs font-sans font-medium ${
                        isCompleted || isCurrent ? "text-[#1A1A1A]" : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-0">
            {/* Demarche Info */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="border-b border-gray-200 pb-8 mb-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-block font-mono text-xs font-semibold text-[#002395] mb-2">
                    {demarche.numero_demarche}
                  </span>
                  <h2 className="text-2xl font-serif text-[#1A1A1A]">{typeLabels[demarche.type]}</h2>
                  <p className="text-gray-500 text-sm mt-1 font-sans">Immatriculation : {demarche.immatriculation}</p>
                </div>
                {demarche.facture_id && (
                  <FactureButton demarcheId={demarche.id} existingFactureId={demarche.facture_id} onFactureGenerated={loadData} />
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 border-t border-gray-200">
                <div className="border-b border-r border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Montant TTC</p>
                  <p className="text-lg font-bold text-[#1A1A1A] font-sans">{formatPrice(demarche.montant_ttc || 0)} EUR</p>
                </div>
                <div className="border-b border-r border-gray-200 p-4 sm:border-r">
                  <p className="text-xs text-gray-500 font-sans mb-1">Date de creation</p>
                  <p className="font-semibold text-[#1A1A1A] font-sans">{new Date(demarche.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="border-b border-gray-200 p-4">
                  <p className="text-xs text-gray-500 font-sans mb-1">Paiement</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold font-sans ${
                      demarche.paye ? "bg-green-50 text-green-800 border border-green-300" : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {demarche.paye ? (
                      <><CheckCircle className="h-3 w-3" /> Paye</>
                    ) : (
                      "Non paye"
                    )}
                  </span>
                </div>
              </div>
              {demarche.commentaire && (
                <div className="mt-6 border-l-4 border-amber-400 pl-4 py-3 bg-amber-50/40">
                  <p className="text-xs text-amber-700 font-semibold mb-1 font-sans">Commentaire</p>
                  <p className="text-sm text-[#1A1A1A] font-sans">{demarche.commentaire}</p>
                </div>
              )}
            </motion.div>

            {/* Vehicule Info - clean label-value pairs */}
            {vehicule && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="border-b border-gray-200 pb-8 mb-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Car className="h-5 w-5 text-[#002395]" />
                  <h3 className="font-serif text-lg text-[#1A1A1A]">Informations du vehicule</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: "Immatriculation", value: vehicule.immatriculation },
                    { label: "Marque", value: vehicule.marque },
                    { label: "Modele", value: vehicule.modele },
                    { label: "Version", value: vehicule.version },
                    { label: "Couleur", value: vehicule.couleur },
                    { label: "VIN", value: vehicule.vin },
                    { label: "N. de formule", value: vehicule.numero_formule },
                    { label: "Carrosserie", value: vehicule.carrosserie },
                    { label: "Genre", value: vehicule.genre },
                    { label: "Type", value: vehicule.type },
                    { label: "Energie", value: vehicule.energie },
                    { label: "Puissance fiscale", value: vehicule.puiss_fisc ? `${vehicule.puiss_fisc} CV` : null },
                    { label: "Puissance DIN", value: vehicule.puiss_ch ? `${vehicule.puiss_ch} ch` : null },
                    { label: "Cylindree", value: vehicule.cylindree ? `${vehicule.cylindree} cm3` : null },
                    { label: "CO2", value: vehicule.co2 ? `${vehicule.co2} g/km` : null },
                    { label: "PTAC", value: vehicule.ptr ? `${vehicule.ptr} kg` : null },
                    { label: "Date de MEC", value: vehicule.date_mec ? new Date(vehicule.date_mec).toLocaleDateString("fr-FR") : null },
                    { label: "Date CG", value: vehicule.date_cg ? new Date(vehicule.date_cg).toLocaleDateString("fr-FR") : null },
                  ]
                    .filter((f) => f.value)
                    .map((field) => (
                      <div key={field.label} className="flex items-center justify-between py-3">
                        <p className="text-sm text-gray-500 font-sans">{field.label}</p>
                        <p className="font-medium text-[#1A1A1A] text-sm font-sans">{field.value}</p>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Questionnaire Responses */}
            <QuestionnaireResponses demarcheId={demarche.id} />

            {/* Options souscrites */}
            {trackingServices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="border-b border-gray-200 pb-8 mb-8"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-[#002395]" />
                  <h3 className="font-serif text-lg text-[#1A1A1A]">Options souscrites</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {trackingServices.map((service) => {
                    const serviceLabels: Record<string, { name: string; icon: any }> = {
                      dossier_prioritaire: { name: "Dossier prioritaire", icon: Zap },
                      certificat_non_gage: { name: "Certificat de non gage", icon: FileCheckIcon },
                      email: { name: "Suivi par email", icon: Mail },
                      phone: { name: "Suivi par SMS", icon: Phone },
                      email_phone: { name: "Suivi complet (Email + SMS)", icon: CheckCircle },
                    };
                    const serviceInfo = serviceLabels[service.service_type] || { name: service.service_type, icon: CheckCircle };
                    const Icon = serviceInfo.icon;
                    return (
                      <div key={service.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-[#002395]" />
                          <span className="text-sm font-sans text-[#1A1A1A]">{serviceInfo.name}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-sans">{service.price} EUR</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Documents de l'administration */}
            {documents.filter((d) => d.type_document === "admin_document").length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="border-b border-gray-200 pb-8 mb-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-[#002395]" />
                  <h3 className="font-serif text-lg text-[#1A1A1A]">Documents de l'administration</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 font-sans">Documents officiels mis a disposition</p>
                <div className="divide-y divide-gray-100">
                  {documents.filter((d) => d.type_document === "admin_document").map((doc) => (
                    <div key={doc.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#1A1A1A] text-sm font-sans">{doc.nom_fichier}</p>
                        <p className="text-xs text-gray-400 font-sans">{new Date(doc.created_at).toLocaleDateString("fr-FR")}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getValidationBadge(doc.validation_status)}
                        <Button
                          size="sm"
                          onClick={() => setViewerState({ isOpen: true, url: doc.url, name: doc.nom_fichier, type: doc.type_document })}
                          className="rounded-md h-10 px-4 text-xs bg-[#002395] hover:bg-[#001a6e] font-sans min-h-[48px]"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Voir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-b border-gray-200 pb-8 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-serif text-lg text-[#1A1A1A]">Documents</h3>
              </div>
              {documents.filter((d) => d.type_document !== "admin_document").length === 0 ? (
                <p className="text-center text-gray-400 py-6 text-sm font-sans">Aucun document</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {documents.filter((d) => d.type_document !== "admin_document").map((doc) => (
                    <div key={doc.id} className="py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          {(doc.type_document?.startsWith("autre_piece") && doc.document_type) ? (
                            <p className="text-xs font-semibold text-[#002395] uppercase mb-1 font-sans">{doc.document_type}</p>
                          ) : documentLabels[doc.type_document] ? (
                            <p className="text-xs font-semibold text-[#002395] uppercase mb-1 font-sans">{documentLabels[doc.type_document]}</p>
                          ) : null}
                          <p className="font-medium text-[#1A1A1A] text-sm font-sans">{doc.nom_fichier}</p>
                          <p className="text-xs text-gray-400 font-sans">{new Date(doc.created_at).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getValidationBadge(doc.validation_status)}
                          <Button
                            size="sm"
                            onClick={() => setViewerState({ isOpen: true, url: doc.url, name: doc.nom_fichier, type: doc.type_document })}
                            className="rounded-md h-10 px-4 text-xs bg-[#002395] hover:bg-[#001a6e] font-sans min-h-[48px]"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Voir
                          </Button>
                        </div>
                      </div>
                      {doc.validation_status === "rejected" && doc.validation_comment && (
                        <div className="mt-3 border-l-4 border-[#ED2939] pl-4 py-2 bg-red-50/40">
                          <p className="text-xs font-semibold text-[#ED2939] mb-1 font-sans">Raison du refus :</p>
                          <p className="text-sm text-[#1A1A1A] font-sans">{doc.validation_comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Resubmission Payment */}
            {isUploadBlocked && (
              <div className="border-l-4 border-amber-400 bg-amber-50/40 p-6 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-amber-700" />
                  <h3 className="font-semibold text-amber-800 font-sans">Paiement requis</h3>
                </div>
                <p className="text-sm text-amber-700 mb-4 font-sans">
                  Suite a des documents non conformes, un paiement de {demarche.resubmission_payment_amount || 10} EUR est requis pour pouvoir renvoyer vos documents.
                </p>
                <Button
                  onClick={handleResubmissionPayment}
                  disabled={isProcessingPayment}
                  className="rounded-md h-12 px-6 bg-amber-600 hover:bg-amber-700 text-white w-full font-sans"
                >
                  {isProcessingPayment ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirection...</>
                  ) : (
                    <><CreditCard className="mr-2 h-4 w-4" /> Payer {demarche.resubmission_payment_amount || 10} EUR pour renvoyer</>
                  )}
                </Button>
              </div>
            )}

            {/* Replace rejected docs */}
            {rejectedDocuments.length > 0 && (
              <div className="border-b border-gray-200 pb-8 mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="h-5 w-5 text-amber-600" />
                  <h3 className="font-serif text-lg text-[#1A1A1A]">Remplacer les documents refuses</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 font-sans">
                  {isUploadBlocked
                    ? "Veuillez d'abord effectuer le paiement ci-dessus pour pouvoir renvoyer vos documents."
                    : "Certains documents ont ete refuses. Veuillez uploader de nouveaux documents."}
                </p>
                <div className="space-y-4">
                  {uploadSlots.map((slotId, index) => (
                    <DocumentUpload
                      key={slotId}
                      demarcheId={demarche.id}
                      documentType={`correction_${slotId}`}
                      label={`Document ${index + 1}`}
                      onUploadComplete={loadData}
                      isBlocked={isUploadBlocked}
                      blockedMessage="Paiement requis pour renvoyer des documents"
                    />
                  ))}
                  {!isUploadBlocked && (
                    <Button
                      variant="outline"
                      onClick={() => setUploadSlots((prev) => [...prev, Math.max(...prev) + 1])}
                      className="w-full rounded-md h-12 border-dashed border-2 font-sans"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter un document
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Add supplementary docs */}
            {(demarche.paye || demarche.status === "paye" || demarche.status === "valide" || demarche.status === "en_attente") &&
              !isUploadBlocked &&
              rejectedDocuments.length === 0 && (
                <div className="border-b border-gray-200 pb-8 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-5 w-5 text-[#002395]" />
                    <h3 className="font-serif text-lg text-[#1A1A1A]">Ajouter des documents supplementaires</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 font-sans">
                    Vous avez oublie un document ? Ajoutez-le ici. L'administration sera notifiee automatiquement.
                  </p>
                  <div className="space-y-4">
                    {uploadSlots.map((slotId, index) => (
                      <DocumentUpload
                        key={slotId}
                        demarcheId={demarche.id}
                        documentType={`autre_piece_${slotId}`}
                        label={`Document supplementaire ${index + 1}`}
                        customName={`Piece supplementaire ${index + 1}`}
                        onUploadComplete={loadData}
                      />
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => setUploadSlots((prev) => [...prev, Math.max(...prev) + 1])}
                      className="w-full rounded-md h-12 border-dashed border-2 font-sans"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Ajouter un autre document
                    </Button>
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="border-l-4 border-[#002395] pl-6"
            >
              <h3 className="font-serif text-lg text-[#1A1A1A] mb-4">Informations</h3>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-xs text-gray-500 font-sans">N. de demarche</p>
                  <p className="font-mono text-sm font-semibold text-[#002395]">{demarche.numero_demarche}</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-xs text-gray-500 font-sans">Statut</p>
                  <p className="font-medium text-[#1A1A1A] font-sans">{statusLabels[demarche.status]}</p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <p className="text-xs text-gray-500 font-sans">Documents complets</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-semibold font-sans ${
                      demarche.documents_complets
                        ? "bg-green-50 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {demarche.documents_complets ? "Oui" : "Non"}
                  </span>
                </div>
                {demarche.validated_at && (
                  <div>
                    <p className="text-xs text-gray-500 font-sans">Valide le</p>
                    <p className="font-medium text-[#1A1A1A] font-sans">{new Date(demarche.validated_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Processing notice */}
            {demarche.status === "en_attente" && (
              <>
                <div className="border-l-4 border-amber-400 pl-6 py-4 bg-amber-50/40">
                  <h3 className="font-semibold text-amber-800 mb-2 font-sans">En cours de traitement</h3>
                  <p className="text-sm text-amber-700 font-sans">
                    Votre demarche est en cours de verification par notre equipe. Vous serez notifie des que le traitement sera termine.
                  </p>
                </div>

                {notifications.length > 0 && (
                  <div>
                    <h3 className="font-serif text-lg text-[#1A1A1A] mb-4">Messages de l'administration</h3>
                    <div className="space-y-4">
                      {notifications.map((notif) => (
                        <div key={notif.id} className="border-l-4 border-[#002395] pl-4 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[#002395]/10 text-[#002395] border border-[#002395]/20 font-sans">
                              {notif.type}
                            </span>
                            <span className="text-xs text-gray-400 font-sans">
                              {new Date(notif.created_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-[#1A1A1A] font-sans">{notif.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DocumentViewer
        isOpen={viewerState.isOpen}
        onClose={() => setViewerState({ isOpen: false, url: "", name: "", type: "" })}
        documentUrl={viewerState.url}
        documentName={viewerState.name}
        documentType={viewerState.type}
      />
    </div>
  );
}
