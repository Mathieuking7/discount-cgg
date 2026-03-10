import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowLeft, CheckCircle, CreditCard, ChevronDown, ChevronUp, Lock, Shield, Check } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site.config";
import { PayPalButton } from "@/components/PayPalButton";
import { StripeWalletPayment } from "@/components/StripeWalletPayment";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PaymentDetailsSummary, type PaymentCalculationResult } from "@/components/payment/PaymentDetailsSummary";
import { formatPrice } from "@/lib/utils";

const StripeCardForm = ({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Élément de carte introuvable");

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === "succeeded") {
        toast({
          title: "✅ Paiement accepté !",
          description: "Votre paiement a été validé avec succès. Votre démarche est en cours de traitement.",
          variant: "success" as any,
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "❌ Paiement refusé",
        description: error.message || "Votre paiement n'a pas pu être traité. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-200 rounded-xl bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1f2937",
                fontFamily: "system-ui, -apple-system, sans-serif",
                "::placeholder": {
                  color: "#9ca3af",
                },
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full rounded-full py-3.5 px-8 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 min-h-[48px] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Traitement en cours...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Payer par carte
          </>
        )}
      </button>
    </form>
  );
};

const PaiementDemarche = () => {
  const { demarcheId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [demarche, setDemarche] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [trackingServices, setTrackingServices] = useState<any[]>([]);
  const [actionRapide, setActionRapide] = useState<any>(null);
  const [stripePromise, setStripePromise] = useState<any>(null);
  const [garage, setGarage] = useState<any>(null);
  const [showBalanceConfirm, setShowBalanceConfirm] = useState(false);
  const [isProcessingBalance, setIsProcessingBalance] = useState(false);
  
  // Montant calculé (sans TVA)
  const [calculatedTotal, setCalculatedTotal] = useState<number | null>(null);

  useEffect(() => {
    loadDemarche();
  }, [demarcheId]);

  const loadDemarche = async () => {
    if (!demarcheId) {
      navigate("/mes-demarches");
      return;
    }

    try {
      // Charger les détails de la démarche
      const { data: demarcheData, error: demarcheError } = await supabase
        .from("demarches")
        .select("*")
        .eq("id", demarcheId)
        .single();

      if (demarcheError || !demarcheData) {
        toast({
          title: "Erreur",
          description: "Démarche introuvable",
          variant: "destructive",
        });
        navigate("/mes-demarches");
        return;
      }

      if (demarcheData.paye) {
        toast({
          title: "Démarche déjà payée",
          description: "Redirection vers vos démarches",
        });
        navigate("/mes-demarches");
        return;
      }

      setDemarche(demarcheData);

      // Charger les infos du garage pour le solde
      const { data: garageData } = await supabase
        .from("garages")
        .select("*")
        .eq("id", demarcheData.garage_id)
        .single();

      if (garageData) {
        setGarage(garageData);
      }

      // Charger tous les services de suivi
      const { data: trackingData } = await supabase
        .from("tracking_services")
        .select("*")
        .eq("demarche_id", demarcheId);

      if (trackingData && trackingData.length > 0) {
        setTrackingServices(trackingData);
      }

      // Charger l'action rapide
      const { data: actionData } = await supabase
        .from("actions_rapides")
        .select("*")
        .eq("code", demarcheData.type)
        .single();

      if (actionData) {
        setActionRapide(actionData);
      }

      // Récupérer la clé publique Stripe
      const { data: keyData, error: keyError } = await supabase.functions.invoke("get-stripe-key");

      if (keyError || !keyData?.publishableKey) {
        throw new Error("Impossible de charger la clé Stripe");
      }

      const stripe = await loadStripe(keyData.publishableKey);
      setStripePromise(stripe);

      // Créer le payment intent
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
        "create-payment-intent",
        {
          body: {
            demarcheId,
            paymentType: "full",
          },
        }
      );

      if (paymentError || !paymentData?.clientSecret) {
        throw new Error("Impossible de créer le paiement");
      }

      setClientSecret(paymentData.clientSecret);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Payment initialization error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'initialiser le paiement",
        variant: "destructive",
      });
      navigate("/mes-demarches");
    }
  };

  // Callback pour récupérer le montant calculé
  const handlePaymentCalculated = useCallback((result: PaymentCalculationResult) => {
    setCalculatedTotal(result.totalTTC);
  }, []);

  // canPayWithBalance est calculé plus bas après le calcul de finalAmount

  // Gérer le paiement par solde
  const handleBalancePayment = async () => {
    if (!garage || !demarcheId || !demarche) return;
    
    // Calculer le montant à débiter directement
    const prixCG = Number(demarche.prix_carte_grise) || 0;
    const frais = Number(demarche.frais_dossier) || 0;
    const optionsSum = trackingServices.reduce((sum, s) => sum + Number(s.price || 0), 0);
    const amountToPay = prixCG + frais + optionsSum;
    
    if (amountToPay <= 0 || garage.token_balance < amountToPay) return;

    setIsProcessingBalance(true);

    try {
      const newBalance = garage.token_balance - amountToPay;

      // Déduire du solde
      const { error: balanceError } = await supabase
        .from("garages")
        .update({ token_balance: newBalance })
        .eq("id", garage.id);

      if (balanceError) throw balanceError;

      // Marquer la démarche comme payée
      const { error: demarcheError } = await supabase
        .from("demarches")
        .update({
          paye: true,
          paid_with_tokens: true,
          status: 'en_attente',
          is_draft: false
        })
        .eq("id", demarcheId);

      if (demarcheError) throw demarcheError;

      // Envoyer les emails
      try {
        // Email au garage
        await supabase.functions.invoke("send-email", {
          body: {
            type: "balance_payment_confirmed",
            to: garage.email,
            data: {
              garage_name: garage.raison_sociale,
              demarche_id: demarche.numero_demarche,
              immatriculation: demarche.immatriculation,
              amount: amountToPay,
              new_balance: newBalance,
              type: demarche.type,
            },
          },
        });

        // Emails aux admins
        const adminEmails = ["contact@sivflow.fr"];
        for (const adminEmail of adminEmails) {
          await new Promise(resolve => setTimeout(resolve, 600));
          await supabase.functions.invoke("send-email", {
            body: {
              type: "admin_new_demarche",
              to: adminEmail,
              data: {
                type: demarche.type,
                reference: demarche.numero_demarche,
                immatriculation: demarche.immatriculation,
                client_name: garage.raison_sociale,
                montant_ttc: amountToPay,
                is_free_token: false,
              },
            },
          });
        }
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
      }

      toast({
        title: "✅ Paiement validé !",
        description: "Votre démarche a été payée avec votre solde.",
        variant: "success" as any,
      });

      navigate(`/paiement-solde-succes/${demarcheId}?amount=${amountToPay}&balance=${newBalance}`);
    } catch (error: any) {
      console.error("Balance payment error:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du paiement",
        variant: "destructive",
      });
    } finally {
      setIsProcessingBalance(false);
      setShowBalanceConfirm(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Mettre à jour le statut de la démarche
      const { error } = await supabase
        .from("demarches")
        .update({ 
          paye: true,
          status: 'en_attente',
          is_draft: false
        })
        .eq("id", demarcheId);

      if (error) {
        console.error("Error updating demarche:", error);
        toast({
          title: "Attention",
          description: "Paiement effectué mais erreur de mise à jour. Contactez le support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handlePaymentSuccess:", error);
    } finally {
      // Rediriger vers la page de succès
      navigate(`/paiement-succes/${demarcheId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!demarche || !clientSecret || !stripePromise) return null;

  // Calculer le montant correct sans TVA directement
  const prixCarteGrise = Number(demarche.prix_carte_grise) || 0;
  const fraisDossier = Number(demarche.frais_dossier) || 0;
  const optionsTotal = trackingServices.reduce((sum, s) => sum + Number(s.price || 0), 0);
  const totalServices = fraisDossier + optionsTotal;
  
  // Utiliser le montant calculé correctement (sans TVA)
  const finalAmount = calculatedTotal !== null ? calculatedTotal : (prixCarteGrise + totalServices);
  
  // Vérifier si le paiement par solde est possible (utiliser finalAmount au lieu de calculatedTotal)
  const canPayWithBalance = garage && finalAmount > 0 && garage.token_balance >= finalAmount;
  
  // PayPal 4x désactivé si montant < 30€
  const canUsePayPal4x = finalAmount >= 30;

  return (
    <div className="min-h-screen" style={{ background: '#FDF8F0' }}>
      <Navbar />

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        <button
          onClick={() => navigate("/mes-demarches")}
          className="mb-8 inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement sécurisé</h1>
          <p className="text-gray-500">Finalisez votre démarche en toute sécurité</p>
        </div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Payment methods */}
          <div className="space-y-6">
            {/* Balance payment */}
            {garage && garage.token_balance > 0 && (
              <div className={`bg-white rounded-2xl border-2 p-6 space-y-4 shadow-sm ${canPayWithBalance ? 'border-green-300' : 'border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Payer avec mon solde</h3>
                    <p className="text-sm text-gray-500">
                      Solde disponible : <span className="font-bold text-green-600">{formatPrice(garage.token_balance)} EUR</span>
                    </p>
                  </div>
                </div>

                {canPayWithBalance ? (
                  showBalanceConfirm ? (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Souhaitez-vous utiliser votre solde pour payer cette démarche ?
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-bold">{formatPrice(finalAmount)} EUR</span> seront débités de votre solde.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleBalancePayment}
                          disabled={isProcessingBalance}
                          className="flex-1 rounded-full py-3 px-5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                          {isProcessingBalance ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                          ) : (
                            <><CheckCircle className="w-4 h-4" /> Oui, payer avec mon solde</>
                          )}
                        </button>
                        <button
                          onClick={() => setShowBalanceConfirm(false)}
                          disabled={isProcessingBalance}
                          className="rounded-full py-3 px-5 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          Non, autre moyen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowBalanceConfirm(true)}
                      className="w-full rounded-full py-3.5 px-8 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all duration-200 min-h-[48px] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Utiliser mon solde ({formatPrice(finalAmount)} EUR)
                    </button>
                  )
                ) : (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    Solde insuffisant. Il vous manque <span className="font-bold">{formatPrice(finalAmount - garage.token_balance)} EUR</span>
                  </div>
                )}
              </div>
            )}

            {garage && garage.token_balance > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs font-medium text-gray-400 uppercase">Ou payez par</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            )}

            {/* Card payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Carte bancaire</h3>
                <p className="text-sm text-gray-500 mt-1">Visa, Mastercard, American Express</p>
              </div>
              <Elements stripe={stripePromise}>
                <StripeCardForm clientSecret={clientSecret} onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-400 uppercase">Ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Wallet payment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Paiement rapide</h3>
                <p className="text-sm text-gray-500 mt-1">Apple Pay, Google Pay et autres portefeuilles</p>
              </div>
              <Elements stripe={stripePromise}>
                <StripeWalletPayment
                  amount={finalAmount}
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    toast({
                      title: "Paiement refusé",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                />
              </Elements>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs font-medium text-gray-400 uppercase">Ou</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* PayPal */}
            {canUsePayPal4x ? (
              <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="inline-block text-xs font-medium text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full mb-2">Recommandé</span>
                    <h3 className="text-xl font-bold text-gray-900">Payez en 4x sans frais</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(finalAmount / 4)} EUR</p>
                    <p className="text-sm text-gray-500">par mois</p>
                  </div>
                </div>

                <p className="text-sm text-gray-500">
                  soit 4 mensualités de <span className="font-semibold text-gray-900">{formatPrice(finalAmount / 4)} EUR</span>
                </p>

                <PayPalButton
                  amount={finalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    console.error("PayPal error:", error);
                    toast({
                      title: "Erreur PayPal",
                      description: "Impossible de charger PayPal",
                      variant: "destructive",
                    });
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900">PayPal</h3>
                  <p className="text-sm text-gray-500 mt-1">Paiement sécurisé via PayPal</p>
                </div>

                <PayPalButton
                  amount={finalAmount}
                  onSuccess={handlePaymentSuccess}
                  onError={(error) => {
                    console.error("PayPal error:", error);
                    toast({
                      title: "Erreur PayPal",
                      description: "Impossible de charger PayPal",
                      variant: "destructive",
                    });
                  }}
                />

                <p className="text-xs text-gray-400">
                  Le paiement en 4x est disponible à partir de 30 EUR
                </p>
              </div>
            )}

            {/* Security message */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
              <Lock className="h-3.5 w-3.5" />
              <span>Tous les paiements sont sécurisés et cryptés</span>
            </div>
          </div>

          {/* Sidebar - Recap */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Récapitulatif</h3>
              <p className="text-sm text-gray-400 mb-5">Démarche {demarche.numero_demarche}</p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium text-gray-900">{demarche.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Immatriculation</span>
                  <span className="font-mono font-semibold text-gray-900">{demarche.immatriculation}</span>
                </div>
              </div>

              <div className="mt-4">
                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>Détails des frais</span>
                      {showDetails ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <PaymentDetailsSummary
                      demarcheType={demarche.type}
                      fraisDossier={demarche.frais_dossier || 30}
                      montantTtc={demarche.montant_ttc}
                      trackingServices={trackingServices}
                      actionRapideTitre={actionRapide?.titre}
                      prixCarteGrise={demarche.prix_carte_grise || 0}
                      onCalculated={handlePaymentCalculated}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <div className="border-t-2 border-gray-900 pt-4 mt-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(finalAmount)} EUR
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4 mt-4 border-t border-gray-100">
                <Lock className="w-3.5 h-3.5" />
                <span>Paiement 100% sécurisé</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <Shield className="h-5 w-5 text-green-500 shrink-0" />
                <span>Paiement sécurisé SSL 256-bit</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                <Lock className="h-5 w-5 text-blue-500 shrink-0" />
                <span>Données cryptées et protégées</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="h-5 w-5 text-green-500 shrink-0" />
                <span>Agréé Ministère de l'Intérieur</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaiementDemarche;
