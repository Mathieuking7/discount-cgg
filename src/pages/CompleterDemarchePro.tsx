import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Upload, FileCheck, CreditCard, Loader2, Shield, Clock,
  ChevronLeft, ChevronRight, User, CheckCircle, X, Lock,
  BadgeCheck, FileText, Camera, RotateCcw, Car, AlertTriangle,
  Check
} from "lucide-react";

const isIdentityDocument = (docName: string) => {
  const lower = docName.toLowerCase();
  return lower.includes("identite") || lower.includes("identité") ||
    lower.includes("cni") || lower.includes("passeport") ||
    lower.includes("piece d'identite") || lower.includes("pièce d'identité");
};

type PageState = "loading" | "invalid" | "already_completed" | "cancelled" | "form" | "success";

const CompleterDemarchePro = () => {
  const { linkId } = useParams();
  const { toast } = useToast();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [demarche, setDemarche] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});
  const [extraDocs, setExtraDocs] = useState<{ name: string; file: File }[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    code_postal: "",
    ville: "",
  });

  const paymentOption = demarche?.payment_option || "client_tout";
  const needsPayment = paymentOption !== "garage_tout";

  const STEPS = needsPayment
    ? [
        { id: 1, label: "Informations", icon: User },
        { id: 2, label: "Documents", icon: Upload },
        { id: 3, label: "Recapitulatif", icon: CheckCircle },
      ]
    : [
        { id: 1, label: "Informations", icon: User },
        { id: 2, label: "Documents", icon: Upload },
        { id: 3, label: "Confirmation", icon: CheckCircle },
      ];

  const totalSteps = STEPS.length;

  useEffect(() => {
    loadDemarche();
  }, [linkId]);

  useEffect(() => {
    if (demarche?.demarche_type) {
      loadRequiredDocuments(demarche.demarche_type);
    }
  }, [demarche?.demarche_type]);

  const loadDemarche = async () => {
    if (!linkId) { setPageState("invalid"); return; }

    const { data, error } = await supabase
      .from("demarches")
      .select("*")
      .eq("client_payment_link_id", linkId)
      .single();

    if (error || !data) { setPageState("invalid"); return; }

    if (data.client_payment_status === "paid") { setPageState("already_completed"); return; }
    if (data.status === "annulee") { setPageState("cancelled"); return; }

    setDemarche(data);
    // Pre-fill client info if available
    if (data.client_nom) {
      setFormData(prev => ({
        ...prev,
        nom: data.client_nom || "",
        prenom: data.client_prenom || "",
        email: data.client_email || "",
        telephone: data.client_telephone || "",
        adresse: data.client_adresse || "",
        code_postal: data.client_code_postal || "",
        ville: data.client_ville || "",
      }));
    }
    setPageState("form");
  };

  const loadRequiredDocuments = async (demarcheType: string) => {
    const { data } = await supabase
      .from("guest_order_required_documents")
      .select("*")
      .eq("actif", true)
      .eq("demarche_type_code", demarcheType)
      .order("ordre");
    setDocuments(data || []);
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
    return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\/\\]/g, '_').replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9.]/g, '_').replace(/_+/g, '_').toLowerCase();
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
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast({ title: "Formulaire incomplet", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      toast({ title: "Documents manquants", description: "Veuillez telecharger tous les documents obligatoires", variant: "destructive" });
      return;
    }
    if (currentStep < totalSteps) {
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
    if (!demarche) return;
    setIsLoading(true);

    try {
      // Upload documents
      for (const [key, file] of Object.entries(uploadedDocs)) {
        const cleanedKey = cleanFileName(key);
        const cleanedFileName = cleanFileName(file.name);
        const fileName = `${demarche.id}/${cleanedKey}_${Date.now()}_${cleanedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("guest-order-documents")
          .upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("guest-order-documents")
          .getPublicUrl(fileName);

        await supabase.from("documents").insert({
          demarche_id: demarche.id,
          type_document: key,
          nom_fichier: file.name,
          url: urlData.publicUrl,
          taille_octets: file.size,
        });
      }

      // Upload extra docs
      for (const doc of extraDocs) {
        const cleanedFileName = cleanFileName(doc.file.name);
        const fileName = `${demarche.id}/${doc.name}_${Date.now()}_${cleanedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("guest-order-documents")
          .upload(fileName, doc.file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("guest-order-documents")
          .getPublicUrl(fileName);

        await supabase.from("documents").insert({
          demarche_id: demarche.id,
          type_document: `Document supplementaire ${doc.name}`,
          nom_fichier: doc.file.name,
          url: urlData.publicUrl,
          taille_octets: doc.file.size,
        });
      }

      // Update demarche with client info
      const updateData: any = {
        client_nom: formData.nom,
        client_prenom: formData.prenom,
        client_email: formData.email,
        client_telephone: formData.telephone,
        client_adresse: formData.adresse,
        client_code_postal: formData.code_postal,
        client_ville: formData.ville,
        status: "en_attente",
        client_completed_at: new Date().toISOString(),
      };

      if (paymentOption === "garage_tout") {
        updateData.client_payment_status = "not_required";
      } else {
        // For client_tout and garage_dossier, mark as paid (simplified -- real flow would go through Stripe)
        updateData.client_payment_status = "paid";
        updateData.client_paid_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("demarches")
        .update(updateData)
        .eq("id", demarche.id);

      if (updateError) throw updateError;

      setPageState("success");
    } catch (error: any) {
      console.error("Error:", error);
      toast({ title: "Erreur", description: "Une erreur est survenue lors de l'envoi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Price helpers
  const prixCarteGrise = demarche?.prix_carte_grise || demarche?.montant_ht || 0;
  const fraisDossier = demarche?.frais_dossier || 30;

  const getClientTotal = () => {
    if (paymentOption === "garage_tout") return 0;
    if (paymentOption === "garage_dossier") return prixCarteGrise;
    return prixCarteGrise + fraisDossier; // client_tout
  };

  const totalDocs = Object.keys(uploadedDocs).length + extraDocs.length;

  // --- RENDER STATES ---

  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  if (pageState === "invalid") {
    return (
      <ErrorPage
        icon={<AlertTriangle className="w-12 h-12 text-red-400" />}
        title="Lien invalide"
        message="Ce lien de demarche n'existe pas ou a expire. Veuillez contacter votre professionnel pour obtenir un nouveau lien."
      />
    );
  }

  if (pageState === "already_completed") {
    return (
      <ErrorPage
        icon={<CheckCircle className="w-12 h-12 text-emerald-500" />}
        title="Demarche deja completee"
        message="Cette demarche a deja ete completee. Vous recevrez un email avec le suivi de votre dossier."
      />
    );
  }

  if (pageState === "cancelled") {
    return (
      <ErrorPage
        icon={<X className="w-12 h-12 text-gray-400" />}
        title="Demarche annulee"
        message="Cette demarche a ete annulee. Veuillez contacter votre professionnel pour plus d'informations."
      />
    );
  }

  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
        <PageHeader />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Votre dossier a ete envoye !</h1>
            <p className="text-gray-500 mb-6">
              Vous recevrez un email de suivi a l'adresse <span className="font-medium text-gray-700">{formData.email}</span>.
              Votre professionnel sera egalement notifie.
            </p>
            <div className="p-4 bg-white rounded-xl border border-gray-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4 text-[#1B2A4A]" />
                <span className="text-gray-500">Vehicule:</span>
                <span className="font-mono font-semibold text-[#1B2A4A]">{demarche?.immatriculation || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-[#1B2A4A]" />
                <span className="text-gray-500">Documents:</span>
                <span className="font-medium text-gray-700">{totalDocs} fichier(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN FORM ---
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB]">
      <PageHeader />

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

      <div className="flex-1 container mx-auto px-4 py-6 sm:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Header with vehicle info */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Completez votre demarche</h1>
            {demarche?.immatriculation && (
              <div className="flex items-center gap-2 mt-2">
                <Car size={16} className="text-[#1B2A4A]" />
                <span className="text-sm text-gray-500">Vehicule :</span>
                <span className="font-semibold text-[#1B2A4A] font-mono tracking-wide">{demarche.immatriculation}</span>
                {demarche.marque && (
                  <span className="text-sm text-gray-400">
                    {demarche.marque} {demarche.modele || ""}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Payment option banner */}
          {paymentOption === "garage_tout" && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Entierement pris en charge par votre professionnel</p>
                <p className="text-xs text-emerald-600">Aucun paiement requis de votre part.</p>
              </div>
            </div>
          )}

          {paymentOption === "garage_dossier" && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-sm text-emerald-800">
                <span className="font-semibold">Frais de dossier :</span>{" "}
                <span className="text-emerald-600">Pris en charge par votre professionnel</span>{" "}
                <CheckCircle size={14} className="inline text-emerald-500" />
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Vous ne payez que la taxe carte grise : <span className="font-semibold text-[#1B2A4A]">{prixCarteGrise.toFixed(2)} EUR</span>
              </p>
            </div>
          )}

          {/* Step Indicator */}
          <div className="mb-6">
            <div className="flex items-center gap-0">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <button
                      onClick={() => { if (isCompleted) { setCurrentStep(step.id); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                      className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg transition-all text-left w-full ${
                        isCompleted ? "cursor-pointer hover:bg-green-50" : isActive ? "" : "cursor-default"
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
            <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B2A4A] rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
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
                            {[
                              { key: rectoKey, has: hasRecto, label: "RECTO", sublabel: "Face avant", icon: Camera },
                              { key: versoKey, has: hasVerso, label: "VERSO", sublabel: "Face arriere", icon: RotateCcw },
                            ].map((side) => (
                              <div key={side.key} className="relative">
                                <div className={`border-2 border-dashed rounded-xl p-3 transition-all text-center ${
                                  side.has ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-[#1B2A4A]/30"
                                }`}>
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    aria-label={`Telecharger ${doc.nom_document} ${side.label.toLowerCase()}`}
                                    onChange={(e) => handleFileChange(side.key, e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  {side.has ? (
                                    <div className="space-y-1">
                                      <FileCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                                      <p className="text-xs text-emerald-700 font-medium truncate">{uploadedDocs[side.key].name}</p>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleFileChange(side.key, null); }}
                                        className="text-[10px] text-red-400 hover:text-red-600 underline"
                                      >Supprimer</button>
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <side.icon className="w-5 h-5 text-gray-400 mx-auto" />
                                      <p className="text-xs font-semibold text-gray-600">{side.label}</p>
                                      <p className="text-[10px] text-gray-400">{side.sublabel}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={doc.id} className="space-y-1.5">
                        <label className="text-sm font-semibold text-gray-800">
                          {doc.nom_document} {doc.obligatoire && <span className="text-red-400">*</span>}
                        </label>
                        <div className="relative">
                          <div className={`border-2 border-dashed rounded-xl p-3 transition-all ${
                            uploadedDocs[doc.nom_document] ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50 hover:border-[#1B2A4A]/30"
                          }`}>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              aria-label={`Telecharger ${doc.nom_document}`}
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
                                ><X size={14} /></button>
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

                {/* Extra docs */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documents supplementaires (optionnel)</h3>
                  {extraDocs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm text-emerald-700 flex-1 truncate">{doc.file.name}</span>
                      <button onClick={() => setExtraDocs(extraDocs.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center gap-2 p-2.5 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#1B2A4A]/30 transition-all">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      aria-label="Telecharger un document supplementaire"
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

            {/* Step 3: Recap / Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} className="text-[#1B2A4A]" />
                  <h2 className="text-lg font-bold text-gray-900">
                    {needsPayment ? "Recapitulatif et paiement" : "Confirmation"}
                  </h2>
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
                    {Object.entries(uploadedDocs).map(([name]) => (
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

                {/* Price breakdown */}
                {needsPayment && (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail du paiement</h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Taxe carte grise</span>
                        <span className="font-medium text-gray-800">{prixCarteGrise.toFixed(2)} EUR</span>
                      </div>

                      {paymentOption === "client_tout" && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Frais de dossier</span>
                          <span className="font-medium text-gray-800">{fraisDossier.toFixed(2)} EUR</span>
                        </div>
                      )}

                      {paymentOption === "garage_dossier" && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Frais de dossier</span>
                          <span className="font-medium text-emerald-600">Pris en charge</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Total a payer</span>
                        <span className="text-lg font-bold text-[#1B2A4A]">{getClientTotal().toFixed(2)} EUR</span>
                      </div>
                    </div>
                  </div>
                )}

                {!needsPayment && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p className="text-sm text-emerald-800">
                      Aucun paiement requis. Votre professionnel prend en charge l'integralite des frais.
                    </p>
                  </div>
                )}
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

            {currentStep < totalSteps ? (
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
                ) : needsPayment ? (
                  <>
                    <CreditCard size={16} />
                    Valider et payer {getClientTotal().toFixed(2)} EUR
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Envoyer mon dossier
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
    </div>
  );
};

// --- Sub-components ---

const PageHeader = () => (
  <div className="bg-white border-b border-gray-100 px-4 py-3">
    <div className="max-w-5xl mx-auto flex items-center gap-2">
      <div className="w-8 h-8 bg-[#1B2A4A] rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xs">SF</span>
      </div>
      <span className="font-bold text-[#1B2A4A] text-lg">King Carte Grise</span>
    </div>
  </div>
);

const ErrorPage = ({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) => (
  <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
    <PageHeader />
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-4">{icon}</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  </div>
);

export default CompleterDemarchePro;
