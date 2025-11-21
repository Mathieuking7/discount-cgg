import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard } from "lucide-react";
import { loadStripe, StripeCardElement } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Get Stripe publishable key from Supabase secrets
const getStripeKey = async () => {
  const { data } = await supabase.functions.invoke('get-stripe-key');
  return data?.publishableKey;
};

let stripePromise: Promise<any> | null = null;
const initStripe = async () => {
  if (!stripePromise) {
    const key = await getStripeKey();
    if (key) {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
};

interface StripePaymentProps {
  demarcheId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function PaymentForm({ demarcheId, amount, onSuccess, onCancel }: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>("");
  const { toast } = useToast();

  // Créer le payment intent dès que le composant est monté
  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Session expirée");
      }

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { demarcheId, paymentType: 'full' }
      });

      if (error) throw error;

      if (data?.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (error: any) {
      console.error('Payment intent error:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser le paiement",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast({
        title: "Erreur",
        description: "Le système de paiement n'est pas prêt",
        variant: "destructive"
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les informations de carte",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive"
        });
      } else if (paymentIntent?.status === 'succeeded') {
        toast({
          title: "Paiement réussi",
          description: "Votre paiement a été effectué avec succès"
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <Label className="text-lg font-semibold">Informations de paiement</Label>
        </div>
        
        <div className="border rounded-lg p-4 bg-background">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: 'hsl(var(--foreground))',
                  '::placeholder': {
                    color: 'hsl(var(--muted-foreground))',
                  },
                  backgroundColor: 'hsl(var(--background))',
                },
                invalid: {
                  color: 'hsl(var(--destructive))',
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Montant à payer</span>
          <span className="text-lg font-bold text-foreground">{amount.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={loading} 
          className="flex-1"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !stripe || !clientSecret} 
          className="flex-1 bg-success hover:bg-success/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Paiement en cours...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Valider le paiement
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function StripePayment({ demarcheId, amount, onSuccess, onCancel }: StripePaymentProps) {
  const [stripe, setStripe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeStripe();
  }, []);

  const initializeStripe = async () => {
    try {
      const stripeInstance = await initStripe();
      setStripe(stripeInstance);
    } catch (error: any) {
      console.error('Stripe initialization error:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le système de paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement du système de paiement...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stripe) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-destructive">Erreur d'initialisation du paiement</p>
          <Button onClick={initializeStripe} variant="outline" className="mt-4 mx-auto block">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paiement sécurisé par carte bancaire</CardTitle>
        <CardDescription>
          Renseignez vos informations de carte pour finaliser votre commande
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripe}>
          <PaymentForm 
            demarcheId={demarcheId}
            amount={amount}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}
