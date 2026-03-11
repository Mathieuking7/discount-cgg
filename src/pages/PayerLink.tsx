import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle } from "lucide-react";

interface PaymentLinkData {
  id: string;
  short_code: string;
  amount: number;
  description: string;
  status: string;
  recipient_name: string | null;
  recipient_email: string | null;
  demarche_type: string | null;
  expires_at: string;
  order_id: string | null;
}

export default function PayerLink() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLink();
  }, [shortCode]);

  const loadLink = async () => {
    if (!shortCode) {
      setError("Lien invalide");
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from("payment_links")
      .select("*")
      .eq("short_code", shortCode)
      .single();

    if (err || !data) {
      setError("Lien de paiement introuvable");
      setLoading(false);
      return;
    }

    // Check expiry
    if (data.status === "active" && new Date(data.expires_at) < new Date()) {
      await supabase
        .from("payment_links")
        .update({ status: "expired" })
        .eq("id", data.id);
      data.status = "expired";
    }

    const linkData = data as PaymentLinkData;

    // If this payment link is tied to a demarche type, create/find a guest order
    // and redirect to the full demarche flow at /commander/:orderId
    if (linkData.status === "active" && linkData.demarche_type) {
      await redirectToDemarcheFlow(linkData);
      return;
    }

    setLink(linkData);
    setLoading(false);
  };

  const redirectToDemarcheFlow = async (linkData: PaymentLinkData) => {
    // Check if we already have an order_id linked
    if (linkData.order_id) {
      navigate(`/commander/${linkData.order_id}`, { replace: true });
      return;
    }

    // Look up the demarche type code
    const { data: demarcheType } = await supabase
      .from("guest_demarche_types")
      .select("code")
      .eq("id", linkData.demarche_type!)
      .single();

    if (!demarcheType) {
      setError("Type de demarche introuvable");
      setLoading(false);
      return;
    }

    // Create a guest order for this payment link
    const { data: order, error: orderErr } = await supabase
      .from("guest_orders")
      .insert({
        demarche_type: demarcheType.code,
        immatriculation: "A_REMPLIR",
        nom: linkData.recipient_name || "A_REMPLIR",
        prenom: "A_REMPLIR",
        email: linkData.recipient_email || "a@remplir.com",
        telephone: "0000000000",
        adresse: "A remplir",
        code_postal: "00000",
        ville: "A remplir",
        status: "en_attente",
        commentaire: null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      setError("Erreur lors de la creation de la commande");
      setLoading(false);
      return;
    }

    // Link the guest order back to the payment link
    await supabase
      .from("payment_links")
      .update({ order_id: order.id })
      .eq("id", linkData.id);

    navigate(`/commander/${order.id}`, { replace: true });
  };

  const handlePay = async () => {
    if (!link) return;
    setPaying(true);

    const { error: err } = await supabase
      .from("payment_links")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("id", link.id);

    if (err) {
      setPaying(false);
      setError("Erreur lors du paiement");
      return;
    }

    setLink({ ...link, status: "paid" });
    setPaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h1 className="text-xl font-bold">{error || "Lien introuvable"}</h1>
          <p className="text-gray-500">Ce lien de paiement n'existe pas ou n'est plus valide.</p>
        </div>
      </div>
    );
  }

  if (link.status === "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-green-700">Paiement effectue</h1>
          <p className="text-gray-500">
            Merci ! Le paiement de <strong>{link.amount.toFixed(2)} EUR</strong> a ete enregistre.
          </p>
          <p className="text-sm text-gray-400">{link.description}</p>
        </div>
      </div>
    );
  }

  if (link.status === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <XCircle className="h-16 w-16 text-red-400 mx-auto" />
          <h1 className="text-2xl font-bold text-red-600">Lien annule</h1>
          <p className="text-gray-500">Ce lien de paiement a ete annule par le createur.</p>
        </div>
      </div>
    );
  }

  if (link.status === "expired") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <Clock className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-600">Lien expire</h1>
          <p className="text-gray-500">Ce lien de paiement a expire. Veuillez contacter le professionnel.</p>
        </div>
      </div>
    );
  }

  // Active link without demarche type - simple payment
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 mb-2">
            <CreditCard className="h-7 w-7 text-blue-600" />
          </div>
          <h1 className="text-xl font-bold">Paiement SIVFlow</h1>
          <p className="text-gray-500 text-sm">{link.description}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Montant a regler</p>
          <p className="text-4xl font-bold text-gray-900">{link.amount.toFixed(2)} <span className="text-lg">EUR</span></p>
        </div>

        {link.recipient_name && (
          <p className="text-center text-sm text-gray-500">
            Client : <strong>{link.recipient_name}</strong>
          </p>
        )}

        <Button
          className="w-full h-12 text-base"
          onClick={handlePay}
          disabled={paying}
        >
          {paying ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-5 w-5 mr-2" />
          )}
          Payer {link.amount.toFixed(2)} EUR
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Paiement securise par SIVFlow
        </p>
      </div>
    </div>
  );
}
