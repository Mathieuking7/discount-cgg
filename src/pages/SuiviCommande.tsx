import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  CheckCircle,
  Clock,
  Package,
  Truck,
  FileCheck,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Download,
  CreditCard,
  Ban,
  Send,
  CheckCircle2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GuestDocumentUpload } from "@/components/GuestDocumentUpload";
import { SimpleDownloadButton } from "@/components/SimpleDownloadButton";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

const SuiviCommande = () => {
  const { trackingNumber } = useParams();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [adminDocuments, setAdminDocuments] = useState<any[]>([]);
  const [adminSentDocuments, setAdminSentDocuments] = useState<any[]>([]);
  const [carteGriseUrl, setCarteGriseUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [factureUrl, setFactureUrl] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [reuploadedDocs, setReuploadedDocs] = useState<Set<string>>(new Set());
  const [isSubmittingReupload, setIsSubmittingReupload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRequiredDocuments();
    loadOrder();
    loadDocuments();
  }, [trackingNumber]);

  const loadRequiredDocuments = async () => {
    const { data } = await supabase
      .from("guest_order_required_documents")
      .select("*")
      .eq("actif", true)
      .order("ordre");

    if (data) {
      setRequiredDocuments(data);
    }
  };

  const loadOrder = async () => {
    if (!trackingNumber) return;

    try {
      const { data: response, error } = await supabase.functions.invoke('get-guest-order', {
        body: { tracking_number: trackingNumber }
      });

      if (error || !response?.success || !response?.data?.order) {
        toast({
          title: "Commande introuvable",
          description: "Verifiez votre numero de suivi",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const orderData = response.data.order;
      setOrder(orderData);
      setDocuments(response.data.documents || []);
      setAdminSentDocuments(response.data.adminDocuments || []);
      setIsLoading(false);

      const carteGriseDoc = (response.data.documents || []).find(
        (doc: any) => doc.type_document === 'carte_grise_finale'
      );

      if (carteGriseDoc) {
        setCarteGriseUrl(carteGriseDoc.url);
      }

      const { data: facture } = await supabase
        .from('factures')
        .select('pdf_url')
        .eq('guest_order_id', orderData.id)
        .single();

      if (facture?.pdf_url) {
        setFactureUrl(facture.pdf_url);
      }
    } catch (err) {
      console.error('Error loading order:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger la commande",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleResubmissionPayment = async () => {
    if (!order) return;

    setIsProcessingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-resubmission-payment', {
        body: {
          order_id: order.id,
          amount: order.resubmission_payment_amount || 10,
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de creer le paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const loadDocuments = async () => {
    if (!trackingNumber || !order) return;

    try {
      const { data: response, error } = await supabase.functions.invoke('get-guest-order', {
        body: { tracking_number: trackingNumber }
      });

      if (error || !response?.success) return;

      const allDocs = response.data.documents || [];

      const customerDocs = allDocs.filter((doc: any) =>
        doc.type_document !== 'carte_grise_finale' &&
        !doc.type_document?.startsWith('admin_')
      );

      setDocuments(customerDocs);

      const adminDocs = allDocs.filter((doc: any) =>
        doc.type_document?.startsWith('admin_')
      );
      setAdminDocuments(adminDocs);

      setAdminSentDocuments(response.data.adminDocuments || []);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "en_attente":
        return { label: "En attente de paiement", color: "bg-yellow-400", textColor: "text-yellow-700", bgLight: "bg-yellow-50", icon: Clock };
      case "paye":
        return { label: "Paiement recu", color: "bg-blue-400", textColor: "text-blue-700", bgLight: "bg-blue-50", icon: CheckCircle };
      case "en_traitement":
        return { label: "En traitement", color: "bg-blue-400", textColor: "text-blue-700", bgLight: "bg-blue-50", icon: Package };
      case "valide":
        return { label: "Valide", color: "bg-emerald-400", textColor: "text-emerald-700", bgLight: "bg-emerald-50", icon: FileCheck };
      case "finalise":
        return { label: "Termine", color: "bg-emerald-500", textColor: "text-emerald-700", bgLight: "bg-emerald-50", icon: Truck };
      case "refuse":
        return { label: "Refuse", color: "bg-red-400", textColor: "text-red-700", bgLight: "bg-red-50", icon: Clock };
      default:
        return { label: status, color: "bg-gray-400", textColor: "text-gray-700", bgLight: "bg-gray-50", icon: Clock };
    }
  };

  const getSteps = () => {
    return [
      { label: "Commande creee", status: order?.created_at ? "completed" : "pending", date: order?.created_at },
      { label: "Paiement recu", status: order?.paye ? "completed" : "pending", date: order?.paid_at },
      { label: "En traitement", status: ["en_traitement", "valide", "finalise"].includes(order?.status) ? "completed" : "pending", date: null },
      { label: "Valide", status: ["valide", "finalise"].includes(order?.status) ? "completed" : "pending", date: order?.validated_at },
      { label: "Termine", status: order?.status === "finalise" ? "completed" : "pending", date: null },
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF8F0]">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Commande introuvable</h1>
            <p className="text-gray-500">Verifiez votre numero de suivi et reessayez</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;
  const steps = getSteps();

  const groupedDocuments = documents.reduce((acc: any[], doc) => {
    if (doc.side === 'verso' && !doc.url) return acc;
    acc.push(doc);
    return acc;
  }, []);

  const rejectedDocTypes = [...new Set(
    documents
      .filter(doc => doc.validation_status === 'rejected')
      .map(doc => doc.type_document)
  )];

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Suivi de commande</h1>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border-2 border-amber-300 shadow-sm">
              <span className="text-sm text-gray-500">N de suivi</span>
              <span className="text-lg font-bold text-amber-600">{order.tracking_number}</span>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`w-14 h-14 ${statusInfo.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <StatusIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-2xl font-bold text-gray-900">{statusInfo.label}</p>
                  {order.demarche_type && order.demarche_type !== 'CG' && (
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      {order.demarche_type === 'DA' ? "Declaration d'achat" :
                       order.demarche_type === 'DC' ? "Declaration de cession" : ""}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Immatriculation: {order.immatriculation}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Progression de votre commande</h2>
            <div className="space-y-0">
              {steps.map((step, index) => {
                const isCompleted = step.status === "completed";
                const isLast = index === steps.length - 1;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-white border-gray-200 text-gray-400"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div className={cn(
                          "w-0.5 h-10",
                          isCompleted ? "bg-emerald-400" : "bg-gray-200"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className={cn("font-semibold", isCompleted ? "text-gray-900" : "text-gray-400")}>{step.label}</p>
                      {step.date && (
                        <p className="text-sm text-gray-400 mt-0.5">
                          {new Date(step.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900">Contact</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-800">Nom:</span> {order.prenom} {order.nom}</p>
                <p><span className="font-medium text-gray-800">Email:</span> {order.email}</p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {order.telephone}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900">Adresse</h3>
              </div>
              <div className="text-sm text-gray-600">
                <p>{order.adresse}</p>
                <p>{order.code_postal} {order.ville}</p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Options souscrites</h2>
            <div className="space-y-3">
              {order.dossier_prioritaire && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-orange-400 text-white rounded-full">Prioritaire</span>
                    <span className="text-sm text-gray-700">Dossier Prioritaire</span>
                  </div>
                  <span className="text-sm text-orange-600 font-semibold">+5,00 EUR</span>
                </div>
              )}

              {order.certificat_non_gage && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-blue-400 text-white rounded-full">Non-gage</span>
                    <span className="text-sm text-gray-700">Certificat de non-gage</span>
                  </div>
                  <span className="text-sm text-blue-600 font-semibold">+10,00 EUR</span>
                </div>
              )}

              {order.email_notifications ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-400 text-white rounded-full">Email</span>
                    <span className="text-sm text-gray-700">Suivi par email</span>
                  </div>
                  <span className="text-sm text-emerald-600 font-semibold">Gratuit</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-200 text-gray-500 rounded-full">Email</span>
                    <span className="text-sm text-gray-400">Suivi par email</span>
                  </div>
                  <span className="text-sm text-gray-400">Non souscrit</span>
                </div>
              )}

              {order.sms_notifications ? (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-amber-400 text-white rounded-full">SMS</span>
                    <span className="text-sm text-gray-700">Suivi par SMS</span>
                  </div>
                  <span className="text-sm text-amber-600 font-semibold">5,00 EUR</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium bg-gray-200 text-gray-500 rounded-full">SMS</span>
                    <span className="text-sm text-gray-400">Suivi par SMS</span>
                  </div>
                  <span className="text-sm text-gray-400">Non souscrit</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations complementaires</h2>
            {order.has_cotitulaire && (
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 mb-4">
                <p className="text-sm font-semibold text-purple-700 mb-1">Co-titulaire</p>
                <p className="font-medium text-gray-800">{order.cotitulaire_prenom} {order.cotitulaire_nom}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Vehicule achete chez un pro", value: order.vehicule_pro },
                { label: "Leasing/LLD/LOA", value: order.vehicule_leasing },
                { label: "Mineur (-18 ans)", value: order.is_mineur },
                { label: "Heberge", value: order.is_heberge },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-sm text-gray-600">{item.label}</span>
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-full",
                    item.value ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-500"
                  )}>
                    {item.value ? "Oui" : "Non"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Processing info */}
          {order.status !== "finalise" && (
            <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Delai de traitement</p>
                  <p className="text-sm text-gray-600">
                    Votre carte grise sera traitee sous 24h ouvrees maximum apres validation de votre dossier.
                    Vous recevrez un email de confirmation a chaque etape.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Admin comment */}
          {order.commentaire && (
            <div className="bg-yellow-50 rounded-3xl border border-yellow-200 p-6">
              <h3 className="font-semibold text-yellow-700 mb-2">Message de l'administration</h3>
              <p className="text-gray-700">{order.commentaire}</p>
            </div>
          )}

          {/* Facture */}
          {factureUrl && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-900">Facture</h3>
              </div>
              <a
                href={factureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors font-medium text-sm shadow-sm"
              >
                <Download className="w-4 h-4" />
                Telecharger ma facture
              </a>
            </div>
          )}

          {/* Admin Documents */}
          {(adminDocuments.length > 0 || adminSentDocuments.length > 0) && (
            <div className="bg-white rounded-3xl shadow-sm border-2 border-amber-300 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-bold text-gray-900">Documents de l'administration</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Documents envoyes par notre equipe pour votre dossier</p>
              <div className="space-y-3">
                {adminSentDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{doc.nom_fichier}</p>
                      {doc.description && <p className="text-sm text-gray-500">{doc.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        Envoye le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <SimpleDownloadButton
                      url={doc.url}
                      filename={doc.nom_fichier}
                      trackingNumber={trackingNumber}
                      variant="default"
                      size="default"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Telecharger
                    </SimpleDownloadButton>
                  </div>
                ))}
                {adminDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{doc.type_document.replace('admin_', '')}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Envoye le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <SimpleDownloadButton
                      url={doc.url}
                      filename={doc.nom_fichier || doc.type_document}
                      trackingNumber={trackingNumber}
                      variant="default"
                      size="default"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Telecharger
                    </SimpleDownloadButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carte Grise Finale */}
          {carteGriseUrl && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-emerald-300 p-8 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-md">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">
                Votre carte grise est disponible !
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Felicitations ! Votre carte grise a ete traitee et est maintenant disponible au telechargement.
              </p>
              <a
                href={carteGriseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all font-semibold text-lg shadow-md hover:shadow-lg"
              >
                <Download className="w-6 h-6" />
                Telecharger ma carte grise
              </a>
              <p className="text-sm text-gray-500 mt-4">
                Conservez precieusement ce document.
              </p>
            </div>
          )}

          {/* My Documents */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="font-bold text-gray-900">Mes documents</h3>
            </div>
            <div className="space-y-4">
              {groupedDocuments.length > 0 ? (
                groupedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{doc.type_document}</p>
                      {doc.side && <p className="text-sm text-gray-400 capitalize">{doc.side}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        Envoye le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      {doc.rejection_reason && (
                        <div className="mt-2 p-2.5 bg-red-50 border border-red-100 rounded-xl">
                          <p className="text-xs font-semibold text-red-600">Raison du rejet:</p>
                          <p className="text-xs text-red-500">{doc.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.validation_status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                          <Clock className="w-3 h-3" />
                          En attente
                        </span>
                      )}
                      {doc.validation_status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Valide
                        </span>
                      )}
                      {doc.validation_status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          Refuse
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
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">
                  Aucun document envoye pour le moment
                </p>
              )}

              {/* Rejected docs re-upload */}
              {rejectedDocTypes.length > 0 && (
                <div className={cn(
                  "mt-6 p-5 rounded-2xl border transition-all duration-500",
                  reuploadedDocs.size === rejectedDocTypes.length
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                )}>
                  <h3 className={cn(
                    "font-semibold mb-2 flex items-center gap-2 transition-colors duration-300",
                    reuploadedDocs.size === rejectedDocTypes.length
                      ? "text-emerald-700"
                      : "text-red-700"
                  )}>
                    {reuploadedDocs.size === rejectedDocTypes.length ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Documents prets a etre envoyes
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        Documents a renvoyer ({reuploadedDocs.size}/{rejectedDocTypes.length})
                      </>
                    )}
                  </h3>

                  {order.requires_resubmission_payment && !order.resubmission_paid ? (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl mb-4">
                      <div className="flex items-start gap-3">
                        <Ban className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-orange-700 mb-2">
                            Paiement requis pour renvoyer vos documents
                          </p>
                          <p className="text-sm text-orange-600 mb-4">
                            Suite a des documents non conformes, un paiement de <strong>{order.resubmission_payment_amount || 10} EUR</strong> est
                            requis avant de pouvoir soumettre de nouveaux documents.
                          </p>
                          <button
                            onClick={handleResubmissionPayment}
                            disabled={isProcessingPayment}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50"
                          >
                            {isProcessingPayment ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Chargement...
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4" />
                                Payer {order.resubmission_payment_amount || 10} EUR pour renvoyer
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-4">
                      {reuploadedDocs.size === rejectedDocTypes.length
                        ? "Tous les documents ont ete telecharges. Cliquez sur 'Valider' pour les envoyer."
                        : "Certains documents ont ete refuses. Veuillez les renvoyer ci-dessous."}
                    </p>
                  )}

                  {rejectedDocTypes.map(docType => {
                    const isBlocked = order.requires_resubmission_payment && !order.resubmission_paid;
                    const isReuploaded = reuploadedDocs.has(docType);
                    const newDoc = documents.find(d =>
                      d.type_document === docType &&
                      d.validation_status === 'pending'
                    );
                    const rejectedDoc = documents.find(d =>
                      d.type_document === docType &&
                      d.validation_status === 'rejected'
                    );

                    return (
                      <div
                        key={docType}
                        className={cn(
                          "mb-4 p-4 rounded-2xl border transition-all duration-500",
                          isReuploaded || newDoc
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-white border-red-200"
                        )}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2 text-gray-800">
                              {docType}
                              {(isReuploaded || newDoc) && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Nouveau fichier ajoute
                                </span>
                              )}
                            </p>
                            {rejectedDoc?.rejection_reason && !isReuploaded && !newDoc && (
                              <p className="text-sm text-red-500 mt-1">
                                Raison: {rejectedDoc.rejection_reason}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isReuploaded && !newDoc && (
                          <GuestDocumentUpload
                            orderId={order.id}
                            documentType={docType}
                            label={`Renvoyer: ${docType}`}
                            existingFiles={[]}
                            isBlocked={isBlocked}
                            blockedMessage={`Veuillez payer ${order.resubmission_payment_amount || 10} EUR pour pouvoir renvoyer ce document.`}
                            onUploadComplete={() => {
                              setReuploadedDocs(prev => new Set([...prev, docType]));
                              loadDocuments();
                              loadOrder();
                              toast({
                                title: "Document telecharge",
                                description: "N'oubliez pas de cliquer sur 'Valider' pour envoyer vos documents.",
                              });
                            }}
                          />
                        )}

                        {(isReuploaded || newDoc) && newDoc && (
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-emerald-700">{newDoc.nom_fichier}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Validate button */}
                  {!(order.requires_resubmission_payment && !order.resubmission_paid) && reuploadedDocs.size > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <button
                        onClick={async () => {
                          setIsSubmittingReupload(true);
                          try {
                            await supabase
                              .from('guest_orders')
                              .update({
                                documents_complets: true,
                                status: 'en_traitement'
                              })
                              .eq('id', order.id);

                            if (order.email) {
                              await supabase.functions.invoke('send-guest-order-email', {
                                body: {
                                  type: 'documents_received',
                                  orderData: {
                                    tracking_number: order.tracking_number,
                                    email: order.email,
                                    nom: order.nom,
                                    prenom: order.prenom,
                                    immatriculation: order.immatriculation,
                                    montant_ttc: order.montant_ttc,
                                    marque: order.marque,
                                    modele: order.modele,
                                  }
                                }
                              });
                            }

                            toast({
                              title: "Documents envoyes !",
                              description: "Vos documents ont ete soumis avec succes.",
                            });

                            setReuploadedDocs(new Set());
                            loadDocuments();
                            loadOrder();
                          } catch (error) {
                            console.error('Error submitting:', error);
                            toast({
                              title: "Erreur",
                              description: "Une erreur est survenue lors de l'envoi.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsSubmittingReupload(false);
                          }
                        }}
                        disabled={isSubmittingReupload || reuploadedDocs.size === 0}
                        className={cn(
                          "w-full h-12 rounded-full font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50",
                          reuploadedDocs.size === rejectedDocTypes.length
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-amber-500 hover:bg-amber-600"
                        )}
                      >
                        {isSubmittingReupload ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Valider et envoyer mes documents ({reuploadedDocs.size}/{rejectedDocTypes.length})
                          </>
                        )}
                      </button>
                      {reuploadedDocs.size < rejectedDocTypes.length && (
                        <p className="text-xs text-gray-400 text-center mt-2">
                          Vous pouvez valider maintenant ou ajouter les autres documents
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuiviCommande;
