import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Clock, CreditCard, AlertTriangle, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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

    // If Stripe is available, we use the StripePaymentForm component instead
    // This fallback is for when Stripe is not configured (dev mode)
    if (stripePromise) {
      // Stripe mode: show the card form (handled by StripePaymentForm below)
      return;
    }

    // No Stripe: simulate payment (dev/test only)
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
          <h1 className="text-xl font-bold">Paiement King Carte Grise</h1>
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

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <StripePaymentForm link={link} onSuccess={() => setLink({ ...link, status: "paid" })} />
          </Elements>
        ) : (
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
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
          <Lock className="h-3 w-3" />
          <span>Paiement securise par Stripe</span>
        </div>
      </div>
    </div>
  );
}

// Stripe Card Payment Form for simple payment links
function StripePaymentForm({ link, onSuccess }: { link: PaymentLinkData; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent via edge function
      const { data: paymentData, error: piError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount: Math.round(link.amount * 100),
            metadata: {
              payment_link_id: link.id,
              type: "payment_link",
            },
          },
        }
      );

      if (piError) throw piError;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Erreur carte");

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: link.recipient_name || undefined,
              email: link.recipient_email || undefined,
            },
          },
        }
      );

      if (stripeError) throw new Error(stripeError.message);

      if (paymentIntent?.status === "succeeded") {
        await supabase
          .from("payment_links")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", link.id);

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a1a1a",
                "::placeholder": { color: "#9ca3af" },
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <Button
        type="submit"
        className="w-full h-12 text-base"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
        ) : (
          <CreditCard className="h-5 w-5 mr-2" />
        )}
        Payer {link.amount.toFixed(2)} EUR
      </Button>
    </form>
  );
}
