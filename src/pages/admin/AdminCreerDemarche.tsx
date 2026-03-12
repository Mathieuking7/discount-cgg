import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Upload, Trash2, FileText, CheckCircle2 } from "lucide-react";

interface DemarcheType {
  id: string;
  code: string;
  titre: string;
  prix_base: number;
}

interface DocumentEntry {
  id: string;
  nom_document: string;
  fichier_url: string;
  filename: string;
}

function generateTrackingNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "ADM-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function AdminCreerDemarche() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Step 1
  const [step, setStep] = useState(1);
  const [demarcheTypes, setDemarcheTypes] = useState<DemarcheType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [selectedType, setSelectedType] = useState<DemarcheType | null>(null);

  // Step 2
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [immatriculation, setImmatriculation] = useState("");
  const [adresse, setAdresse] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Step 3
  const [orderId, setOrderId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [nomDocument, setNomDocument] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Admin check
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const check = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!data) {
        navigate("/login");
        return;
      }
      setIsAdmin(true);
      setCheckingAdmin(false);
    };
    check();
  }, [user, navigate]);

  // Load demarche types
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      setLoadingTypes(true);
      const { data, error } = await supabase
        .from("guest_demarche_types")
        .select("id, code, titre, prix_base")
        .eq("actif", true)
        .order("titre");
      if (error) {
        toast({ title: "Erreur", description: "Impossible de charger les types de démarche.", variant: "destructive" });
      } else {
        setDemarcheTypes(data || []);
      }
      setLoadingTypes(false);
    };
    load();
  }, [isAdmin, toast]);

  const handleCreateOrder = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const trackingNumber = generateTrackingNumber();
      const { data, error } = await supabase
        .from("guest_orders")
        .insert({
          nom,
          prenom,
          email,
          telephone,
          immatriculation,
          adresse,
          code_postal: codePostal,
          ville,
          commentaire: commentaire || null,
          demarche_type: selectedType.code,
          paye: true,
          montant_ttc: 0,
          montant_ht: 0,
          frais_dossier: 0,
          status: "en_cours",
          tracking_number: trackingNumber,
          documents_complets: false,
          email_notifications: false,
          sms_notifications: false,
          dossier_prioritaire: true,
        })
        .select("id")
        .single();

      if (error || !data) {
        toast({ title: "Erreur", description: error?.message || "Impossible de créer la démarche.", variant: "destructive" });
        return;
      }

      setOrderId(data.id);
      setStep(3);
      toast({ title: "Démarche créée", description: `Tracking: ${trackingNumber}` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!orderId || !nomDocument.trim() || !selectedFile) {
      toast({ title: "Champs requis", description: "Veuillez renseigner le nom et sélectionner un fichier.", variant: "destructive" });
      return;
    }
    setUploadingDoc(true);
    try {
      const ext = selectedFile.name.split(".").pop();
      const filename = `${Date.now()}-${selectedFile.name}`;
      const path = `admin/${orderId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("guest-documents")
        .upload(path, selectedFile);

      if (uploadError) {
        toast({ title: "Erreur upload", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: urlData } = supabase.storage.from("guest-documents").getPublicUrl(path);
      const fichierUrl = urlData.publicUrl;

      const { data: docData, error: docError } = await supabase
        .from("guest_order_documents")
        .insert({
          guest_order_id: orderId,
          nom_document: nomDocument.trim(),
          fichier_url: fichierUrl,
          valide: true,
        })
        .select("id")
        .single();

      if (docError || !docData) {
        toast({ title: "Erreur", description: docError?.message || "Impossible de sauvegarder le document.", variant: "destructive" });
        return;
      }

      setDocuments((prev) => [
        ...prev,
        { id: docData.id, nom_document: nomDocument.trim(), fichier_url: fichierUrl, filename },
      ]);
      setNomDocument("");
      setSelectedFile(null);
      toast({ title: "Document ajouté", description: nomDocument.trim() });
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (doc: DocumentEntry) => {
    const path = `admin/${orderId}/${doc.filename}`;
    await supabase.storage.from("guest-documents").remove([path]);
    await supabase.from("guest_order_documents").delete().eq("id", doc.id);
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    toast({ title: "Document supprimé", description: doc.nom_document });
  };

  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tableau de bord
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Créer une démarche admin (sans paiement)
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Les démarches créées ici sont directement marquées comme payées et en cours de traitement. Aucun paiement client requis.
          </p>
          <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>Flux :</strong> Choisissez le type de démarche, renseignez les informations client, puis ajoutez les documents nécessaires. La démarche sera immédiatement visible dans le tableau de bord.
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 text-sm font-medium">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              <span className={step === s ? "text-blue-700" : "text-gray-400"}>
                {s === 1 ? "Type" : s === 2 ? "Client" : "Documents"}
              </span>
              {s < 3 && <span className="text-gray-300 mx-1">›</span>}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Choisir le type de démarche</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTypes ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demarcheTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`text-left rounded-lg border-2 p-4 transition-all ${
                        selectedType?.id === type.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      <div className="font-semibold text-gray-800 text-sm">{type.titre}</div>
                      <div className="text-xs text-gray-500 mt-1">{type.code}</div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {type.prix_base} €
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
              <Button
                className="w-full mt-6"
                disabled={!selectedType}
                onClick={() => setStep(2)}
              >
                Continuer
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Informations client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="nom">Nom *</Label>
                  <Input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="prenom">Prénom *</Label>
                  <Input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="immatriculation">Immatriculation *</Label>
                <Input id="immatriculation" value={immatriculation} onChange={(e) => setImmatriculation(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="adresse">Adresse *</Label>
                <Input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="code_postal">Code postal *</Label>
                  <Input id="code_postal" value={codePostal} onChange={(e) => setCodePostal(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ville">Ville *</Label>
                  <Input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
                <Textarea
                  id="commentaire"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  placeholder="Notes internes ou informations complémentaires..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                  Retour
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={
                    submitting ||
                    !nom || !prenom || !email || !telephone ||
                    !immatriculation || !adresse || !codePostal || !ville
                  }
                  onClick={handleCreateOrder}
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Création en cours...</>
                  ) : (
                    "Créer la démarche"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {step === 3 && orderId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Démarche créée — Ajout de documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing documents */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Documents ajoutés ({documents.length})</p>
                  <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between px-4 py-3 bg-white">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                          <span className="text-gray-800 font-medium">{doc.nom_document}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteDocument(doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Add document form */}
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">Ajouter un document</p>
                <div className="space-y-1">
                  <Label htmlFor="nom_document">Nom du document</Label>
                  <Input
                    id="nom_document"
                    value={nomDocument}
                    onChange={(e) => setNomDocument(e.target.value)}
                    placeholder="ex: Carte d'identité, Certificat de cession..."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fichier</Label>
                  <Input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                </div>
                <Button
                  onClick={handleUploadDocument}
                  disabled={uploadingDoc || !nomDocument.trim() || !selectedFile}
                  className="w-full"
                  variant="outline"
                >
                  {uploadingDoc ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Upload en cours...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" /> Ajouter le document</>
                  )}
                </Button>
              </div>

              {/* Navigation */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate(`/dashboard/guest-order/${orderId}`)}
              >
                Voir la démarche
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
