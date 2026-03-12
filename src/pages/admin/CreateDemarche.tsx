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
} from "lucide-react";

interface DemarcheType {
  id: string;
  code: string;
  titre: string;
  description: string | null;
  prix_base: number;
  require_vehicle_info: boolean;
  ordre: number;
}

interface UploadedDoc {
  nom: string;
  url: string;
  path: string;
}

type Mode = "client" | "admin" | null;

const ICON_MAP: Record<string, React.ReactNode> = {
  changement_titulaire: <Car className="w-6 h-6" />,
  duplicata: <FileText className="w-6 h-6" />,
  default: <FileText className="w-6 h-6" />,
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

  // Mode admin — docs
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

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
      .select("*")
      .eq("actif", true)
      .order("ordre");

    if (error) {
      toast({ title: "Erreur", description: "Impossible de charger les types de demarches", variant: "destructive" });
    } else {
      setDemarcheTypes(data || []);
    }
    setLoading(false);
  };

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

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);

    try {
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
          commentaire: notesAdmin || null,
        })
        .select("id")
        .single();

      if (error) throw error;

      // Mode admin : save uploaded docs to guest_order_documents
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
      toast({ title: "Lien de paiement cree", description: "Partagez-le avec votre client." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDoc = async () => {
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

  const copyLink = async () => {
    await navigator.clipboard.writeText(paymentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Lien copie !" });
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
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          type: "simple_text",
          to: clientEmail,
          data: {
            subject: `Votre demarche carte grise - ${selectedType?.titre}`,
            html: `<p>Bonjour${clientName ? ` ${clientName}` : ""},</p>
<p>Votre professionnel a initie une demarche de carte grise pour vous.</p>
<p><strong>Demarche :</strong> ${selectedType?.titre}</p>
<p><strong>Montant :</strong> ${selectedType?.prix_base.toFixed(2)} EUR</p>
<p>Pour completer votre demarche, veuillez cliquer sur le lien ci-dessous. Vous pourrez remplir vos informations, telecharger vos documents et proceder au paiement :</p>
<p><a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background:#1B2A4A;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Completer ma demarche et payer</a></p>
<p style="color:#888;font-size:13px;">Ou copiez ce lien : ${paymentUrl}</p>
<p>Cordialement,<br/>King Carte Grise</p>`,
          },
        },
      });
      if (error) throw error;
      toast({ title: "Email envoye", description: `Lien envoye a ${clientEmail}` });
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

  // Step labels depend on mode
  const stepLabels = mode === "admin"
    ? [{ n: 1, label: "Type" }, { n: 2, label: "Client + Docs" }, { n: 3, label: "Lien" }]
    : [{ n: 1, label: "Type" }, { n: 2, label: "Client" }, { n: 3, label: "Lien" }];

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
          <p className="text-amber-600 font-bold text-xl">{selectedType?.prix_base.toFixed(2)} EUR</p>
          <p className="mt-2 text-gray-400 text-sm">Le client scanne pour completer et payer</p>
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
            <h1 className="text-2xl font-bold text-[#1B2A4A]">Creer une demarche pour un client</h1>
            <p className="text-gray-500 text-sm">Generez un lien de paiement que votre client utilisera pour completer et payer sa demarche</p>
          </div>
        </div>

        {/* ── MODE SELECTION ── */}
        {!mode && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-4">Comment souhaitez-vous proceder ?</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Option A — client sends docs */}
              <Card
                className="p-6 cursor-pointer border-2 border-gray-200 hover:border-[#1B2A4A] hover:shadow-md transition-all rounded-xl"
                onClick={() => setMode("client")}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2A4A] text-base">Le client envoie ses documents lui-meme</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Le client recoit un lien, remplit ses infos, uploade ses documents et paie lui-meme.
                    </p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Recommande</span>
                </div>
              </Card>

              {/* Option B — admin enters docs */}
              <Card
                className="p-6 cursor-pointer border-2 border-gray-200 hover:border-[#1B2A4A] hover:shadow-md transition-all rounded-xl"
                onClick={() => setMode("admin")}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
                    <UserCheck className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1B2A4A] text-base">Je rentre les documents du client moi-meme</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Vous uploadez les documents du client a sa place. Il recoit juste le lien pour payer.
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">Documents pre-charges</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── WIZARD (after mode selected) ── */}
        {mode && (
          <>
            {/* Mode badge + change */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                mode === "admin"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {mode === "admin" ? "📂 Vous uploadez les documents" : "👤 Le client envoie ses documents"}
              </span>
              {step === 1 && (
                <button
                  className="text-xs text-gray-400 underline hover:text-gray-600"
                  onClick={() => setMode(null)}
                >
                  Changer
                </button>
              )}
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {stepLabels.map(({ n, label }) => (
                <div key={n} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                        step >= n ? "bg-[#1B2A4A] text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step > n ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{label}</span>
                  </div>
                  {n < 3 && (
                    <div className={`w-12 h-0.5 mb-5 ${step > n ? "bg-[#1B2A4A]" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Choose type */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-[#1B2A4A] mb-4">Quel type de demarche pour votre client ?</h2>
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
                          {dt.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dt.description}</p>
                          )}
                          <p className="text-sm font-semibold text-amber-600 mt-2">{dt.prix_base.toFixed(2)} EUR</p>
                        </div>
                        {selectedType?.id === dt.id && (
                          <Check className="w-5 h-5 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    disabled={!selectedType}
                    onClick={() => setStep(2)}
                    className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"
                  >
                    Suivant <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Client info + (mode admin: docs) */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Client info */}
                <div>
                  <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">
                    Informations client {mode === "client" ? "(optionnel)" : ""}
                  </h2>
                  {mode === "client" && (
                    <p className="text-sm text-gray-500 mb-4">
                      Le client pourra les modifier ou les completer depuis le lien.
                    </p>
                  )}
                  <Card className="p-6 rounded-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Nom du client</Label>
                        <Input
                          placeholder="Ex: Dupont Jean"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Email du client</Label>
                        <Input
                          type="email"
                          placeholder="client@email.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">Pour envoyer le lien de paiement par email</p>
                      </div>
                    </div>

                    {selectedType?.require_vehicle_info && (
                      <div>
                        <Label>Immatriculation</Label>
                        <Input
                          placeholder="AA-123-BB"
                          value={immatriculation}
                          onChange={(e) => setImmatriculation(e.target.value.toUpperCase())}
                        />
                      </div>
                    )}

                    <div>
                      <Label>Notes internes</Label>
                      <Textarea
                        placeholder="Notes visibles uniquement par vous (non visibles par le client)..."
                        value={notesAdmin}
                        onChange={(e) => setNotesAdmin(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </Card>
                </div>

                {/* Mode admin: document upload section */}
                {mode === "admin" && (
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B2A4A] mb-1">Documents du client</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Uploadez les documents du client. Ils seront directement attaches a la demarche.
                    </p>

                    {/* Add doc form */}
                    <Card className="p-5 rounded-xl space-y-3 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label>Nom du document</Label>
                          <Input
                            placeholder="Ex: Carte d'identite, CG..."
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Fichier</Label>
                          <Input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!docName.trim() || !docFile || uploadingDoc}
                        onClick={handleUploadDoc}
                        className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"
                      >
                        {uploadingDoc ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Upload...</>
                        ) : (
                          <><Upload className="w-4 h-4 mr-2" /> Ajouter</>
                        )}
                      </Button>
                    </Card>

                    {/* Docs list */}
                    {docs.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Aucun document ajouté pour l'instant.</p>
                    ) : (
                      <div className="space-y-2">
                        {docs.map((doc) => (
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
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generation...</>
                    ) : (
                      <><CreditCard className="w-4 h-4 mr-2" /> Generer le lien de paiement</>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment link result */}
            {step === 3 && createdOrderId && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1B2A4A]">Lien de paiement pret</h2>
                    <p className="text-sm text-gray-500">
                      {mode === "admin"
                        ? "Les documents sont pre-charges. Partagez le lien au client pour qu'il paie."
                        : "Partagez ce lien avec votre client pour qu'il complete sa demarche et paie."}
                    </p>
                  </div>
                </div>

                {mode === "admin" && docs.length > 0 && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
                    ✅ {docs.length} document{docs.length > 1 ? "s" : ""} pre-charge{docs.length > 1 ? "s" : ""} pour ce client.
                  </div>
                )}

                <Card className="p-6 rounded-xl space-y-6">
                  {/* Payment link - prominent */}
                  <div className="bg-[#1B2A4A]/5 border-2 border-[#1B2A4A]/20 rounded-xl p-4">
                    <Label className="text-sm text-[#1B2A4A] font-semibold mb-2 block">Lien de paiement client</Label>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={paymentUrl} className="font-mono text-sm bg-white border-[#1B2A4A]/20" />
                      <Button onClick={copyLink} className={copied ? "bg-green-600 hover:bg-green-700" : "bg-[#1B2A4A] hover:bg-[#1B2A4A]/90"}>
                        {copied ? <><Check className="w-4 h-4 mr-1" /> Copie</> : <><Copy className="w-4 h-4 mr-1" /> Copier</>}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {mode === "admin"
                        ? "Le client n'a plus qu'a payer depuis ce lien. Les documents sont deja charges."
                        : "Le client pourra remplir ses informations, telecharger ses documents et payer directement depuis ce lien."}
                    </p>
                  </div>

                  {/* Actions row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {clientEmail ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={sendEmailToClient}
                        disabled={sendingEmail}
                      >
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
                        onClick={() => {
                          window.open(
                            `mailto:?subject=Votre demarche carte grise - ${selectedType?.titre}&body=Bonjour,%0A%0AVeuillez completer votre demarche et proceder au paiement en suivant ce lien :%0A${encodeURIComponent(paymentUrl)}%0A%0ACordialement`,
                            "_blank"
                          );
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" /> Ouvrir dans email
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={() => setQrFullscreen(true)}>
                      <Maximize2 className="w-4 h-4 mr-2" /> QR plein ecran
                    </Button>
                    <Button variant="outline" className="w-full" onClick={downloadQr}>
                      <Download className="w-4 h-4 mr-2" /> Telecharger QR
                    </Button>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-3 py-4">
                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 rounded-lg border" />
                    <p className="text-sm text-gray-400">Le client scanne pour acceder au lien de paiement</p>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
                    <p className="font-medium text-[#1B2A4A] mb-2">Recapitulatif</p>
                    <p><span className="text-gray-500">Demarche :</span> <span className="font-medium">{selectedType?.titre}</span></p>
                    <p><span className="text-gray-500">Montant :</span> <span className="font-medium text-amber-600">{selectedType?.prix_base.toFixed(2)} EUR</span></p>
                    {clientName && <p><span className="text-gray-500">Client :</span> <span className="font-medium">{clientName}</span></p>}
                    {clientEmail && <p><span className="text-gray-500">Email :</span> <span className="font-medium">{clientEmail}</span></p>}
                    {immatriculation && <p><span className="text-gray-500">Immatriculation :</span> <span className="font-medium">{immatriculation}</span></p>}
                    {mode === "admin" && docs.length > 0 && (
                      <p><span className="text-gray-500">Documents :</span> <span className="font-medium text-green-600">{docs.length} pre-charge{docs.length > 1 ? "s" : ""}</span></p>
                    )}
                  </div>
                </Card>

                <div className="mt-6 flex justify-center">
                  <Button onClick={reset} className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90">
                    <Plus className="w-4 h-4 mr-2" /> Creer une autre demarche
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
