import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, CreditCard, ChevronLeft, Shield, Lock } from "lucide-react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GuestPaymentDetailsSummary, calculateGuestOrderTTC } from "@/components/payment/GuestPaymentDetailsSummary";

const CheckoutForm = ({ order }: { order: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const totalAmount = calculateGuestOrderTTC(
        order.montant_ht || 0,
        order.frais_dossier || 30,
        order.sms_notifications
      );

      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            amount: Math.round(totalAmount * 100),
            metadata: {
              order_id: order.id,
              tracking_number: order.tracking_number,
              type: "guest_order",
            },
          },
        }
      );

      if (paymentError) throw paymentError;

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${order.prenom} ${order.nom}`,
              email: order.email,
              phone: order.telephone,
            },
          },
        }
      );

      if (error) throw new Error(error.message);

      if (paymentIntent?.status === "succeeded") {
        const finalTTC = calculateGuestOrderTTC(
          order.montant_ht || 0,
          order.frais_dossier || 30,
          order.sms_notifications
        );

        await supabase
          .from("guest_orders")
          .update({
            paye: true,
            payment_intent_id: paymentIntent.id,
            paid_at: new Date().toISOString(),
            status: "paye",
            montant_ttc: finalTTC,
          })
          .eq("id", order.id);

        toast({
          title: "Paiement accepte !",
          description: "Votre paiement a ete valide avec succes.",
          variant: "success" as any,
        });

        navigate(`/paiement-guest-succes/${order.id}`);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Paiement refuse",
        description: error.message || "Votre paiement n'a pas pu etre traite.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="font-bold text-gray-900">Informations de paiement</h3>
        </div>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#1f2937",
                  "::placeholder": { color: "#9ca3af" },
                  lineHeight: "48px",
                },
              },
            }}
          />
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Paiement securise par Stripe</span>
        </div>
      </div>

      <GuestPaymentDetailsSummary
        prixCarteGrise={order.montant_ht || 0}
        fraisDossier={order.frais_dossier || 30}
        smsNotifications={order.sms_notifications}
        emailNotifications={order.email_notifications}
      />

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full h-14 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-lg rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Payer maintenant
          </>
        )}
      </button>

      {/* Option paiement en 4x */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200">
        <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
        <span>
          Paiement en 4x disponible{" "}
          <span className="font-medium text-gray-700">(Sur demande)</span>
          {" "}— Contactez-nous pour en beneficier
        </span>
      </div>
    </form>
  );
};

const PaiementGuestOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    initializeStripe();
    loadOrder();
  }, [orderId]);

  const initializeStripe = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-stripe-key');
      if (error) throw error;
      if (data?.publishableKey) {
        setStripePromise(loadStripe(data.publishableKey));
      }
    } catch (error) {
      console.error("Error loading Stripe:", error);
      toast({ title: "Erreur", description: "Impossible de charger le systeme de paiement", variant: "destructive" });
    }
  };

  const loadOrder = async () => {
    if (!orderId) { navigate("/"); return; }

    const { data, error } = await supabase
      .from("guest_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !data) {
      toast({ title: "Erreur", description: "Commande introuvable", variant: "destructive" });
      navigate("/");
      return;
    }

    if (data.paye) {
      toast({ title: "Commande deja payee", description: "Redirection vers le suivi" });
      navigate(`/suivi/${data.tracking_number}`);
      return;
    }

    if (!data.documents_complets) {
      toast({ title: "Documents manquants", description: "Veuillez d'abord envoyer vos documents" });
      navigate(`/commander/${orderId}`);
      return;
    }

    setOrder(data);
    setIsLoading(false);
  };

  if (isLoading || !order || !stripePromise) {
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
        <div className="max-w-2xl mx-auto space-y-8">
          <button
            onClick={() => navigate(`/commander/${orderId}`)}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-2">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Paiement securise</h1>
            <p className="text-gray-500 text-lg">Commande {order.tracking_number}</p>
          </div>

          <Elements stripe={stripePromise}>
            <CheckoutForm order={order} />
          </Elements>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaiementGuestOrder;
