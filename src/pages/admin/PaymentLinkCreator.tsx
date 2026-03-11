import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import QRCode from "qrcode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Copy,
  QrCode,
  Download,
  Mail,
  Plus,
  Maximize2,
  X,
  Link2,
  XCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface DemarcheType {
  id: string;
  code: string;
  titre: string;
}

interface PaymentLink {
  id: string;
  short_code: string;
  amount: number;
  description: string;
  demarche_type: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  status: string;
  expires_at: string;
  created_at: string;
}

function generateShortCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function QrCodeImage({ url, size = 256, className = "" }: { url: string; size?: number; className?: string }) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: size, margin: 2 })
      .then(setDataUrl)
      .catch(console.error);
  }, [url, size]);

  if (!dataUrl) return <div style={{ width: size, height: size }} className={`bg-gray-100 animate-pulse rounded-lg ${className}`} />;

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={className}
    />
  );
}

export default function PaymentLinkCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [demarcheTypes, setDemarcheTypes] = useState<DemarcheType[]>([]);
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [demarcheTypeId, setDemarcheTypeId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  // Result state
  const [createdLink, setCreatedLink] = useState<{ shortCode: string; url: string } | null>(null);

  // QR fullscreen modal
  const [qrModal, setQrModal] = useState<{ url: string; amount: number; description: string } | null>(null);

  useEffect(() => {
    if (user) {
      checkAdminAndLoad();
    }
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

    await Promise.all([loadDemarcheTypes(), loadLinks()]);
    setLoading(false);
  };

  const loadDemarcheTypes = async () => {
    const { data } = await supabase
      .from("guest_demarche_types")
      .select("id, code, titre")
      .eq("actif", true)
      .order("ordre");
    if (data) setDemarcheTypes(data);
  };

  const loadLinks = async () => {
    const { data } = await supabase
      .from("payment_links")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setLinks(data as PaymentLink[]);
  };

  const handleCreate = async () => {
    if (!amount || !description) {
      toast({ title: "Erreur", description: "Montant et description requis", variant: "destructive" });
      return;
    }

    setCreating(true);
    const shortCode = generateShortCode();

    const { error } = await supabase.from("payment_links").insert({
      short_code: shortCode,
      amount: parseFloat(amount),
      description,
      demarche_type: demarcheTypeId || null,
      recipient_name: clientName || null,
      recipient_email: clientEmail || null,
      status: "active",
      expires_at: new Date(expiresAt).toISOString(),
      created_by: user!.id,
    });

    setCreating(false);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    const url = `${window.location.origin}/payer/${shortCode}`;
    setCreatedLink({ shortCode, url });
    toast({ title: "Lien de paiement cree" });
    loadLinks();

    // Reset form
    setAmount("");
    setDescription("");
    setDemarcheTypeId("");
    setClientName("");
    setClientEmail("");
    setExpiresAt(() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().split("T")[0];
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copie !" });
  };

  const downloadQr = async (url: string, filename: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });
      const a = document.createElement("a");
      a.download = `${filename}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error("QR download error:", err);
    }
  };

  const sendEmail = async (shortCode: string, email: string, amt: number, desc: string) => {
    const paymentUrl = `${window.location.origin}/payer/${shortCode}`;
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        type: "simple_text",
        to: email,
        data: {
          subject: `Lien de paiement - ${desc}`,
          html: `<p>Bonjour,</p><p>Veuillez trouver ci-dessous votre lien de paiement :</p><p><strong>Montant : ${amt.toFixed(2)} EUR</strong></p><p><strong>Description : ${desc}</strong></p><p><a href="${paymentUrl}">${paymentUrl}</a></p><p>Cordialement,<br/>DiscountCarteGrise</p>`,
        },
      },
    });

    if (error) {
      toast({ title: "Erreur d'envoi", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email envoye !" });
    }
  };

  const cancelLink = async (id: string) => {
    const { error } = await supabase
      .from("payment_links")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lien annule" });
      loadLinks();
    }
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { label: string; cls: string }> = {
      active: { label: "Actif", cls: "bg-green-100 text-green-700" },
      paid: { label: "Paye", cls: "bg-blue-100 text-blue-700" },
      expired: { label: "Expire", cls: "bg-gray-100 text-gray-500" },
      cancelled: { label: "Annule", cls: "bg-red-100 text-red-700" },
    };
    const c = config[status] || { label: status, cls: "bg-gray-100 text-gray-600" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.cls}`}>{c.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Liens de paiement</h1>
            <p className="text-gray-500 text-sm">Creez et gerez vos liens de paiement et QR codes</p>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Creer un lien de paiement
          </h2>
          <p className="text-sm text-gray-500">
            Si vous selectionnez un type de demarche, le client sera redirige vers le formulaire complet (informations, documents, paiement).
            Sans type de demarche, le lien affichera uniquement le paiement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Montant (EUR) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>Description *</Label>
              <Input
                placeholder="Ex: Carte grise changement titulaire"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Type de demarche</Label>
              <Select value={demarcheTypeId} onValueChange={setDemarcheTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {demarcheTypes.map((dt) => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {dt.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date d'expiration</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div>
              <Label>Nom du client (optionnel)</Label>
              <Input
                placeholder="Jean Dupont"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email du client (optionnel)</Label>
              <Input
                type="email"
                placeholder="client@email.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleCreate} disabled={creating} className="mt-2">
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
            Creer le lien
          </Button>
        </div>

        {/* Created Link Result */}
        {createdLink && (
          <div className="bg-white rounded-xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-green-700">Lien cree avec succes</h2>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <code className="flex-1 text-sm break-all">{createdLink.url}</code>
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdLink.url)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-col items-center gap-4">
              <QrCodeImage url={createdLink.url} size={256} className="rounded-lg max-w-full h-auto" />

              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setQrModal({
                      url: createdLink.url,
                      amount: parseFloat(amount) || 0,
                      description,
                    })
                  }
                >
                  <Maximize2 className="h-4 w-4 mr-1" />
                  Plein ecran
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadQr(createdLink.url, `qr-${createdLink.shortCode}`)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Telecharger QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(createdLink.url)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copier le lien
                </Button>
                {clientEmail && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      sendEmail(
                        createdLink.shortCode,
                        clientEmail,
                        parseFloat(amount) || 0,
                        description
                      )
                    }
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Envoyer par email
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Historique des liens</h2>

          {links.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucun lien cree pour le moment.</p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Cree le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => {
                    const payUrl = `${window.location.origin}/payer/${link.short_code}`;
                    return (
                      <TableRow key={link.id}>
                        <TableCell className="font-mono text-sm">{link.short_code}</TableCell>
                        <TableCell>{link.amount.toFixed(2)} EUR</TableCell>
                        <TableCell className="max-w-[200px] truncate">{link.description}</TableCell>
                        <TableCell>{link.recipient_name || "-"}</TableCell>
                        <TableCell>{statusBadge(link.status)}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(link.created_at).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              title="Copier le lien"
                              onClick={() => copyToClipboard(payUrl)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              title="QR Code"
                              onClick={() =>
                                setQrModal({
                                  url: payUrl,
                                  amount: link.amount,
                                  description: link.description,
                                })
                              }
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                            {link.recipient_email && link.status === "active" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                title="Envoyer par email"
                                onClick={() =>
                                  sendEmail(link.short_code, link.recipient_email!, link.amount, link.description)
                                }
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            {link.status === "active" && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500"
                                title="Annuler"
                                onClick={() => cancelLink(link.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* QR Fullscreen Modal */}
      <Dialog open={!!qrModal} onOpenChange={() => setQrModal(null)}>
        <DialogContent className="max-w-lg flex flex-col items-center justify-center p-4 sm:p-8 bg-white">
          {qrModal && (
            <>
              <QrCodeImage url={qrModal.url} size={360} className="rounded-lg max-w-full h-auto" />
              <p className="text-2xl font-bold mt-4">{qrModal.amount.toFixed(2)} EUR</p>
              <p className="text-gray-500 text-center">{qrModal.description}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadQr(qrModal.url, "qr-payment")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Telecharger
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(qrModal.url)}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copier
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
