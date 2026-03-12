import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileCheck, Plus, Gift, FileText, X, Download, Coins, Check, ChevronDown, FileQuestion, Shield, Lock, Copy, Mail, Maximize2, Send, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ActionQuestionnaire } from "@/components/ActionQuestionnaire";
import { useToast } from "@/hooks/use-toast";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VehicleForm } from "@/components/VehicleForm";
import { VehicleFormCG } from "@/components/VehicleFormCG";
import { VehicleFormSimple } from "@/components/VehicleFormSimple";
import { VehicleInfoFormPro, VehicleInfoPro } from "@/components/VehicleInfoFormPro";
import { DocumentsNecessaires, getDocumentsConfig } from "@/components/DocumentsNecessaires";
// TrackingServiceOption supprimé - options SMS retirées
import { StripePayment } from "@/components/StripePayment";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatPrice } from "@/lib/utils";
import { extractCerfaNumber, getCerfaUrl, cerfaExists } from "@/lib/cerfa-utils";
import PaymentOptionSelector from "@/components/PaymentOptionSelector";
import QRCode from "qrcode";

// Types de démarches PRO qui nécessitent un traitement spécial
const PRO_DEMARCHE_TYPES = [
  "WW_PROVISOIRE_PRO",
  "W_GARAGE_PRO",
  "QUITUS_FISCAL_PRO",
  "CHANGEMENT_ADRESSE_PRO",
  "DUPLICATA_CG_PRO",
  "FIV_PRO",
  "CG_NEUF_PRO",
  "MODIF_CG_PRO",
  "ANNULATION_CPI_WW_PRO",
  "CHANGEMENT_ADRESSE_LOCATAIRE_PRO",
  "SUCCESSION_HERITAGE_PRO",
  "COTITULAIRE_PRO",
  "ANNULER_CORRIGER_DC_DA_PRO",
  "CYCLO_ANCIEN_PRO",
  "IMMAT_DEFINITIVE_PRO",
];
// Types de démarches PRO qui nécessitent les infos véhicule manuelles (VIN, marque, modèle)
const PRO_TYPES_WITH_VEHICLE = ["WW_PROVISOIRE_PRO", "QUITUS_FISCAL_PRO", "CG_NEUF_PRO"];
// Types de démarches PRO qui utilisent la plaque d'immatriculation (lookup API)
const PRO_TYPES_WITH_PLATE = ["DUPLICATA_CG_PRO", "FIV_PRO", "MODIF_CG_PRO", "ANNULATION_CPI_WW_PRO", "SUCCESSION_HERITAGE_PRO", "COTITULAIRE_PRO", "ANNULER_CORRIGER_DC_DA_PRO", "IMMAT_DEFINITIVE_PRO"];
// Types de démarches PRO qui n'ont pas besoin de bloc véhicule
const PRO_TYPES_WITHOUT_VEHICLE = ["W_GARAGE_PRO", "CHANGEMENT_ADRESSE_PRO", "CHANGEMENT_ADRESSE_LOCATAIRE_PRO", "CYCLO_ANCIEN_PRO"];

export default function NouvelleDemarche() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { draftId } = useParams();
  const [garage, setGarage] = useState<any>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demarcheId, setDemarcheId] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Set<string>>(new Set());
  const [actionDetails, setActionDetails] = useState<any>(null);
  const [documentsRequis, setDocumentsRequis] = useState<any[]>([]);
  const [actionsRapides, setActionsRapides] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedImmatriculation, setSelectedImmatriculation] = useState<string>("");
  const [additionalDocs, setAdditionalDocs] = useState<{id: number; name: string}[]>([
    { id: 1, name: "" },
    { id: 2, name: "" },
    { id: 3, name: "" },
    { id: 4, name: "" },
    { id: 5, name: "" }
  ]);
  const [carteGrisePrice, setCarteGrisePrice] = useState<number>(0);
  // trackingServicePrice supprimé - options SMS retirées
  const [freeTokenAvailable, setFreeTokenAvailable] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [payingWithTokens, setPayingWithTokens] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});
  const [isQuestionnaireBlocked, setIsQuestionnaireBlocked] = useState(false);
  const [conditionalDocuments, setConditionalDocuments] = useState<any[]>([]);
  const demarcheIdRef = useRef<string | null>(null);
  const paymentCompletedRef = useRef(false);
  const [formData, setFormData] = useState({
    type: searchParams.get('type') || "",
    commentaire: ""
  });
  // État pour les démarches PRO - infos véhicule
  const [vehicleInfoPro, setVehicleInfoPro] = useState<VehicleInfoPro | null>(null);
  const [vehicleInfoProValid, setVehicleInfoProValid] = useState(false);
  // État pour vérifier si le questionnaire est complété
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
  // Ouverture/fermeture du bloc questionnaire (modifiable même après complétion)
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(true);
  // CG payment option states
  const [paymentOption, setPaymentOption] = useState<'garage_dossier' | 'garage_tout' | 'client_tout'>('garage_dossier');
  const [prixCarteGrise, setPrixCarteGrise] = useState(0);
  const [fraisDossier, setFraisDossier] = useState(30);
  const [clientPaymentLinkId, setClientPaymentLinkId] = useState<string | null>(null);
  const [cgClientEmail, setCgClientEmail] = useState("");
  const [cgClientName, setCgClientName] = useState("");
  const [cgSuccessScreen, setCgSuccessScreen] = useState(false);
  const [cgQrDataUrl, setCgQrDataUrl] = useState("");
  const [cgCopied, setCgCopied] = useState(false);
  const [cgSendingEmail, setCgSendingEmail] = useState(false);
  const [cgQrFullscreen, setCgQrFullscreen] = useState(false);
  const [cgSubmitting, setCgSubmitting] = useState(false);
  // Textes des réponses au questionnaire (pour DocumentsNecessaires)
  const [questionnaireAnswerTexts, setQuestionnaireAnswerTexts] = useState<Record<string, string>>({});

  // Keep refs in sync with state for cleanup
  useEffect(() => {
    demarcheIdRef.current = demarcheId;
  }, [demarcheId]);

  useEffect(() => {
    paymentCompletedRef.current = paymentCompleted;
  }, [paymentCompleted]);

  // Ne plus supprimer automatiquement les brouillons
  // Les garages peuvent les reprendre plus tard

  // Charger le brouillon si draftId est fourni
  useEffect(() => {
    const loadDraft = async () => {
      if (!draftId || !garage || draftLoaded) return;
      
      const { data: draft } = await supabase
        .from('demarches')
        .select('*')
        .eq('id', draftId)
        .eq('garage_id', garage.id)
        .eq('is_draft', true)
        .single();

      if (draft) {
        setDemarcheId(draft.id);
        setFormData({
          type: draft.type,
          commentaire: draft.commentaire || ""
        });
        setSelectedImmatriculation(draft.immatriculation || "");
        setSelectedVehicleId(draft.vehicule_id);
        setCarteGrisePrice(draft.prix_carte_grise || 0);
        setDraftLoaded(true);
      }
    };

    if (garage && draftId) {
      loadDraft();
    }
  }, [draftId, garage, draftLoaded]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadGarage();
      loadActionsRapides();
    }
  }, [user]);

  useEffect(() => {
    if (formData.type) {
      loadActionDetails();
    }
  }, [formData.type]);

  useEffect(() => {
    // Auto-create draft when type is selected (seulement si pas de brouillon existant)
    if (formData.type && !demarcheId && garage && actionDetails && !draftId) {
      handleAutoCreateDraft();
    }
  }, [formData.type, garage, actionDetails, draftId]);

  useEffect(() => {
    // Load existing documents when demarcheId changes
    if (demarcheId) {
      loadExistingDocuments();
    }
  }, [demarcheId]);

  useEffect(() => {
    // Update demarche montant when carteGrisePrice or trackingServicePrice changes
    if (demarcheId && actionDetails) {
      // Pour DA et DC, on n'a pas besoin de carteGrisePrice
      if (formData.type === 'DA' || formData.type === 'DC') {
        updateDemarcheMontant();
      } else if (carteGrisePrice > 0) {
        updateDemarcheMontant();
      }
    }
  }, [carteGrisePrice, demarcheId, actionDetails, formData.type]);

  // Jeton gratuit uniquement pour DA et DC
  const isFreeTokenEligible = freeTokenAvailable && (formData.type === 'DA' || formData.type === 'DC');

  // isDuplicataCgPro est maintenant dans PRO_TYPES_WITH_VEHICLE, plus besoin de traitement spécial

  const proDocsState = useMemo(() => {
    if (!PRO_DEMARCHE_TYPES.includes(formData.type)) {
      return { requiredIds: [] as string[], allRequiredUploaded: true, blockingMessage: null as string | null };
    }
    const { documents, blockingMessage } = getDocumentsConfig(formData.type, questionnaireAnswerTexts);
    const requiredIds = documents.filter((d) => d.obligatoire).map((d) => d.id);
    const allRequiredUploaded = requiredIds.every((id) => uploadedDocuments.has(id));
    return { requiredIds, allRequiredUploaded, blockingMessage };
  }, [formData.type, questionnaireAnswerTexts, uploadedDocuments]);


  const updateDemarcheMontant = async () => {
    if (!demarcheId || !actionDetails) return;

    // Frais de dossier = prix de l'action (0 si jeton gratuit ET DA/DC)
    const fraisDossierHT = isFreeTokenEligible ? 0 : actionDetails.prix;
    
    // Prix carte grise (taxe régionale, exonérée TVA) - 0 pour DA/DC
    const prixCarteGrise = (formData.type === 'DA' || formData.type === 'DC') ? 0 : carteGrisePrice;
    
    // Total des services
    const totalServicesHT = fraisDossierHT;
    
    // Total TTC = carte grise + services (pas de TVA)
    const totalTTC = prixCarteGrise + totalServicesHT;

    await supabase
      .from('demarches')
      .update({
        prix_carte_grise: prixCarteGrise,
        frais_dossier: fraisDossierHT,
        montant_ht: totalServicesHT,
        montant_ttc: totalTTC,
      } as any)
      .eq('id', demarcheId);
  };

  const loadExistingDocuments = async () => {
    if (!demarcheId) return;

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('demarche_id', demarcheId);

    if (documents && documents.length > 0) {
      const docTypes = new Set(documents.map(doc => doc.type_document));
      setUploadedDocuments(docTypes);
    }
  };

  const loadGarage = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('garages')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setGarage(data);
      setFreeTokenAvailable(data.free_token_available === true || data.unlimited_free_tokens === true);
      setTokenBalance(data.token_balance || 0);
    }
  };

  const loadActionsRapides = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('actions_rapides')
      .select('*')
      .eq('actif', true)
      .order('ordre');

    if (data) {
      // Filtrer les actions test_only sauf pour test@test.com
      const userEmail = user.email?.toLowerCase();
      const isTestUser = userEmail === 'test@test.com';
      const filteredActions = data.filter((action: any) => {
        if (action.test_only) {
          return isTestUser;
        }
        return true;
      });
      setActionsRapides(filteredActions);
    }
  };

  const loadActionDetails = async () => {
    const { data: action } = await supabase
      .from('actions_rapides')
      .select('*')
      .eq('code', formData.type)
      .eq('actif', true)
      .single();

    if (action) {
      setActionDetails(action);

      const { data: docs } = await supabase
        .from('action_documents')
        .select('*')
        .eq('action_id', action.id)
        .order('ordre');

      setDocumentsRequis(docs || []);
    }
  };

  const handleAutoCreateDraft = async () => {
    if (!garage || demarcheId || !actionDetails) return;

    // Le jeton gratuit ne s'applique qu'aux démarches DA et DC
    const isFreeTokenApplicable = freeTokenAvailable && (formData.type === 'DA' || formData.type === 'DC');

    // Frais de dossier = prix de l'action (0 si jeton gratuit ET DA/DC uniquement)
    const fraisDossierHT = isFreeTokenApplicable ? 0 : actionDetails.prix;
    
    // Prix carte grise (taxe régionale, exonérée TVA) - 0 pour DA/DC
    const prixCarteGrise = (formData.type === 'DA' || formData.type === 'DC') ? 0 : carteGrisePrice;
    
    // Total des services (pas d'options au début)
    const totalServicesHT = fraisDossierHT;
    
    // Total TTC = carte grise + services (pas de TVA)
    const totalTTC = prixCarteGrise + totalServicesHT;

    const { data, error } = await supabase
      .from('demarches')
      .insert({
        garage_id: garage.id,
        type: formData.type,
        immatriculation: selectedImmatriculation || 'TEMP',
        commentaire: formData.commentaire,
        prix_carte_grise: prixCarteGrise,
        frais_dossier: fraisDossierHT,
        montant_ht: totalServicesHT,
        montant_ttc: totalTTC,
        status: 'en_saisie',
        is_draft: true,
        paye: false,
        vehicule_id: selectedVehicleId,
        // Le jeton gratuit ne s'applique qu'aux DA/DC
        is_free_token: isFreeTokenApplicable
      } as any)
      .select()
      .single();

    if (!error && data) {
      setDemarcheId(data.id);
    }
  };

  const handleVehicleSelect = (vehicleId: string, immatriculation: string, vehicleData?: any) => {
    setSelectedVehicleId(vehicleId);
    setSelectedImmatriculation(immatriculation);
  };

  const handlePriceCalculated = (price: number) => {
    setCarteGrisePrice(price);
    setPrixCarteGrise(price);
  };

  // Load frais_dossier from pricing config for CG
  useEffect(() => {
    if (actionDetails && formData.type === 'CG') {
      setFraisDossier(actionDetails.prix || 30);
    }
  }, [actionDetails, formData.type]);

  // CG payment link URL
  const cgPaymentUrl = clientPaymentLinkId
    ? `${window.location.origin}/completer-demarche/${clientPaymentLinkId}`
    : "";

  // Generate QR code for CG payment link
  useEffect(() => {
    if (cgPaymentUrl) {
      QRCode.toDataURL(cgPaymentUrl, { width: 400, margin: 2 })
        .then(setCgQrDataUrl)
        .catch(console.error);
    } else {
      setCgQrDataUrl("");
    }
  }, [cgPaymentUrl]);

  const copyCgLink = async () => {
    await navigator.clipboard.writeText(cgPaymentUrl);
    setCgCopied(true);
    setTimeout(() => setCgCopied(false), 2000);
    toast({ title: "Lien copie !" });
  };

  const downloadCgQr = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(cgPaymentUrl, { width: 600, margin: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-paiement-cg-${clientPaymentLinkId}.png`;
      a.click();
    } catch (err) {
      console.error("QR download error:", err);
    }
  };

  const sendCgEmailToClient = async () => {
    if (!cgClientEmail) return;
    setCgSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: cgClientEmail,
          subject: `Paiement carte grise - ${selectedImmatriculation}`,
          html: `<p>Bonjour${cgClientName ? ` ${cgClientName}` : ""},</p>
<p>Votre professionnel a initié une démarche de carte grise pour votre véhicule ${selectedImmatriculation}.</p>
<p><strong>Montant à régler :</strong> ${formatPrice(paymentOption === 'garage_dossier' ? prixCarteGrise : fraisDossier + prixCarteGrise)} EUR</p>
<p>Pour procéder au paiement, cliquez sur le lien ci-dessous :</p>
<p><a href="${cgPaymentUrl}" style="display:inline-block;padding:12px 24px;background:#1B2A4A;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Payer maintenant</a></p>
<p style="color:#888;font-size:13px;">Ou copiez ce lien : ${cgPaymentUrl}</p>
<p>Cordialement,<br/>${siteConfig.siteName}</p>`,
        },
      });
      if (error) throw error;
      toast({ title: "Email envoyé", description: `Lien envoyé à ${cgClientEmail}` });
    } catch (err: any) {
      toast({ title: "Erreur d'envoi", description: err.message, variant: "destructive" });
    } finally {
      setCgSendingEmail(false);
    }
  };

  const handleCgSubmit = async () => {
    if (!demarcheId || !garage) return;
    setCgSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("deduct-tokens-and-create-demarche", {
        body: {
          garage_id: garage.id,
          demarche_id: demarcheId,
          demarche_type: 'CG',
          immatriculation: selectedImmatriculation,
          payment_option: paymentOption,
          frais_dossier: fraisDossier,
          prix_carte_grise: prixCarteGrise,
          client_name: cgClientName || null,
          client_email: cgClientEmail || null,
        },
      });

      if (error) throw error;

      if (paymentOption === 'garage_tout') {
        // Option B: garage pays everything, no client payment needed
        setTokenBalance((prev) => prev - (fraisDossier + prixCarteGrise));
        toast({
          title: "Démarche créée !",
          description: "Le dossier est en attente de traitement.",
        });
        navigate("/mes-demarches");
      } else {
        // Option A or C: client needs to pay
        setClientPaymentLinkId(data?.payment_link_id || data?.id);
        if (paymentOption === 'garage_dossier') {
          setTokenBalance((prev) => prev - fraisDossier);
        }
        setCgSuccessScreen(true);
      }
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setCgSubmitting(false);
    }
  };


  const getFraisDossier = () => {
    // Si jeton gratuit disponible ET DA/DC, le prix de l'action est 0
    if (isFreeTokenEligible) return 0;
    return actionDetails?.prix || 0;
  };

  const getOriginalFraisDossier = () => {
    return actionDetails?.prix || 0;
  };

  const getTotalPrice = () => {
    const basePrice = getFraisDossier();
    // Pour DA, DC et démarches PRO, pas de prix carte grise
    const vehiclePrice = (formData.type === 'DA' || formData.type === 'DC' || PRO_DEMARCHE_TYPES.includes(formData.type)) ? 0 : carteGrisePrice;
    return basePrice + vehiclePrice;
  };

  // Calcul du coût en jetons (1 jeton = 5€, arrondi au supérieur)
  const getTokenCost = () => {
    // Pour les CG, le calcul est basé sur les frais de dossier uniquement (pas la carte grise)
    const fraisToConvert = getFraisDossier();
    return Math.ceil(fraisToConvert / 5);
  };

  const canPayWithTokens = () => {
    const tokenCost = getTokenCost();
    return tokenCost > 0 && tokenBalance >= tokenCost;
  };

  const handleTokenPayment = async () => {
    if (!demarcheId || !garage) return;
    
    const tokenCost = getTokenCost();
    
    if (tokenBalance < tokenCost) {
      toast({
        title: "Solde insuffisant",
        description: `Vous avez ${tokenBalance} jeton(s), mais ${tokenCost} sont nécessaires.`,
        variant: "destructive"
      });
      return;
    }

    setPayingWithTokens(true);

    try {
      // Déduire les jetons du solde
      const newBalance = tokenBalance - tokenCost;
      const { error: updateError } = await supabase
        .from('garages')
        .update({ token_balance: newBalance })
        .eq('id', garage.id);

      if (updateError) throw updateError;

      // Marquer la démarche comme payée avec jetons
      await supabase
        .from('demarches')
        .update({
          paye: true,
          paid_with_tokens: true,
          is_draft: false,
          documents_complets: true,
        })
        .eq('id', demarcheId);

      // Mettre à jour le solde local
      setTokenBalance(newBalance);

      // Fermer le dialog et traiter comme un succès
      setShowPaymentDialog(false);
      await handlePaymentSuccess();

    } catch (error) {
      console.error("Error processing token payment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement par jetons",
        variant: "destructive"
      });
    } finally {
      setPayingWithTokens(false);
    }
  };

  // handleTrackingServiceChange supprimé - options SMS retirées

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation spécifique pour les démarches PRO
    if (PRO_DEMARCHE_TYPES.includes(formData.type)) {
      // Vérifier que le questionnaire est complété
      if (!questionnaireCompleted) {
        toast({
          title: "Questionnaire incomplet",
          description: "Veuillez répondre à toutes les questions avant de continuer",
          variant: "destructive"
        });
        return;
      }

      // Note: Pour les PRO_TYPES_WITH_VEHICLE, la validation est faite plus bas avec vehicleInfoProValid

      // Vérifier les infos véhicule pour les démarches qui les requièrent
      if (PRO_TYPES_WITH_VEHICLE.includes(formData.type) && !vehicleInfoProValid) {
        toast({
          title: "Informations véhicule incomplètes",
          description: "Veuillez remplir toutes les informations obligatoires du véhicule (VIN, marque, modèle)",
          variant: "destructive"
        });
        return;
      }
    } else {
      // Validation classique pour les démarches non-PRO
      if (!selectedImmatriculation.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner ou créer un véhicule",
          variant: "destructive"
        });
        return;
      }
    }

    // Check if all obligatory documents are uploaded
    if (PRO_DEMARCHE_TYPES.includes(formData.type)) {
      // Pour les démarches PRO, on utilise les documents du composant DocumentsNecessaires
      if (proDocsState.blockingMessage) {
        toast({
          title: "Démarche impossible",
          description: proDocsState.blockingMessage,
          variant: "destructive",
        });
        return;
      }

      if (!proDocsState.allRequiredUploaded) {
        toast({
          title: "Documents obligatoires manquants",
          description: "Veuillez uploader toutes les pièces justificatives obligatoires avant de passer au paiement.",
          variant: "destructive",
        });
        return;
      }
    } else {
      const requiredDocs = documentsRequis.filter(doc => doc.obligatoire);
      
      // Trouver l'index de la première carte grise à dédoubler (sans recto/verso dans le nom)
      const firstCarteGriseIdx = documentsRequis.findIndex(d => {
        const name = d.nom_document.toLowerCase();
        return name.includes('carte grise') && !name.includes('recto') && !name.includes('verso');
      });
      
      const uploadedRequiredDocs = requiredDocs.filter((doc, idx) => {
        // Récupérer l'index du document dans la liste complète
        const docIndex = documentsRequis.indexOf(doc);
        const docKey = `doc_${docIndex + 1}`;
        const docName = doc.nom_document.toLowerCase();
        const isCarteGrise = docName.includes('carte grise') && 
                            !docName.includes('recto') && 
                            !docName.includes('verso');
        
        // Pour la PREMIÈRE carte grise à dédoubler uniquement, vérifier si au moins le recto est uploadé
        if (isCarteGrise && docIndex === firstCarteGriseIdx) {
          return uploadedDocuments.has(`${docKey}_recto`) || uploadedDocuments.has(docKey);
        }
        
        // Pour tous les autres documents (y compris ceux avec "recto/verso" dans le nom), vérifier normalement
        return uploadedDocuments.has(docKey);
      });
      
      if (uploadedRequiredDocs.length < requiredDocs.length) {
        toast({
          title: "Documents obligatoires manquants",
          description: `Veuillez télécharger tous les documents obligatoires (${uploadedRequiredDocs.length}/${requiredDocs.length})`,
          variant: "destructive"
        });
        return;
      }
    }

    // Update before payment
    if (demarcheId) {
      // Pour les démarches PRO avec infos véhicule, créer un véhicule dans la base
      let vehicleIdToUse = selectedVehicleId;
      
      if (PRO_TYPES_WITH_VEHICLE.includes(formData.type) && vehicleInfoPro && garage) {
        // Créer un véhicule avec les infos PRO
        const { data: newVehicle, error: vehicleError } = await supabase
          .from('vehicules')
          .insert({
            garage_id: garage.id,
            immatriculation: selectedImmatriculation || `VIN-${vehicleInfoPro.vin?.slice(-6) || 'PRO'}`,
            marque: vehicleInfoPro.marque,
            modele: vehicleInfoPro.modele,
            vin: vehicleInfoPro.vin,
            date_mec: vehicleInfoPro.date_mec || null
          })
          .select()
          .single();
        
        if (!vehicleError && newVehicle) {
          vehicleIdToUse = newVehicle.id;
        }
      }
      
      await supabase
        .from('demarches')
        .update({
          immatriculation: selectedImmatriculation,
          commentaire: formData.commentaire,
          vehicule_id: vehicleIdToUse
        })
        .eq('id', demarcheId);
    }

    // Si le montant total est 0, valider directement sans paiement
    if (getTotalPrice() === 0) {
      await handlePaymentSuccess();
      return;
    }

    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = async () => {
    if (!demarcheId) return;

    // Mark payment as completed to prevent cleanup deletion
    setPaymentCompleted(true);

    // Save questionnaire responses if any
    if (Object.keys(questionnaireAnswers).length > 0 && actionDetails) {
      try {
        // Load questions to get question texts
        const { data: questionsData } = await supabase
          .from('action_questions')
          .select('id, question_text')
          .eq('action_id', actionDetails.id);

        const questionsMap = new Map(questionsData?.map(q => [q.id, q.question_text]) || []);

        // Save each response
        for (const [questionId, optionId] of Object.entries(questionnaireAnswers)) {
          const questionText = questionsMap.get(questionId) || '';
          const answerText = questionnaireAnswerTexts[questionId] || '';
          
          if (questionText && answerText) {
            await supabase
              .from('demarche_questionnaire_responses')
              .upsert({
                demarche_id: demarcheId,
                question_id: questionId,
                option_id: optionId,
                question_text: questionText,
                answer_text: answerText,
              }, {
                onConflict: 'demarche_id,question_id'
              });
          }
        }
      } catch (error) {
        console.error('Error saving questionnaire responses:', error);
      }
    }

    // Update demarche to mark as not draft
    await supabase
      .from('demarches')
      .update({
        is_draft: false,
        documents_complets: true,
      })
      .eq('id', demarcheId);

    // Charger les données de la démarche pour l'envoi des mails
    const { data: demarche } = await supabase
      .from('demarches')
      .select('*, vehicules(*)')
      .eq('id', demarcheId)
      .single();

    // Si jeton gratuit utilisé (DA/DC uniquement)
    if (isFreeTokenEligible && garage) {
      // Marquer le jeton comme consommé seulement si ce n'est pas un compte avec jetons illimités
      if (!garage.unlimited_free_tokens) {
        await supabase
          .from('garages')
          .update({ free_token_available: false })
          .eq('id', garage.id);
        
        setFreeTokenAvailable(false);
      }

      // Toujours envoyer les mails admin pour les démarches avec jeton gratuit
      if (demarche) {
        const adminEmails = ["contact@sivflow.fr"];
        for (const adminEmail of adminEmails) {
          await supabase.functions.invoke("send-email", {
            body: {
              type: "admin_new_demarche",
              to: adminEmail,
              data: {
                type: `Démarche garage - ${demarche.type}`,
                reference: demarche.numero_demarche || demarcheId,
                immatriculation: demarche.immatriculation,
                client_name: garage.raison_sociale || "N/A",
                montant_ttc: demarche.montant_ttc?.toFixed(2) || "0.00",
                is_free_token: true,
              },
            },
          });
        }

        // Email de confirmation au garage (jeton gratuit)
        await supabase.functions.invoke("send-email", {
          body: {
            type: "garage_demarche_confirmation",
            to: garage.email,
            data: {
              garage_name: garage.raison_sociale,
              type: demarche.type,
              reference: demarche.numero_demarche || demarcheId,
              immatriculation: demarche.immatriculation,
              montant_ttc: demarche.montant_ttc?.toFixed(2) || "0.00",
              is_free_token: true,
            },
          },
        });
      }
    } else {
      // Démarche payante - envoyer email de confirmation au garage
      if (demarche && garage) {
        await supabase.functions.invoke("send-email", {
          body: {
            type: "garage_demarche_confirmation",
            to: garage.email,
            data: {
              garage_name: garage.raison_sociale,
              type: demarche.type,
              reference: demarche.numero_demarche || demarcheId,
              immatriculation: demarche.immatriculation,
              montant_ttc: demarche.montant_ttc?.toFixed(2) || "0.00",
              is_free_token: false,
            },
          },
        });
      }
    }

    toast({
      title: "Paiement validé",
      description: "Votre démarche a été soumise avec succès"
    });

    navigate("/mes-demarches");
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
  };

  const handleDocumentUploadComplete = (documentType: string) => {
    setUploadedDocuments(prev => new Set(prev).add(documentType));
    // Reload documents to ensure count is accurate
    loadExistingDocuments();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  const requiredDocsCount = documentsRequis.filter(doc => doc.obligatoire).length;
  const allDocsUploaded = uploadedDocuments.size >= requiredDocsCount;

  // Determine current step for progress bar
  const getCurrentStep = () => {
    if (!formData.type) return 0;
    if (!selectedImmatriculation.trim() && !PRO_TYPES_WITHOUT_VEHICLE.includes(formData.type) && !PRO_TYPES_WITH_VEHICLE.includes(formData.type)) return 1;
    if (PRO_TYPES_WITH_VEHICLE.includes(formData.type) && !vehicleInfoProValid) return 1;
    return 2;
  };
  const currentStep = getCurrentStep();
  const v4Steps = [
    { label: "Type", completed: !!formData.type },
    { label: "Véhicule", completed: !!selectedImmatriculation.trim() || PRO_TYPES_WITHOUT_VEHICLE.includes(formData.type) || (PRO_TYPES_WITH_VEHICLE.includes(formData.type) && vehicleInfoProValid) },
    { label: "Documents", completed: PRO_DEMARCHE_TYPES.includes(formData.type) ? proDocsState.allRequiredUploaded : allDocsUploaded },
    { label: "Paiement", completed: false },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#FDF8F0' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nouvelle démarche</h1>
          <p className="text-gray-500">Créez une nouvelle démarche administrative pour un véhicule</p>
        </div>

        {/* Progress bar */}
        <div className="mb-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            {v4Steps.map((step, idx) => (
              <div key={idx} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step.completed ? 'bg-green-500 text-white' : idx === currentStep ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.completed ? <Check className="h-5 w-5" /> : idx + 1}
                  </div>
                  <span className={`mt-2 text-xs font-medium ${step.completed ? 'text-green-600' : idx === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>{step.label}</span>
                </div>
                {idx < v4Steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-3 rounded-full transition-all duration-300 ${step.completed ? 'bg-green-400' : 'bg-gray-100'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,360px] gap-8">
          <div className="space-y-6">
            {!cgSuccessScreen && isFreeTokenEligible && (
              <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800 mb-1">Offre de bienvenue activée</p>
                  <p className="text-sm text-green-700">Les frais de dossier sont offerts pour cette démarche ! Cette démarche sera entièrement gratuite.</p>
                </div>
              </div>
            )}
            {!cgSuccessScreen && freeTokenAvailable && !isFreeTokenEligible && (formData.type === 'DA' || formData.type === 'DC' || !formData.type) && (
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-800 mb-1">Offre de bienvenue disponible</p>
                  <p className="text-sm text-blue-700">Votre jeton gratuit est utilisable uniquement pour une Déclaration de cession ou une Déclaration d'achat.</p>
                </div>
              </div>
            )}
            {!cgSuccessScreen && <form onSubmit={handleSubmitPayment} className="space-y-6">
              {/* Selected demarche type */}
              {actionDetails && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Type de démarche</p>
                  <p className="text-lg font-bold text-gray-900">{actionDetails.titre}</p>
                  {actionDetails.description && (
                    <p className="text-sm text-gray-500 mt-1">{actionDetails.description}</p>
                  )}
                </div>
              )}

              {garage && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">2</div>
                    Véhicule
                  </h2>
                  {formData.type === 'CG' ? (
                    <VehicleFormCG
                      garageId={garage.id}
                      onVehicleSelect={handleVehicleSelect}
                      selectedVehicleId={selectedVehicleId}
                      onPriceCalculated={handlePriceCalculated}
                    />
                  ) : (formData.type === 'DA' || formData.type === 'DC' || PRO_TYPES_WITH_PLATE.includes(formData.type)) ? (
                    <VehicleFormSimple
                      garageId={garage.id}
                      onVehicleSelect={handleVehicleSelect}
                      selectedVehicleId={selectedVehicleId}
                    />
                  ) : PRO_TYPES_WITH_VEHICLE.includes(formData.type) ? (
                    /* Formulaire véhicule PRO (VIN, marque, modèle sans immatriculation) */
                    <VehicleInfoFormPro
                      onVehicleInfoChange={(data, isValid) => {
                        setVehicleInfoPro(data);
                        setVehicleInfoProValid(isValid);
                        // Mettre une immatriculation temporaire basée sur le VIN
                        if (data.vin) {
                          setSelectedImmatriculation(`VIN-${data.vin.slice(-6)}`);
                        }
                      }}
                      requireVin={PRO_TYPES_WITH_VEHICLE.includes(formData.type)}
                      requireDateMec={formData.type === 'WW_PROVISOIRE_PRO'}
                    />
                  ) : PRO_TYPES_WITHOUT_VEHICLE.includes(formData.type) ? (
                    <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                      <p className="text-sm text-blue-800">
                        Cette démarche est liée à votre entreprise et non à un véhicule précis.
                        Aucune information véhicule n'est requise.
                      </p>
                    </div>
                  ) : !PRO_DEMARCHE_TYPES.includes(formData.type) && (
                    <VehicleForm
                      garageId={garage.id}
                      onVehicleSelect={handleVehicleSelect}
                      selectedVehicleId={selectedVehicleId}
                      onPriceCalculated={handlePriceCalculated}
                    />
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <Label htmlFor="commentaire" className="text-sm font-semibold text-gray-700 mb-2 block">Commentaire (optionnel)</Label>
                <Textarea
                  id="commentaire"
                  placeholder="Informations complémentaires..."
                  value={formData.commentaire}
                  onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                  rows={3}
                  className="rounded-xl border-gray-200 min-h-[48px] focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>

              {/* Questions conditionnelles */}
              {actionDetails?.id && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <Collapsible open={isQuestionnaireOpen} onOpenChange={setIsQuestionnaireOpen}>
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <FileQuestion className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-semibold text-gray-900">Questions préalables</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {questionnaireCompleted && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                              <Check className="h-3 w-3" />
                              Complété
                            </span>
                          )}
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isQuestionnaireOpen ? "rotate-180" : ""}`} />
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                        <ActionQuestionnaire
                          actionId={actionDetails.id}
                          onAnswersChange={(answers, isBlocked, condDocs, allAnswered, answerTexts) => {
                            setQuestionnaireAnswers(answers);
                            setIsQuestionnaireBlocked(isBlocked);
                            setConditionalDocuments(condDocs);
                            setQuestionnaireAnswerTexts(answerTexts);
                            const completed = allAnswered && !isBlocked;
                            setQuestionnaireCompleted(completed);
                            if (completed) setIsQuestionnaireOpen(false);
                          }}
                        />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {/* Pièces justificatives - Bloc unique pour tous les types de démarches */}
              {formData.type && demarcheId && (
                <>
                  {/* ====== DÉMARCHES PRO ====== */}
                  {PRO_DEMARCHE_TYPES.includes(formData.type) && (
                    <div className="space-y-4">
                      {isQuestionnaireBlocked && (
                        <div className="rounded-2xl bg-red-50 border border-red-200 p-5">
                          <p className="font-semibold text-red-800 mb-1">Démarche impossible</p>
                          <p className="text-sm text-red-700">Une de vos réponses bloque cette démarche. Modifiez vos réponses dans le questionnaire.</p>
                        </div>
                      )}

                      {!isQuestionnaireBlocked && !questionnaireCompleted && (
                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
                          <p className="font-semibold text-amber-800 mb-1">Questionnaire à compléter</p>
                          <p className="text-sm text-amber-700">Répondez aux questions préalables ci-dessus pour afficher la liste des pièces justificatives.</p>
                        </div>
                      )}

                      {!isQuestionnaireBlocked && questionnaireCompleted && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">3</div>
                            Documents
                          </h2>
                        <DocumentsNecessaires
                          demarcheType={formData.type}
                          demarcheId={demarcheId}
                          questionnaireAnswers={questionnaireAnswerTexts}
                          onDocumentUpload={(docType) => {
                            setUploadedDocuments((prev) => new Set(prev).add(docType));
                            loadExistingDocuments();
                          }}
                          uploadedDocuments={uploadedDocuments}
                        />
                        </div>
                      )}
                    </div>
                  )}

                  {/* ====== DÉMARCHES CLASSIQUES ====== */}
                  {!PRO_DEMARCHE_TYPES.includes(formData.type) && (
                    /* Pour les démarches classiques */
                    documentsRequis.length > 0 && (formData.type === 'CG' ? carteGrisePrice > 0 : true) && (
                      <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                          <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">3</div>
                              Pièces justificatives
                            </h2>
                            {allDocsUploaded && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                                <FileCheck className="h-3.5 w-3.5" />
                                Complet
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            <span className="text-red-500 text-base font-bold">*</span> = Document obligatoire
                          </p>
                          
                          <div className="space-y-3">
                            {documentsRequis.map((doc, idx) => {
                              const docName = doc.nom_document.toLowerCase();
                              const hasRectoVerso = docName.includes('recto/verso') || docName.includes('recto verso');
                              const cerfaNumber = extractCerfaNumber(doc.nom_document);
                              const hasCerfa = cerfaNumber && cerfaExists(cerfaNumber);
                              
                              const renderDocLabel = (labelText: string, isObligatoire: boolean) => {
                                if (!hasCerfa || !cerfaNumber) {
                                  return (
                                    <Label className="text-sm font-medium flex items-center gap-2 flex-wrap">
                                      {labelText}
                                      {isObligatoire ? (
                                        <span className="text-destructive text-base font-bold">*</span>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">(optionnel)</span>
                                      )}
                                    </Label>
                                  );
                                }
                                
                                const cerfaRegex = /(\(cerfa\s+\d+(?:\*\d+)?\))/i;
                                const parts = labelText.split(cerfaRegex);
                                
                                return (
                                  <Label className="text-sm font-medium flex items-center gap-2 flex-wrap">
                                    {parts.map((part, index) => {
                                      if (cerfaRegex.test(part)) {
                                        return (
                                          <a
                                            key={index}
                                            href={getCerfaUrl(cerfaNumber)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 underline inline-flex items-center gap-1 font-medium"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            {part}
                                            <Download className="h-3 w-3" />
                                          </a>
                                        );
                                      }
                                      return <span key={index}>{part}</span>;
                                    })}
                                    {isObligatoire ? (
                                      <span className="text-destructive text-base font-bold">*</span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">(optionnel)</span>
                                    )}
                                  </Label>
                                );
                              };
                              
                              if (hasRectoVerso) {
                                const versoName = doc.nom_document
                                  .replace(/recto\/verso/gi, 'verso')
                                  .replace(/recto verso/gi, 'verso');
                                
                                return (
                                  <div key={doc.id} className="space-y-3">
                                    <div className="flex items-center gap-4">
                                      <div className="flex-1">
                                        {renderDocLabel(doc.nom_document, doc.obligatoire)}
                                      </div>
                                      <div className="w-[400px]">
                                        <DocumentUpload
                                          demarcheId={demarcheId}
                                          documentType={`doc_${idx + 1}`}
                                          label=""
                                          onUploadComplete={() => handleDocumentUploadComplete(`doc_${idx + 1}`)}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="flex-1">
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                          {versoName}
                                          <span className="text-muted-foreground text-xs">(Optionnel)</span>
                                        </Label>
                                      </div>
                                      <div className="w-[400px]">
                                        <DocumentUpload
                                          demarcheId={demarcheId}
                                          documentType={`doc_${idx + 1}_verso`}
                                          label=""
                                          onUploadComplete={() => handleDocumentUploadComplete(`doc_${idx + 1}_verso`)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              
                              return (
                                <div key={doc.id} className="flex items-center gap-4">
                                  <div className="flex-1">
                                    {renderDocLabel(doc.nom_document, doc.obligatoire)}
                                  </div>
                                  <div className="w-[400px]">
                                    <DocumentUpload
                                      demarcheId={demarcheId}
                                      documentType={`doc_${idx + 1}`}
                                      label=""
                                      onUploadComplete={() => handleDocumentUploadComplete(`doc_${idx + 1}`)}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-sm text-gray-500 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Pièces supplémentaires
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Optionnel</span>
                            </h3>
                            <button
                              type="button"
                              onClick={() => setAdditionalDocs([...additionalDocs, { id: Date.now(), name: "" }])}
                              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Ajouter
                            </button>
                          </div>

                          {additionalDocs.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-3">
                              Aucune pièce supplémentaire ajoutée
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {additionalDocs.map((doc, index) => (
                                <div key={doc.id} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                  <div className="flex-1 space-y-2">
                                    <Input
                                      placeholder="Nom du document (ex: Procuration, Mandat...)"
                                      value={doc.name}
                                      onChange={(e) => {
                                        const newDocs = [...additionalDocs];
                                        newDocs[index] = { ...doc, name: e.target.value };
                                        setAdditionalDocs(newDocs);
                                      }}
                                      className="rounded-xl border-gray-200 min-h-[48px] text-sm"
                                    />
                                    <DocumentUpload
                                      demarcheId={demarcheId}
                                      documentType={`autre_piece_${doc.id}`}
                                      customName={doc.name || `Pièce ${index + 1}`}
                                      label=""
                                      onUploadComplete={() => handleDocumentUploadComplete(`autre_piece_${doc.id}`)}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setAdditionalDocs(additionalDocs.filter((_, i) => i !== index))}
                                    className="mt-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </>
              )}

              {/* CG Payment Option Step */}
              {formData.type === 'CG' && carteGrisePrice > 0 && demarcheId && !cgSuccessScreen && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">4</div>
                    Option de paiement
                  </h2>
                  <PaymentOptionSelector
                    fraisDossier={fraisDossier}
                    prixCarteGrise={prixCarteGrise}
                    garageBalance={tokenBalance}
                    selectedOption={paymentOption}
                    onSelect={setPaymentOption}
                  />

                  {/* Client info for Options A and C (client needs to pay) */}
                  {paymentOption !== 'garage_tout' && (
                    <div className="mt-6 space-y-4 border-t border-gray-100 pt-5">
                      <p className="text-sm font-semibold text-gray-700">Informations client (pour le lien de paiement)</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>Nom du client</Label>
                          <Input
                            placeholder="Ex: Dupont Jean"
                            value={cgClientName}
                            onChange={(e) => setCgClientName(e.target.value)}
                            className="rounded-xl border-gray-200 min-h-[48px]"
                          />
                        </div>
                        <div>
                          <Label>Email du client</Label>
                          <Input
                            type="email"
                            placeholder="client@email.com"
                            value={cgClientEmail}
                            onChange={(e) => setCgClientEmail(e.target.value)}
                            className="rounded-xl border-gray-200 min-h-[48px]"
                          />
                          <p className="text-xs text-gray-400 mt-1">Si renseigné, le lien sera envoyé par email</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit button */}
              <button
                type={formData.type === 'CG' && carteGrisePrice > 0 ? 'button' : 'submit'}
                onClick={formData.type === 'CG' && carteGrisePrice > 0 ? handleCgSubmit : undefined}
                disabled={
                  cgSubmitting ||
                  loading ||
                  isQuestionnaireBlocked ||
                  (PRO_TYPES_WITH_VEHICLE.includes(formData.type) && !vehicleInfoProValid) ||
                  (PRO_DEMARCHE_TYPES.includes(formData.type) && !questionnaireCompleted) ||
                  (PRO_DEMARCHE_TYPES.includes(formData.type) && !proDocsState.allRequiredUploaded) ||
                  (!PRO_DEMARCHE_TYPES.includes(formData.type) && !selectedImmatriculation.trim()) ||
                  ((formData.type !== 'DA' && formData.type !== 'DC' && !PRO_DEMARCHE_TYPES.includes(formData.type)) && carteGrisePrice === 0)
                }
                className={`w-full rounded-full py-4 px-8 text-base font-semibold text-white transition-all duration-200 min-h-[48px] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isFreeTokenEligible ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {cgSubmitting ? 'Traitement en cours...' : isQuestionnaireBlocked ? 'Démarche impossible' : formData.type === 'CG' && carteGrisePrice > 0 ? (paymentOption === 'garage_tout' ? `Payer ${formatPrice(fraisDossier + prixCarteGrise)} EUR (jetons)` : paymentOption === 'garage_dossier' ? `Payer ${formatPrice(fraisDossier)} EUR et envoyer le lien au client` : 'Générer le lien de paiement client') : (isFreeTokenEligible && getTotalPrice() === 0 ? 'Valider gratuitement' : `Payer ${formatPrice(getTotalPrice())} EUR`)}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pb-2">
                <Lock className="h-3.5 w-3.5" />
                <span>Paiement sécurisé et crypté</span>
              </div>
            </form>}

            {/* CG Success Screen - Payment link created */}
            {cgSuccessScreen && clientPaymentLinkId && (
              <div className="space-y-6">
                {/* QR Fullscreen Modal */}
                {cgQrFullscreen && (
                  <div
                    className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => setCgQrFullscreen(false)}
                  >
                    <img src={cgQrDataUrl} alt="QR Code" className="w-[80vmin] h-[80vmin] max-w-[500px] max-h-[500px]" />
                    <p className="mt-4 text-lg font-semibold text-[#1B2A4A]">Paiement carte grise</p>
                    <p className="text-blue-600 font-bold text-xl">{selectedImmatriculation}</p>
                    <p className="mt-2 text-gray-400 text-sm">Le client scanne pour proceder au paiement</p>
                    <p className="mt-6 text-gray-300 text-xs">Cliquez pour fermer</p>
                    <Button variant="ghost" className="absolute top-4 right-4" onClick={() => setCgQrFullscreen(false)}>
                      <X className="w-6 h-6" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Lien de paiement créé</h2>
                    <p className="text-sm text-gray-500">
                      {cgClientEmail ? "Le lien a été envoyé au client par email." : "Partagez ce lien avec votre client pour qu'il procède au paiement."}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
                  {/* Payment link */}
                  <div className="bg-[#1B2A4A]/5 border-2 border-[#1B2A4A]/20 rounded-xl p-4">
                    <Label className="text-sm text-[#1B2A4A] font-semibold mb-2 block">Lien de paiement client</Label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={cgPaymentUrl} className="font-mono text-sm bg-white border-[#1B2A4A]/20" />
                      <Button onClick={copyCgLink} className={cgCopied ? "bg-green-600 hover:bg-green-700" : "bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"}>
                        {cgCopied ? <><Check className="w-4 h-4 mr-1" /> Copié</> : <><Copy className="w-4 h-4 mr-1" /> Copier</>}
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {cgClientEmail ? (
                      <Button variant="outline" className="w-full" onClick={sendCgEmailToClient} disabled={cgSendingEmail}>
                        {cgSendingEmail ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" /> Envoyer par email</>
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={() => {
                        window.open(`mailto:?subject=Paiement carte grise - ${selectedImmatriculation}&body=Bonjour,%0A%0AVeuillez procéder au paiement de votre carte grise en suivant ce lien :%0A${encodeURIComponent(cgPaymentUrl)}%0A%0ACordialement`, "_blank");
                      }}>
                        <Mail className="w-4 h-4 mr-2" /> Ouvrir dans email
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => setCgQrFullscreen(true)}>
                      <Maximize2 className="w-4 h-4 mr-2" /> QR plein écran
                    </Button>
                    <Button variant="outline" className="w-full" onClick={downloadCgQr}>
                      <Download className="w-4 h-4 mr-2" /> Télécharger QR
                    </Button>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-3 py-4">
                    <img src={cgQrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg border" />
                    <p className="text-sm text-gray-400">Le client scanne pour procéder au paiement</p>
                  </div>

                  {/* Info */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <p className="font-medium mb-1">En attente de paiement client</p>
                    <p>Le dossier sera visible dans vos démarches une fois le paiement client effectué.</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                    <p className="font-medium text-[#1B2A4A] mb-2">Récapitulatif</p>
                    <p><span className="text-gray-500">Immatriculation :</span> <span className="font-medium">{selectedImmatriculation}</span></p>
                    <p><span className="text-gray-500">Option :</span> <span className="font-medium">{paymentOption === 'garage_dossier' ? 'Garage paie frais de dossier' : 'Client paie tout'}</span></p>
                    <p><span className="text-gray-500">Montant client :</span> <span className="font-medium text-blue-600">{formatPrice(paymentOption === 'garage_dossier' ? prixCarteGrise : fraisDossier + prixCarteGrise)} EUR</span></p>
                    {cgClientName && <p><span className="text-gray-500">Client :</span> <span className="font-medium">{cgClientName}</span></p>}
                    {cgClientEmail && <p><span className="text-gray-500">Email :</span> <span className="font-medium">{cgClientEmail}</span></p>}
                  </div>
                </div>

                <div className="flex justify-center gap-3">
                  <Button onClick={() => navigate("/mes-demarches")} variant="outline" className="rounded-full">
                    Voir mes démarches
                  </Button>
                  <Button onClick={() => navigate("/nouvelle-demarche")} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 rounded-full">
                    <Plus className="w-4 h-4 mr-2" /> Nouvelle démarche
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Récapitulatif</h3>
                {actionDetails ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Démarche</span>
                      <span className="font-medium text-gray-900 text-right max-w-[180px]">{actionDetails.titre}</span>
                    </div>
                    {selectedImmatriculation && !selectedImmatriculation.startsWith('VIN-') && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Immatriculation</span>
                        <span className="font-mono font-semibold text-gray-900">{selectedImmatriculation}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-3 mt-3 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frais de dossier</span>
                        <span className="font-medium">{isFreeTokenEligible ? <span className="text-green-600">Offert</span> : `${formatPrice(getFraisDossier())} EUR`}</span>
                      </div>
                      {(formData.type !== 'DA' && formData.type !== 'DC' && !PRO_DEMARCHE_TYPES.includes(formData.type)) && carteGrisePrice > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Carte grise</span>
                          <span className="font-medium">{formatPrice(carteGrisePrice)} EUR</span>
                        </div>
                      )}
                    </div>
                    <div className="border-t-2 border-gray-900 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">{formatPrice(getTotalPrice())} EUR</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Sélectionnez un type de démarche</p>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <Shield className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Traitement rapide sous 24h</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <Lock className="h-5 w-5 text-blue-500 shrink-0" />
                  <span>Données sécurisées SSL</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                  <span>Traitement sous 24h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isFreeTokenEligible ? 'Confirmation de votre démarche offerte' : 'Paiement de la démarche'}
              </DialogTitle>
              <DialogDescription>
                {isFreeTokenEligible && (
                  <span className="block text-green-600 font-medium mb-2">Votre jeton gratuit sera utilisé pour cette démarche.</span>
                )}
                Frais de dossier : {isFreeTokenEligible ? (
                  <><span className="line-through text-gray-400">{formatPrice(getOriginalFraisDossier())} EUR</span> <span className="text-green-600 font-bold">0 EUR (offert)</span></>
                ) : `${formatPrice(getFraisDossier())} EUR`}
                {(formData.type !== 'DA' && formData.type !== 'DC') && carteGrisePrice > 0 && ` + Prix carte grise : ${formatPrice(carteGrisePrice)} EUR`}
                <br />
                Montant total : {formatPrice(getTotalPrice())} EUR
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {!isFreeTokenEligible && getTokenCost() > 0 && (
                <div className={`rounded-2xl border-2 p-5 ${canPayWithTokens() ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Coins className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Payer avec vos jetons</p>
                        <p className="text-sm text-gray-500">
                          Coût : {getTokenCost()} jeton{getTokenCost() > 1 ? 's' : ''} | Solde : {tokenBalance} jeton{tokenBalance > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleTokenPayment}
                      disabled={!canPayWithTokens() || payingWithTokens}
                      className="rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {payingWithTokens ? 'Paiement...' : canPayWithTokens() ? 'Utiliser mes jetons' : 'Solde insuffisant'}
                    </button>
                  </div>
                  {!canPayWithTokens() && tokenBalance > 0 && (
                    <p className="text-sm text-red-500 mt-2">
                      Il vous manque {getTokenCost() - tokenBalance} jeton{getTokenCost() - tokenBalance > 1 ? 's' : ''} pour cette démarche.
                    </p>
                  )}
                </div>
              )}

              {demarcheId && (
                <div>
                  {!isFreeTokenEligible && getTokenCost() > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 h-px bg-gray-200"></div>
                      <span className="text-sm text-gray-400">ou</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                  )}
                  <StripePayment
                    demarcheId={demarcheId}
                    amount={getTotalPrice()}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}