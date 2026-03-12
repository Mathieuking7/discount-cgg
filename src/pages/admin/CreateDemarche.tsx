import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Mail,
  Download,
  Maximize2,
  Plus,
  FileText,
  Car,
  Loader2,
  X,
  Users,
  Send,
  CreditCard,
  UserCheck,
  Upload,
  Trash2,
  Building2,
  User,
  AlertCircle,
} from "lucide-react";

interface DemarcheType {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  prix_base: number;
  prix_pro: number;
  require_vehicle_info: boolean;
  ordre: number;
}

interface RequiredDoc {
  id: string;
  nom_document: string;
  obligatoire: boolean;
}

interface UploadedDoc {
  nom: string;
  url: string;
  path: string;
  required_doc_id?: string;
}

type Mode = "client" | "admin" | null;
type ClientType = "particulier" | "pro" | null;

const ICON_MAP: Record<string, React.ReactNode> = {
  changement_titulaire: <Car className="w-6 h-6" />,
  duplicata: <FileText className="w-6 h-6" />,
  default: <FileText className="w-6 h-6" />,
};

// Map guest_demarche_types.code → actions_rapides.code (where docs live)
const DEMARCHE_TO_ACTION_CODE: Record<string, string> = {
  CG: "CG",
  DA: "DA",
  DC: "DC",
  DUPLICATA: "DUPLICATA_CG_PRO",
  CHGT_ADRESSE: "CHANGEMENT_ADRESSE_PRO",
  CG_NEUF: "CG_NEUF_PRO",
  COTITULAIRE: "COTITULAIRE_PRO",
  QUITUS_FISCAL: "CG",        // fallback
  MODIF_CG: "CG",             // fallback
  SUCCESSION: "CG",           // fallback
  DEMANDE_IMMAT: "CG_NEUF_PRO",
  CHGT_ADRESSE_LOCATAIRE: "CHANGEMENT_ADRESSE_PRO",
  IMMAT_CYCLO_ANCIEN: "CG_NEUF_PRO",
  ANNULER_CPI_WW: "ANNULER_CORRIGER_DC_DA_PRO",
  CPI_WW: "CG",
  FIV: "DA",
};

export default function CreateDemarche() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [demarcheTypes, setDemarcheTypes] = useState<DemarcheType[]>([]);
  const [selectedType, setSelectedType] = useState<DemarcheType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 2 form
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [notesAdmin, setNotesAdmin] = useState("");

  // Client type (pro / particulier)
  const [clientType, setClientType] = useState<ClientType>(null);

  // Required docs (from DB for this demarche type)
  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>([]);
  const [loadingRequiredDocs, setLoadingRequiredDocs] = useState(false);

  // Uploaded docs (keyed by required_doc_id for required ones, free for extras)
  const [docs, setDocs] = useState<UploadedDoc[]>([]);

  // Upload form for extra doc
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  // Per-required-doc upload state
  const [uploadingReqDoc, setUploadingReqDoc] = useState<string | null>(null);

  // Step 3 result
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrFullscreen, setQrFullscreen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    if (user) checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
    if (!user) return;
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/dashboard");
      return;
    }

    const { data, error } = await supabase
      .from("guest_demarche_types")
      .select("id, code, titre, description, prix_base, prix_pro, require_vehicle_info, ordre")
      .eq("actif", true)
      .order("ordre");

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les types de demarches", variant: "destructive" });
    } else {
      setDemarcheTypes((data || []) as DemarcheType[]);
    }
    setLoading(false);
  };

  // Load required docs via action_documents (same source as garages + particuliers)
  useEffect(() => {
    if (!selectedType || !clientType || mode !== "admin") return;
    const loadRequiredDocs = async () => {
      setLoadingRequiredDocs(true);
      try {
        // 1. Find the matching action in actions_rapides
        const actionCode = DEMARCHE_TO_ACTION_CODE[selectedType.code] || selectedType.code;
        const { data: actions } = await supabase
          .from("actions_rapides")
          .select("id")
          .eq("code", actionCode)
          .limit(1);

        if (!actions || actions.length === 0) {
          setRequiredDocs([]);
          setLoadingRequiredDocs(false);
          return;
        }

        // 2. Load action_documents for this action
        const { data: docs } = await supabase
          .from("action_documents")
          .select("id, nom_document, obligatoire")
          .eq("action_id", actions[0].id)
          .order("ordre");

        setRequiredDocs(
          (docs || []).map((d) => ({
            id: d.id,
            nom_document: d.nom_document,
            obligatoire: d.obligatoire,
          }))
        );
      } catch {
        setRequiredDocs([]);
      }
      setLoadingRequiredDocs(false);
    };
    loadRequiredDocs();
    // Clear uploads when type/clientType changes
    setDocs([]);
  }, [selectedType, clientType, mode]);

  const paymentUrl = createdOrderId
    ? `${window.location.origin}/commander/${createdOrderId}`
    : "";

  useEffect(() => {
    if (paymentUrl) {
      QRCode.toDataURL(paymentUrl, { width: 400, margin: 2 })
        .then(setQrDataUrl)
        .catch(console.error);
    } else {
      setQrDataUrl("");
    }
  }, [paymentUrl]);

  // Upload a required doc
  const handleUploadRequiredDoc = async (reqDocId: string, reqDocName: string, file: File) => {
    setUploadingReqDoc(reqDocId);
    try {
      const path = `admin/pending/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("guest-documents")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("guest-documents").getPublicUrl(path);

      // Remove existing upload for this required doc if any
      const existing = docs.find((d) => d.required_doc_id === reqDocId);
      if (existing) {
        await supabase.storage.from("guest-documents").remove([existing.path]);
        setDocs((prev) => prev.filter((d) => d.required_doc_id !== reqDocId));
      }

      setDocs((prev) => [
        ...prev,
        { nom: reqDocName, url: urlData.publicUrl, path, required_doc_id: reqDocId },
      ]);
      toast({ title: "Document uploadé", description: reqDocName });
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingReqDoc(null);
    }
  };

  // Upload an extra (free) doc
  const handleUploadExtraDoc = async () => {
    if (!docName.trim() || !docFile) return;
    setUploadingDoc(true);
    try {
      const path = `admin/pending/${Date.now()}_${docFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("guest-documents")
        .upload(path, docFile, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("guest-documents").getPublicUrl(path);
      setDocs((prev) => [...prev, { nom: docName.trim(), url: urlData.publicUrl, path }]);
      setDocName("");
      setDocFile(null);
      toast({ title: "Document ajouté" });
    } catch (err: any) {
      toast({ title: "Erreur upload", description: err.message, variant: "destructive" });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRemoveDoc = async (doc: UploadedDoc) => {
    await supabase.storage.from("guest-documents").remove([doc.path]);
    setDocs((prev) => prev.filter((d) => d.path !== doc.path));
  };

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);

    try {
      const prix = clientType === "pro"
        ? (selectedType.prix_pro || selectedType.prix_base)
        : selectedType.prix_base;

      const { data, error } = await supabase
        .from("guest_orders")
        .insert({
          demarche_type: selectedType.code,
          immatriculation: immatriculation || "A_RENSEIGNER",
          nom: clientName || "Client",
          prenom: "",
          email: clientEmail || "noreply@sivflow.fr",
          telephone: "",
          adresse: "",
          code_postal: "",
          ville: "",
          status: "en_attente",
          montant_ht: prix,
          montant_ttc: prix,
          commentaire: notesAdmin || null,
          vehicule_pro: clientType === "pro",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Save uploaded docs
      if (mode === "admin" && docs.length > 0) {
        const docInserts = docs.map((d) => ({
          guest_order_id: data.id,
          nom_document: d.nom,
          fichier_url: d.url,
          valide: true,
        }));
        await supabase.from("guest_order_documents").insert(docInserts);
      }

      setCreatedOrderId(data.id);
      setStep(3);
      toast({ title: "Lien de paiement créé", description: "Partagez-le avec votre client." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Lien copié !" });
  };

  const downloadQr = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(paymentUrl, { width: 600, margin: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-demarche-${createdOrderId}.png`;
      a.click();
    } catch (err) {
      console.error("QR download error:", err);
    }
  };

  const sendEmailToClient = async () => {
    if (!clientEmail) return;
    setSendingEmail(true);
    try {
      const prix = clientType === "pro"
        ? (selectedType?.prix_pro || selectedType?.prix_base || 0)
        : (selectedType?.prix_base || 0);

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          type: "simple_text",
          to: clientEmail,
          data: {
            subject: `Votre démarche carte grise - ${selectedType?.titre}`,
            html: `<p>Bonjour${clientName ? ` ${clientName}` : ""},</p>
<p>Votre professionnel a initié une démarche de carte grise pour vous.</p>
<p><strong>Démarche :</strong> ${selectedType?.titre}</p>
<p><strong>Montant :</strong> ${prix.toFixed(2)} EUR</p>
<p>Pour procéder au paiement, cliquez sur le lien ci-dessous :</p>
<p><a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background:#1B2A4A;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Accéder à ma démarche et payer</a></p>
<p style="color:#888;font-size:13px;">Ou copiez ce lien : ${paymentUrl}</p>
<p>Cordialement,<br/>King Carte Grise</p>`,
          },
        },
      });
      if (error) throw error;
      toast({ title: "Email envoyé", description: `Lien envoyé à ${clientEmail}` });
    } catch (err: any) {
      toast({ title: "Erreur d'envoi", description: err.message, variant: "destructive" });
    } finally {
      setSendingEmail(false);
    }
  };

  const reset = () => {
    setMode(null);
    setStep(1);
    setSelectedType(null);
    setClientName("");
    setClientEmail("");
    setImmatriculation("");
    setNotesAdmin("");
    setClientType(null);
    setRequiredDocs([]);
    setCreatedOrderId(null);
    setQrDataUrl("");
    setCopied(false);
    setDocs([]);
    setDocName("");
    setDocFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2A4A]" />
      </div>
    );
  }

  const stepLabels = mode === "admin"
    ? [{ n: 1, label: "Type" }, { n: 2, label: "Client + Docs" }, { n: 3, label: "Lien" }]
    : [{ n: 1, label: "Type" }, { n: 2, label: "Client" }, { n: 3, label: "Lien" }];

  // Count required docs already uploaded
  const uploadedRequiredCount = requiredDocs.filter((rd) =>
    docs.some((d) => d.required_doc_id === rd.id)
  ).length;

  const prix = clientType === "pro"
    ? (selectedType?.prix_pro || selectedType?.prix_base || 0)
    : (selectedType?.prix_base || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* QR Fullscreen Modal */}
      {qrFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setQrFullscreen(false)}
        >
          <img src={qrDataUrl} alt="QR Code" className="w-[80vmin] h-[80vmin] max-w-[500px] max-h-[500px]" />
          <p className="mt-4 text-lg font-semibold text-[#1B2A4A]">{selectedType?.titre}</p>
          <p className="text-amber-600 font-bold text-xl">{prix.toFixed(2)} EUR</p>
          <p className="mt-2 text-gray-400 text-sm">Le client scanne pour payer</p>
          <p className="mt-6 text-gray-300 text-xs">Cliquez pour fermer</p>
          <Button variant="ghost" className="absolute top-4 right-4" onClick={() => setQrFullscreen(false)}>
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Créer une démarche pour un client</h1>
            <p className="text-gray-500 text-sm">Générez un lien de paiement que votre client utilisera pour payer sa démarche</p>
          </div>
        </div>

        {/* ── MODE SELECTION ── */}
        {!mode && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-4">Comment souhaitez-vous procéder ?</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Card
                className="p-6 cursor-pointer border-2 border-gray-200 hover:border-[#1B2A4A] hover:shadow-md transition-all rounded-xl"
                onClick={() => setMode("client")}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2A4A] text-base">Le client envoie ses documents lui-même</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Le client reçoit un lien, remplit ses infos, uploade ses documents et paie lui-même.
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Recommandé</span>
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer border-2 border-gray-200 hover:border-[#1B2A4A] hover:shadow-md transition-all rounded-xl"
                onClick={() => setMode("admin")}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                    <UserCheck className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2A4A] text-base">Je rentre les documents du client moi-même</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Vous uploadez les documents du client à sa place. Il reçoit juste le lien pour payer.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Documents pré-chargés</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── WIZARD ── */}
        {mode && (
          <>
            {/* Mode badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                mode === "admin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
              }`}>
                {mode === "admin" ? "📂 Vous uploadez les documents" : "👤 Le client envoie ses documents"}
              </span>
              {step === 1 && (
                <button className="text-xs text-gray-400 underline hover:text-gray-600" onClick={() => setMode(null)}>
                  Changer
                </button>
              )}
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {stepLabels.map(({ n, label }) => (
                <div key={n} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step >= n ? "bg-[#1B2A4A] text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {step > n ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{label}</span>
                  </div>
                  {n < 3 && <div className={`w-12 h-0.5 mb-5 ${step > n ? "bg-[#1B2A4A]" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>

            {/* ── STEP 1: Choose type ── */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Quel type de démarche pour votre client ?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {demarcheTypes.map((dt) => (
                    <Card
                      key={dt.id}
                      className={`p-5 cursor-pointer transition-all hover:shadow-md rounded-xl border-2 ${
                        selectedType?.id === dt.id
                          ? "border-amber-500 bg-amber-50/50 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedType(dt)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${selectedType?.id === dt.id ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                          {ICON_MAP[dt.code] || ICON_MAP.default}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1B2A4A]">{dt.titre}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{dt.code}</p>
                          {dt.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dt.description}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs text-gray-500">Particulier: <strong className="text-amber-600">{dt.prix_base.toFixed(2)}€</strong></span>
                            {dt.prix_pro > 0 && (
                              <span className="text-xs text-gray-500">Pro: <strong className="text-violet-600">{dt.prix_pro.toFixed(2)}€</strong></span>
                            )}
                          </div>
                        </div>
                        {selectedType?.id === dt.id && <Check className="w-5 h-5 text-amber-600 shrink-0" />}
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button disabled={!selectedType} onClick={() => setStep(2)} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Client info + (mode admin: clientType + docs) ── */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Client info */}
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">
                    Informations client {mode === "client" ? "(optionnel)" : ""}
                  </h2>
                  {mode === "client" && (
                    <p className="text-sm text-gray-500 mb-4">Le client pourra les modifier depuis le lien.</p>
                  )}
                  <Card className="p-6 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom du client</Label>
                        <Input placeholder="Ex: Dupont Jean" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                      </div>
                      <div>
                        <Label>Email du client</Label>
                        <Input type="email" placeholder="client@email.com" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                        <p className="text-xs text-gray-400 mt-1">Pour envoyer le lien de paiement par email</p>
                      </div>
                    </div>
                    {selectedType?.require_vehicle_info && (
                      <div>
                        <Label>Immatriculation</Label>
                        <Input placeholder="AA-123-BB" value={immatriculation} onChange={(e) => setImmatriculation(e.target.value.toUpperCase())} />
                      </div>
                    )}
                    <div>
                      <Label>Notes internes</Label>
                      <Textarea
                        placeholder="Notes visibles uniquement par vous..."
                        value={notesAdmin}
                        onChange={(e) => setNotesAdmin(e.target.value)}
                        rows={2}
                      />
                    </div>
                  </Card>
                </div>

                {/* Mode admin: client type + required docs */}
                {mode === "admin" && (
                  <div>
                    {/* ─ Client type choice ─ */}
                    <h2 className="text-lg font-semibold text-[#1B2A4A] mb-3">Le client est-il un Particulier ou un Pro ?</h2>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Card
                        className={`p-4 cursor-pointer border-2 transition-all rounded-xl ${
                          clientType === "particulier"
                            ? "border-blue-500 bg-blue-50/50 shadow"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setClientType("particulier")}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${clientType === "particulier" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1B2A4A]">Particulier</p>
                            <p className="text-sm font-bold text-amber-600">{selectedType?.prix_base.toFixed(2)} €</p>
                          </div>
                          {clientType === "particulier" && <Check className="w-5 h-5 text-blue-500 ml-auto" />}
                        </div>
                      </Card>

                      <Card
                        className={`p-4 cursor-pointer border-2 transition-all rounded-xl ${
                          clientType === "pro"
                            ? "border-violet-500 bg-violet-50/50 shadow"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setClientType("pro")}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${clientType === "pro" ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-500"}`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#1B2A4A]">Pro / Garage</p>
                            <p className="text-sm font-bold text-violet-600">
                              {selectedType && selectedType.prix_pro > 0
                                ? `${selectedType.prix_pro.toFixed(2)} €`
                                : `${selectedType?.prix_base.toFixed(2)} €`}
                            </p>
                          </div>
                          {clientType === "pro" && <Check className="w-5 h-5 text-violet-500 ml-auto" />}
                        </div>
                      </Card>
                    </div>

                    {/* ─ Required documents section (only shown after clientType chosen) ─ */}
                    {clientType && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-lg font-semibold text-[#1B2A4A]">Documents requis</h2>
                          {requiredDocs.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {uploadedRequiredCount}/{requiredDocs.length} uploadé{uploadedRequiredCount > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {loadingRequiredDocs ? (
                          <div className="flex items-center gap-2 text-gray-400 py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Chargement des documents requis...</span>
                          </div>
                        ) : requiredDocs.length === 0 ? (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="text-sm">Aucun document requis configuré pour cette démarche. Vous pouvez en ajouter manuellement ci-dessous.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 mb-4">
                            {requiredDocs.map((rd) => {
                              const uploaded = docs.find((d) => d.required_doc_id === rd.id);
                              return (
                                <div
                                  key={rd.id}
                                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                                    uploaded ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    {uploaded ? (
                                      <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-[#1B2A4A] truncate">{rd.nom_document}</p>
                                      <div className="flex items-center gap-2">
                                        {rd.obligatoire ? (
                                          <Badge variant="destructive" className="text-xs px-1.5 py-0">Obligatoire</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-xs px-1.5 py-0">Optionnel</Badge>
                                        )}
                                        {uploaded && (
                                          <a href={uploaded.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline">Voir</a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 ml-3 shrink-0">
                                    {uploaded ? (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                                        onClick={() => handleRemoveDoc(uploaded)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    ) : (
                                      <label className="cursor-pointer">
                                        <input
                                          type="file"
                                          accept="image/*,.pdf"
                                          className="hidden"
                                          disabled={uploadingReqDoc === rd.id}
                                          onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleUploadRequiredDoc(rd.id, rd.nom_document, f);
                                          }}
                                        />
                                        <span className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                                          uploadingReqDoc === rd.id
                                            ? "bg-gray-100 text-gray-400"
                                            : "bg-[#1B2A4A] text-white hover:bg-[#1B2A4A]/90"
                                        }`}>
                                          {uploadingReqDoc === rd.id ? (
                                            <><Loader2 className="w-3 h-3 animate-spin" /> Upload...</>
                                          ) : (
                                            <><Upload className="w-3 h-3" /> Uploader</>
                                          )}
                                        </span>
                                      </label>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Extra docs */}
                        <div className="border-t pt-4 mt-4">
                          <p className="text-sm font-medium text-gray-600 mb-3">Ajouter un document supplémentaire (optionnel)</p>
                          <Card className="p-4 rounded-xl space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <Label>Nom du document</Label>
                                <Input
                                  placeholder="Ex: Justificatif de domicile..."
                                  value={docName}
                                  onChange={(e) => setDocName(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Fichier</Label>
                                <Input type="file" accept="image/*,.pdf" onChange={(e) => setDocFile(e.target.files?.[0] || null)} />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              disabled={!docName.trim() || !docFile || uploadingDoc}
                              onClick={handleUploadExtraDoc}
                              className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"
                            >
                              {uploadingDoc ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload...</>
                              ) : (
                                <><Upload className="w-4 h-4 mr-2" /> Ajouter</>
                              )}
                            </Button>
                          </Card>

                          {/* Extra docs list */}
                          {docs.filter((d) => !d.required_doc_id).length > 0 && (
                            <div className="space-y-2 mt-3">
                              {docs.filter((d) => !d.required_doc_id).map((doc) => (
                                <div key={doc.path} className="flex items-center justify-between bg-white border rounded-lg px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-[#1B2A4A]">{doc.nom}</span>
                                    <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 underline">Voir</a>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleRemoveDoc(doc)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || (mode === "admin" && !clientType)}
                    className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Génération...</>
                    ) : (
                      <><CreditCard className="w-4 h-4 mr-2" /> Générer le lien de paiement</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Payment link ── */}
            {step === 3 && createdOrderId && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B2A4A]">Lien de paiement prêt</h2>
                    <p className="text-sm text-gray-500">
                      {mode === "admin"
                        ? "Les documents sont pré-chargés. Le client n'a plus qu'à payer."
                        : "Partagez ce lien avec votre client pour qu'il complète sa démarche et paie."}
                    </p>
                  </div>
                </div>

                {mode === "admin" && docs.length > 0 && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
                    ✅ {docs.length} document{docs.length > 1 ? "s" : ""} pré-chargé{docs.length > 1 ? "s" : ""} pour ce client
                    {clientType && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        clientType === "pro" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {clientType === "pro" ? "Pro" : "Particulier"}
                      </span>
                    )}
                  </div>
                )}

                <Card className="p-6 rounded-xl space-y-6">
                  <div className="bg-[#1B2A4A]/5 border-2 border-[#1B2A4A]/20 rounded-xl p-4">
                    <Label className="text-sm text-[#1B2A4A] font-semibold mb-2 block">Lien de paiement client</Label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={paymentUrl} className="font-mono text-sm bg-white border-[#1B2A4A]/20" />
                      <Button onClick={copyLink} className={copied ? "bg-green-600 hover:bg-green-700" : "bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"}>
                        {copied ? <><Check className="w-4 h-4 mr-1" /> Copié</> : <><Copy className="w-4 h-4 mr-1" /> Copier</>}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {mode === "admin"
                        ? "Le client n'a plus qu'à payer depuis ce lien. Les documents sont déjà chargés."
                        : "Le client pourra remplir ses informations, télécharger ses documents et payer."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {clientEmail ? (
                      <Button variant="outline" className="w-full" onClick={sendEmailToClient} disabled={sendingEmail}>
                        {sendingEmail ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Envoi...</>
                        ) : (
                          <><Send className="w-4 h-4 mr-2" /> Envoyer par email</>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(
                          `mailto:?subject=Votre demarche carte grise - ${selectedType?.titre}&body=Bonjour,%0A%0AVeuillez completer votre demarche en suivant ce lien :%0A${encodeURIComponent(paymentUrl)}%0A%0ACordialement`,
                          "_blank"
                        )}
                      >
                        <Mail className="w-4 h-4 mr-2" /> Ouvrir dans email
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => setQrFullscreen(true)}>
                      <Maximize2 className="w-4 h-4 mr-2" /> QR plein écran
                    </Button>
                    <Button variant="outline" className="w-full" onClick={downloadQr}>
                      <Download className="w-4 h-4 mr-2" /> Télécharger QR
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-3 py-4">
                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg border" />
                    <p className="text-sm text-gray-400">Le client scanne pour accéder au lien de paiement</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                    <p className="font-medium text-[#1B2A4A] mb-2">Récapitulatif</p>
                    <p><span className="text-gray-500">Démarche :</span> <span className="font-medium">{selectedType?.titre}</span></p>
                    <p><span className="text-gray-500">Montant :</span> <span className={`font-medium ${clientType === "pro" ? "text-violet-600" : "text-amber-600"}`}>{prix.toFixed(2)} EUR</span></p>
                    {clientType && <p><span className="text-gray-500">Type client :</span> <span className="font-medium">{clientType === "pro" ? "Pro / Garage" : "Particulier"}</span></p>}
                    {clientName && <p><span className="text-gray-500">Client :</span> <span className="font-medium">{clientName}</span></p>}
                    {clientEmail && <p><span className="text-gray-500">Email :</span> <span className="font-medium">{clientEmail}</span></p>}
                    {immatriculation && <p><span className="text-gray-500">Immatriculation :</span> <span className="font-medium">{immatriculation}</span></p>}
                    {mode === "admin" && docs.length > 0 && (
                      <p><span className="text-gray-500">Documents :</span> <span className="font-medium text-green-600">{docs.length} pré-chargé{docs.length > 1 ? "s" : ""}</span></p>
                    )}
                  </div>
                </Card>

                <div className="mt-6 flex justify-center">
                  <Button onClick={reset} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
                    <Plus className="w-4 h-4 mr-2" /> Créer une autre démarche
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
