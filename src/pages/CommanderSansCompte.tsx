import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileCheck, CreditCard, Loader2, Shield, Clock, ChevronLeft, ChevronRight, User, Bell, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GuestPaymentDetailsSummary, calculateGuestOrderTTC } from "@/components/payment/GuestPaymentDetailsSummary";

const STEPS = [
  { id: 1, label: "Informations", icon: User },
  { id: 2, label: "Documents", icon: Upload },
  { id: 3, label: "Options", icon: Bell },
  { id: 4, label: "Recapitulatif", icon: CheckCircle },
];

const CommanderSansCompte = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
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
        email_notifications: data.email_notifications || true,
      });
    }
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
    return requiredDocs.every(doc => uploadedDocs[doc.nom_document]);
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
      const requiredDocs = documents.filter(d => d.obligatoire);
      const missing = requiredDocs.filter(doc => !uploadedDocs[doc.nom_document]);
      toast({ title: "Documents manquants", description: `Veuillez telecharger : ${missing.map(d => d.nom_document).join(", ")}`, variant: "destructive" });
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
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

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <Navbar />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Finaliser votre commande</h1>
            <p className="text-gray-500 text-lg">
              Carte grise pour <span className="font-semibold text-amber-600">{order.immatriculation}</span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">Votre carte grise traitee en 24h maximum</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            {[
              { icon: Shield, label: "Paiement securise", sub: "Cryptage SSL" },
              { icon: FileCheck, label: "Service agree", sub: "Habilite par l'Etat" },
              { icon: Clock, label: "Traitement rapide", sub: "Moins de 24h" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <badge.icon className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{badge.label}</p>
                  <p className="text-xs text-gray-400">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                      isActive ? "bg-amber-500 border-amber-500 text-white shadow-md" :
                      "bg-white border-gray-200 text-gray-400"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-1.5 font-medium ${isActive ? "text-amber-600" : isCompleted ? "text-emerald-600" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-[-18px] ${isCompleted ? "bg-emerald-400" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
            {/* Step 1: Informations */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Vos informations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "nom", label: "Nom", type: "text" },
                    { id: "prenom", label: "Prenom", type: "text" },
                    { id: "email", label: "Email", type: "email" },
                    { id: "telephone", label: "Telephone", type: "tel" },
                  ].map((field) => (
                    <div key={field.id} className="space-y-1.5">
                      <label htmlFor={field.id} className="text-sm font-semibold text-gray-700">{field.label} *</label>
                      <input
                        id={field.id}
                        type={field.type}
                        value={(formData as any)[field.id]}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-800"
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="adresse" className="text-sm font-semibold text-gray-700">Adresse *</label>
                  <input
                    id="adresse"
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-800"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="code_postal" className="text-sm font-semibold text-gray-700">Code postal *</label>
                    <input
                      id="code_postal"
                      type="text"
                      value={formData.code_postal}
                      onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                      className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-800"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="ville" className="text-sm font-semibold text-gray-700">Ville *</label>
                    <input
                      id="ville"
                      type="text"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all text-gray-800"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Documents requis</h2>
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {doc.nom_document} {doc.obligatoire && "*"}
                      </label>
                      <div className={`relative border-2 border-dashed rounded-2xl p-4 transition-all ${
                        uploadedDocs[doc.nom_document]
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-gray-200 bg-gray-50 hover:border-amber-300"
                      }`}>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(doc.nom_document, e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {uploadedDocs[doc.nom_document] ? (
                          <div className="flex items-center gap-2 text-emerald-700">
                            <FileCheck className="w-5 h-5" />
                            <span className="text-sm font-medium">{uploadedDocs[doc.nom_document].name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Upload className="w-5 h-5" />
                            <span className="text-sm">Cliquez ou deposez un fichier (PDF, JPG, PNG)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documents supplementaires */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Documents supplementaires (optionnel)</h3>
                  {extraDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 flex-1">{doc.file.name}</span>
                      <button
                        onClick={() => setExtraDocs(extraDocs.filter((_, j) => j !== i))}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-amber-300 transition-all">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
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
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Options de suivi</h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.email_notifications ? "border-amber-300 bg-amber-50" : "border-gray-100 bg-gray-50"
                  }`}>
                    <Checkbox
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked as boolean })}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">Notifications par email</span>
                      <span className="text-emerald-600 font-medium ml-2 text-sm">Gratuit</span>
                      <p className="text-sm text-gray-400 mt-0.5">Recevez les mises a jour par email</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    formData.sms_notifications ? "border-amber-300 bg-amber-50" : "border-gray-100 bg-gray-50"
                  }`}>
                    <Checkbox
                      checked={formData.sms_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, sms_notifications: checked as boolean })}
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">Notifications par SMS</span>
                      <span className="text-amber-600 font-medium ml-2 text-sm">+5 EUR</span>
                      <p className="text-sm text-gray-400 mt-0.5">Recevez les mises a jour par SMS</p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Step 4: Recap */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Recapitulatif</h2>

                {/* Info summary */}
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1 text-sm">
                  <p><span className="font-medium text-gray-700">Nom:</span> <span className="text-gray-600">{formData.prenom} {formData.nom}</span></p>
                  <p><span className="font-medium text-gray-700">Email:</span> <span className="text-gray-600">{formData.email}</span></p>
                  <p><span className="font-medium text-gray-700">Tel:</span> <span className="text-gray-600">{formData.telephone}</span></p>
                  <p><span className="font-medium text-gray-700">Adresse:</span> <span className="text-gray-600">{formData.adresse}, {formData.code_postal} {formData.ville}</span></p>
                </div>

                {/* Docs summary */}
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">Documents ({Object.keys(uploadedDocs).length})</p>
                  <div className="space-y-1">
                    {Object.entries(uploadedDocs).map(([name, file]) => (
                      <div key={name} className="flex items-center gap-2 text-sm text-gray-600">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        <span>{name}</span>
                      </div>
                    ))}
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
          <div className="flex items-center justify-between gap-4">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 h-12 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                Precedent
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 h-12 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg disabled:shadow-none"
              >
                Suivant
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 h-12 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Continuer vers le paiement
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CommanderSansCompte;
