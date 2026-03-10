import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload, FileCheck, CreditCard, Loader2, Shield, Clock,
  ChevronLeft, ChevronRight, User, Bell, CheckCircle,
  Eye, X, AlertCircle, Lock, BadgeCheck, Star, FileText,
  Camera, RotateCcw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GuestPaymentDetailsSummary, calculateGuestOrderTTC } from "@/components/payment/GuestPaymentDetailsSummary";

const STEPS = [
  { id: 1, label: "Informations", icon: User },
  { id: 2, label: "Documents", icon: Upload },
  { id: 3, label: "Options", icon: Bell },
  { id: 4, label: "Recapitulatif", icon: CheckCircle },
];

// Documents that require recto + verso (ID documents)
const isIdentityDocument = (docName: string) => {
  const lower = docName.toLowerCase();
  return lower.includes("identite") || lower.includes("identité") ||
    lower.includes("cni") || lower.includes("passeport") ||
    lower.includes("piece d'identite") || lower.includes("pièce d'identité");
};

const CommanderSansCompte = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [demarcheInfo, setDemarcheInfo] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});
  const [extraDocs, setExtraDocs] = useState<{ name: string; file: File }[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    code_postal: "",
    ville: "",
    sms_notifications: false,
    email_notifications: true,
  });

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  useEffect(() => {
    if (order?.demarche_type) {
      loadRequiredDocuments(order.demarche_type);
      loadDemarcheInfo(order.demarche_type);
    }
  }, [order?.demarche_type]);

  const loadOrder = async () => {
    if (!orderId) return;
    const { data, error } = await supabase
      .from("guest_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      toast({ title: "Erreur", description: "Commande introuvable", variant: "destructive" });
      navigate("/");
      return;
    }
    setOrder(data);
    if (data.nom) {
      setFormData({
        nom: data.nom || "",
        prenom: data.prenom || "",
        email: data.email || "",
        telephone: data.telephone || "",
        adresse: data.adresse || "",
        code_postal: data.code_postal || "",
        ville: data.ville || "",
        sms_notifications: data.sms_notifications || false,
        email_notifications: data.email_notifications !== false,
      });
    }
  };

  const loadDemarcheInfo = async (demarcheType: string) => {
    const { data } = await supabase
      .from("guest_demarche_types")
      .select("titre, description, prix_base")
      .eq("code", demarcheType)
      .single();
    if (data) setDemarcheInfo(data);
  };

  const loadRequiredDocuments = async (demarcheType: string) => {
    const { data: docsData } = await supabase
      .from("guest_order_required_documents")
      .select("*")
      .eq("actif", true)
      .eq("demarche_type_code", demarcheType)
      .order("ordre");
    setDocuments(docsData || []);
  };

  const handleFileChange = (documentName: string, file: File | null) => {
    if (file) {
      setUploadedDocs({ ...uploadedDocs, [documentName]: file });
    } else {
      const newDocs = { ...uploadedDocs };
      delete newDocs[documentName];
      setUploadedDocs(newDocs);
    }
  };

  const cleanFileName = (name: string) => {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\/\\]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9.]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  };

  const validateStep1 = () => {
    return formData.nom && formData.prenom && formData.email && formData.telephone &&
      formData.adresse && formData.code_postal && formData.ville;
  };

  const validateStep2 = () => {
    const requiredDocs = documents.filter(d => d.obligatoire);
    return requiredDocs.every(doc => {
      if (isIdentityDocument(doc.nom_document)) {
        return uploadedDocs[`${doc.nom_document}_recto`] && uploadedDocs[`${doc.nom_document}_verso`];
      }
      return uploadedDocs[doc.nom_document];
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast({ title: "Formulaire incomplet", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      toast({ title: "Documents manquants", description: "Veuillez telecharger tous les documents obligatoires (recto et verso pour les pieces d'identite)", variant: "destructive" });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!order) return;
    setIsLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("guest_orders")
        .update({
          ...formData,
          documents_complets: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Delete old docs
      const { data: existingDocs } = await supabase
        .from("guest_order_documents")
        .select("id, url")
        .eq("order_id", orderId);

      if (existingDocs && existingDocs.length > 0) {
        for (const doc of existingDocs) {
          const path = doc.url.split('/').slice(-2).join('/');
          await supabase.storage.from("guest-order-documents").remove([path]);
          await supabase.from("guest_order_documents").delete().eq("id", doc.id);
        }
      }

      // Upload new docs
      for (const [key, file] of Object.entries(uploadedDocs)) {
        const cleanedKey = cleanFileName(key);
        const cleanedFileName = cleanFileName(file.name);
        const fileName = `${orderId}/${cleanedKey}_${Date.now()}_${cleanedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("guest-order-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("guest-order-documents")
          .getPublicUrl(fileName);

        await supabase.from("guest_order_documents").insert({
          order_id: orderId,
          type_document: key,
          nom_fichier: file.name,
          url: urlData.publicUrl,
          taille_octets: file.size,
          validation_status: 'pending',
        });
      }

      // Upload extra/supplementary docs
      for (const doc of extraDocs) {
        const cleanedFileName = cleanFileName(doc.file.name);
        const fileName = `${orderId}/${doc.name}_${Date.now()}_${cleanedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("guest-order-documents")
          .upload(fileName, doc.file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("guest-order-documents")
          .getPublicUrl(fileName);

        await supabase.from("guest_order_documents").insert({
          order_id: orderId,
          type_document: `Document supplementaire ${doc.name}`,
          nom_fichier: doc.file.name,
          url: urlData.publicUrl,
          taille_octets: doc.file.size,
          validation_status: 'pending',
        });
      }

      const hasStripe = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      if (!hasStripe) {
        await supabase
          .from("guest_orders")
          .update({
            paye: true,
            paid_at: new Date().toISOString(),
            status: "paye"
          })
          .eq("id", orderId);

        if (formData.email_notifications) {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'payment_confirmed',
              to: formData.email,
              data: {
                tracking_number: order.tracking_number,
                nom: formData.nom,
                prenom: formData.prenom,
                immatriculation: order.immatriculation,
                montant_ttc: order.montant_ttc + (formData.sms_notifications ? 5 : 0)
              }
            }
          });
        }

        toast({ title: "Commande validee", description: "Votre commande a ete enregistree avec succes" });
        navigate(`/suivi/${order.tracking_number}`);
      } else {
        if (formData.email_notifications) {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'order_confirmation',
              to: formData.email,
              data: {
                tracking_number: order.tracking_number,
                nom: formData.nom,
                prenom: formData.prenom,
                immatriculation: order.immatriculation,
                montant_ttc: order.montant_ttc + (formData.sms_notifications ? 5 : 0)
              }
            }
          });
        }

        toast({ title: "Documents envoyes", description: "Passons maintenant au paiement" });
        navigate(`/paiement/${orderId}`);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de l'envoi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const totalDocs = Object.keys(uploadedDocs).length + extraDocs.length;

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  const demarcheTitle = demarcheInfo?.titre || "Votre demarche";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      <Navbar />

      {/* Trust bar */}
      <div className="bg-[#1B2A4A] py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 sm:gap-6 text-white text-[10px] sm:text-xs overflow-hidden">
          <span className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <Lock size={12} className="text-green-400" />
            <span className="text-white/70">Paiement securise</span>
          </span>
          <span className="hidden sm:block w-px h-3 bg-white/20" />
          <span className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            <BadgeCheck size={14} className="text-amber-400" />
            <span className="text-white/70">ANTS</span>
          </span>
          <span className="hidden sm:block w-px h-3 bg-white/20" />
          <span className="hidden sm:flex items-center gap-1.5">
            <Clock size={12} className="text-white/50" />
            <span className="text-white/70">Traite en 24h</span>
          </span>
        </div>
      </div>

      <div id="main-content" className="flex-1 container mx-auto px-4 py-6 sm:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Header - compact */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{demarcheTitle}</h1>
            {order.immatriculation && (
              <p className="text-sm text-gray-500 mt-1">
                Vehicule : <span className="font-semibold text-[#1B2A4A] font-mono tracking-wide">{order.immatriculation}</span>
              </p>
            )}
          </div>

          {/* Step Indicator - clean horizontal */}
          <div className="mb-6">
            <div className="flex items-center gap-0">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => {
                        // Allow going back to completed steps
                        if (isCompleted) {
                          setCurrentStep(step.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all text-left w-full ${
                        isCompleted ? "cursor-pointer hover:bg-green-50" :
                        isActive ? "" : "cursor-default"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                        isCompleted ? "bg-emerald-500 text-white" :
                        isActive ? "bg-[#1B2A4A] text-white ring-2 ring-[#1B2A4A]/20" :
                        "bg-gray-200 text-gray-500"
                      }`}>
                        {isCompleted ? <CheckCircle size={14} /> : step.id}
                      </div>
                      <span className={`text-xs font-medium hidden sm:block ${
                        isActive ? "text-[#1B2A4A]" : isCompleted ? "text-emerald-600" : "text-gray-400"
                      }`}>
                        {step.label}
                      </span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className={`w-full h-0.5 -mx-1 ${isCompleted ? "bg-emerald-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={4} aria-label="Progression du formulaire">
              <div
                className="h-full bg-[#1B2A4A] rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7 mb-5">
            {/* Step 1: Informations */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} className="text-[#1B2A4A]" />
                  <h2 className="text-lg font-bold text-gray-900">Vos informations</h2>
                </div>
                <p className="text-sm text-gray-500 -mt-2">Ces informations seront utilisees pour votre demarche administrative.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "nom", label: "Nom", type: "text", placeholder: "Dupont" },
                    { id: "prenom", label: "Prenom", type: "text", placeholder: "Jean" },
                    { id: "email", label: "Email", type: "email", placeholder: "jean.dupont@email.com" },
                    { id: "telephone", label: "Telephone", type: "tel", placeholder: "06 12 34 56 78" },
                  ].map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label htmlFor={field.id} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{field.label} *</label>
                      <input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={(formData as any)[field.id]}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-all text-sm text-gray-800 placeholder:text-gray-300"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label htmlFor="adresse" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Adresse *</label>
                  <input
                    id="adresse"
                    type="text"
                    placeholder="12 rue de la Paix"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-all text-sm text-gray-800 placeholder:text-gray-300"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="code_postal" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Code postal *</label>
                    <input
                      id="code_postal"
                      type="text"
                      placeholder="75001"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-all text-sm text-gray-800 placeholder:text-gray-300"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ville" className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ville *</label>
                    <input
                      id="ville"
                      type="text"
                      placeholder="Paris"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full h-11 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] transition-all text-sm text-gray-800 placeholder:text-gray-300"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-[#1B2A4A]" />
                  <h2 className="text-lg font-bold text-gray-900">Documents requis</h2>
                </div>
                <p className="text-sm text-gray-500 -mt-2">Formats acceptes : PDF, JPG, PNG. Taille max : 10 Mo par fichier.</p>

                <div className="space-y-4">
                  {documents.map((doc) => {
                    const isID = isIdentityDocument(doc.nom_document);

                    if (isID) {
                      // Recto / Verso layout for ID documents
                      const rectoKey = `${doc.nom_document}_recto`;
                      const versoKey = `${doc.nom_document}_verso`;
                      const hasRecto = !!uploadedDocs[rectoKey];
                      const hasVerso = !!uploadedDocs[versoKey];

                      return (
                        <div key={doc.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-800">
                              {doc.nom_document} {doc.obligatoire && <span className="text-red-400">*</span>}
                            </label>
                            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">Recto + Verso</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Recto */}
                            <div className="relative">
                              <div className={`border-2 border-dashed rounded-xl p-3 transition-all text-center ${
                                hasRecto ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-[#1B2A4A]/30"
                              }`}>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  aria-label={`Télécharger ${doc.nom_document} recto`}
                                  onChange={(e) => handleFileChange(rectoKey, e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {hasRecto ? (
                                  <div className="space-y-1">
                                    <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                                    <p className="text-xs text-emerald-700 font-medium truncate">{uploadedDocs[rectoKey].name}</p>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleFileChange(rectoKey, null); }}
                                      className="text-[10px] text-red-400 hover:text-red-600 underline"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <Camera className="w-5 h-5 text-gray-400 mx-auto" />
                                    <p className="text-xs font-semibold text-gray-600">RECTO</p>
                                    <p className="text-[10px] text-gray-400">Face avant</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Verso */}
                            <div className="relative">
                              <div className={`border-2 border-dashed rounded-xl p-3 transition-all text-center ${
                                hasVerso ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-[#1B2A4A]/30"
                              }`}>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  aria-label={`Télécharger ${doc.nom_document} verso`}
                                  onChange={(e) => handleFileChange(versoKey, e.target.files?.[0] || null)}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {hasVerso ? (
                                  <div className="space-y-1">
                                    <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                                    <p className="text-xs text-emerald-700 font-medium truncate">{uploadedDocs[versoKey].name}</p>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleFileChange(versoKey, null); }}
                                      className="text-[10px] text-red-400 hover:text-red-600 underline"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <RotateCcw className="w-5 h-5 text-gray-400 mx-auto" />
                                    <p className="text-xs font-semibold text-gray-600">VERSO</p>
                                    <p className="text-[10px] text-gray-400">Face arriere</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Regular document upload
                    return (
                      <div key={doc.id} className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-800">
                          {doc.nom_document} {doc.obligatoire && <span className="text-red-400">*</span>}
                        </label>
                        <div className="relative">
                          <div className={`border-2 border-dashed rounded-xl p-3 transition-all ${
                            uploadedDocs[doc.nom_document]
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-gray-200 bg-gray-50 hover:border-[#1B2A4A]/30"
                          }`}>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              aria-label={`Télécharger ${doc.nom_document}`}
                              onChange={(e) => handleFileChange(doc.nom_document, e.target.files?.[0] || null)}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {uploadedDocs[doc.nom_document] ? (
                              <div className="flex items-center gap-2">
                                <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span className="text-sm text-emerald-700 font-medium truncate flex-1">{uploadedDocs[doc.nom_document].name}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleFileChange(doc.nom_document, null); }}
                                  className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-400">
                                <Upload className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">Cliquez pour ajouter un fichier</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Documents supplementaires */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documents supplementaires (optionnel)</h3>
                  {extraDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-emerald-700 flex-1 truncate">{doc.file.name}</span>
                      <button
                        onClick={() => setExtraDocs(extraDocs.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-600 flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 p-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#1B2A4A]/30 transition-all">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      aria-label="Télécharger un document supplémentaire"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setExtraDocs([...extraDocs, { name: `supplementaire_${extraDocs.length + 1}`, file }]);
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Ajouter un document supplementaire</span>
                  </label>
                </div>
              </div>
            )}

            {/* Step 3: Options */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={18} className="text-[#1B2A4A]" />
                  <h2 className="text-lg font-bold text-gray-900">Options de suivi</h2>
                </div>
                <p className="text-sm text-gray-500 -mt-2">Choisissez comment vous souhaitez etre informe de l'avancement de votre dossier.</p>

                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.email_notifications ? "border-[#1B2A4A]/30 bg-blue-50/50" : "border-gray-100 bg-gray-50"
                  }`}>
                    <Checkbox
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked as boolean })}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm">Notifications par email</span>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">GRATUIT</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Recevez les mises a jour par email a chaque etape</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.sms_notifications ? "border-[#1B2A4A]/30 bg-blue-50/50" : "border-gray-100 bg-gray-50"
                  }`}>
                    <Checkbox
                      checked={formData.sms_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, sms_notifications: checked as boolean })}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-sm">Notifications par SMS</span>
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">+5 EUR</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Recevez un SMS instantane a chaque changement de statut</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Recap */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} className="text-[#1B2A4A]" />
                  <h2 className="text-lg font-bold text-gray-900">Recapitulatif</h2>
                </div>

                {/* Info summary */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informations personnelles</h3>
                    <button onClick={() => setCurrentStep(1)} className="text-xs text-[#1B2A4A] hover:underline font-medium">Modifier</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <p><span className="text-gray-400">Nom:</span> <span className="text-gray-800 font-medium">{formData.prenom} {formData.nom}</span></p>
                    <p><span className="text-gray-400">Tel:</span> <span className="text-gray-800">{formData.telephone}</span></p>
                    <p><span className="text-gray-400">Email:</span> <span className="text-gray-800">{formData.email}</span></p>
                    <p><span className="text-gray-400">Ville:</span> <span className="text-gray-800">{formData.code_postal} {formData.ville}</span></p>
                  </div>
                </div>

                {/* Docs summary */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents ({totalDocs})</h3>
                    <button onClick={() => setCurrentStep(2)} className="text-xs text-[#1B2A4A] hover:underline font-medium">Modifier</button>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(uploadedDocs).map(([name, file]) => (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{name}</span>
                      </div>
                    ))}
                    {extraDocs.map((doc, i) => (
                      <div key={`extra-${i}`} className="flex items-center gap-2 text-sm">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-gray-700 truncate">{doc.file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Options summary */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Options</h3>
                    <button onClick={() => setCurrentStep(3)} className="text-xs text-[#1B2A4A] hover:underline font-medium">Modifier</button>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={13} className={formData.email_notifications ? "text-emerald-500" : "text-gray-300"} />
                      <span className={formData.email_notifications ? "text-gray-700" : "text-gray-400"}>Email</span>
                      <span className="text-xs text-emerald-600 font-medium">Gratuit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={13} className={formData.sms_notifications ? "text-emerald-500" : "text-gray-300"} />
                      <span className={formData.sms_notifications ? "text-gray-700" : "text-gray-400"}>SMS</span>
                      {formData.sms_notifications && <span className="text-xs text-amber-600 font-medium">+5 EUR</span>}
                    </div>
                  </div>
                </div>

                {/* Price summary */}
                <GuestPaymentDetailsSummary
                  prixCarteGrise={order.montant_ht || 0}
                  fraisDossier={order.frais_dossier || 30}
                  smsNotifications={formData.sms_notifications}
                  emailNotifications={formData.email_notifications}
                />
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-5 min-h-[48px] h-11 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                <ChevronLeft size={16} />
                Retour
              </button>
            )}

            <div className="flex-1" />

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 px-6 min-h-[48px] h-11 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow disabled:shadow-none"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 min-h-[48px] h-11 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-all text-sm shadow-sm hover:shadow"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} />
                    Valider et payer
                  </>
                )}
              </button>
            )}
          </div>

          {/* Security footer */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Lock size={10} /> SSL 256-bit</span>
            <span className="flex items-center gap-1"><Shield size={10} /> Donnees protegees</span>
            <span className="flex items-center gap-1"><BadgeCheck size={10} /> ANTS agree</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommanderSansCompte;
