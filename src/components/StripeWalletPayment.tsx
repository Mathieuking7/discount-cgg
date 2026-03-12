import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface StripeWalletPaymentProps {
  amount: number;
  onSuccess: () => void;
  onError?: (error: string) => void;
  // Either pass clientSecret directly OR pass metadata to create a new payment intent
  clientSecret?: string;
  metadata?: Record<string, string>;
  demarcheId?: string;
  // Allow specifying which edge function to use for creating payment intent
  edgeFunctionName?: string;
}

export const StripeWalletPayment = ({ 
  amount, 
  onSuccess, 
  onError, 
  clientSecret: providedClientSecret,
  metadata, 
  demarcheId,
  edgeFunctionName = "create-payment-intent"
}: StripeWalletPaymentProps) => {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const [showNotAvailable, setShowNotAvailable] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(providedClientSecret || null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Track retries to force new payment intent
  const hasCreatedIntent = useRef(false);
  const paymentRequestRef = useRef<any>(null);
  
  // Use refs to avoid stale closures in event handlers
  const clientSecretRef = useRef<string | null>(clientSecret);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  const amountInCents = useMemo(() => Math.round(amount * 100), [amount]);

  // Function to reset and create a new payment intent
  const resetForRetry = useCallback(() => {
    hasCreatedIntent.current = false;
    setClientSecret(null);
    clientSecretRef.current = null;
    // Clean up old payment request
    if (paymentRequestRef.current) {
      paymentRequestRef.current.off("paymentmethod");
      paymentRequestRef.current = null;
    }
    setPaymentRequest(null);
    setCanMakePayment(false);
    setRetryCount(prev => prev + 1);
  }, []);

  // Keep refs in sync with latest values
  useEffect(() => {
    clientSecretRef.current = clientSecret;
  }, [clientSecret]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Ref for resetForRetry to use in event handlers
  const resetForRetryRef = useRef(resetForRetry);
  useEffect(() => {
    resetForRetryRef.current = resetForRetry;
  }, [resetForRetry]);

  // Create payment intent if not provided
  useEffect(() => {
    // If clientSecret was provided as prop, use it
    if (providedClientSecret) {
      setClientSecret(providedClientSecret);
      return;
    }

    // Don't create if already created or in progress
    if (hasCreatedIntent.current || isCreatingIntent || clientSecret) return;
    
    const createPaymentIntent = async () => {
      hasCreatedIntent.current = true;
      setIsCreatingIntent(true);
      
      try {
        
        const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
          body: {
            amount: amountInCents,
            metadata: metadata || {},
            demarcheId: demarcheId || undefined,
          },
        });

        if (error) {
          console.error("[StripeWallet] Error creating payment intent:", error);
          throw error;
        }
        
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          console.error("[StripeWallet] No client secret returned");
          throw new Error("No client secret returned");
        }
      } catch (err: any) {
        console.error("[StripeWallet] Error creating payment intent:", err);
        hasCreatedIntent.current = false;
        onError?.(err.message || "Erreur lors de la création du paiement");
      } finally {
        setIsCreatingIntent(false);
      }
    };

    createPaymentIntent();
  }, [providedClientSecret, amountInCents, metadata, demarcheId, isCreatingIntent, clientSecret, onError, retryCount, edgeFunctionName]);

  // Setup PaymentRequest when stripe and clientSecret are ready
  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }
    
    // Don't recreate if already exists
    if (paymentRequestRef.current) {
      return;
    }


    const pr = stripe.paymentRequest({
      country: "FR",
      currency: "eur",
      total: {
        label: "Total",
        amount: amountInCents,
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    paymentRequestRef.current = pr;

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr);
        setCanMakePayment(true);
      } else {
        setShowNotAvailable(true);
      }
    }).catch((err) => {
      console.error("[StripeWallet] canMakePayment error:", err);
      setShowNotAvailable(true);
    });

    pr.on("paymentmethod", async (e) => {
      // Use refs to get latest values and avoid stale closures
      const currentClientSecret = clientSecretRef.current;
      
      
      if (!currentClientSecret) {
        console.error("[StripeWallet] No client secret available!");
        e.complete("fail");
        onErrorRef.current?.("Erreur: secret de paiement manquant");
        return;
      }
      
      try {
        // Step 1: Confirm the payment with the payment method from Google Pay/Apple Pay
        // Using handleActions: false because we'll handle any required actions ourselves
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          currentClientSecret,
          { payment_method: e.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          console.error("[StripeWallet] Payment confirmation error:", confirmError);
          console.error("[StripeWallet] Error type:", confirmError.type);
          console.error("[StripeWallet] Error code:", confirmError.code);
          console.error("[StripeWallet] Error decline_code:", (confirmError as any).decline_code);
          console.error("[StripeWallet] Error message:", confirmError.message);
          e.complete("fail");
          onErrorRef.current?.(confirmError.message || "Erreur lors du paiement");
          // Reset for retry with new payment intent
          setTimeout(() => resetForRetryRef.current(), 1000);
          return;
        }


        if (paymentIntent?.status === "requires_action") {
          // Step 2: Let Stripe.js handle the required action (3DS, etc.)
          e.complete("success"); // Complete the Payment Request UI first
          
          const { error: actionError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(currentClientSecret);
          
          if (actionError) {
            console.error("[StripeWallet] Action error:", actionError);
            onErrorRef.current?.(actionError.message || "Authentification échouée");
            // Reset for retry with new payment intent
            setTimeout(() => resetForRetryRef.current(), 1000);
            return;
          }

          if (confirmedIntent?.status === "succeeded") {
            onSuccessRef.current();
          } else {
            onErrorRef.current?.("Le paiement n'a pas pu être complété");
            // Reset for retry with new payment intent
            setTimeout(() => resetForRetryRef.current(), 1000);
          }
        } else if (paymentIntent?.status === "succeeded") {
          e.complete("success");
          onSuccessRef.current();
        } else {
          e.complete("fail");
          onErrorRef.current?.(`Statut inattendu: ${paymentIntent?.status}`);
          // Reset for retry with new payment intent
          setTimeout(() => resetForRetryRef.current(), 1000);
        }
      } catch (err: any) {
        console.error("[StripeWallet] Payment error:", err);
        console.error("[StripeWallet] Error stack:", err.stack);
        e.complete("fail");
        onErrorRef.current?.(err.message || "Erreur lors du paiement");
        // Reset for retry with new payment intent
        setTimeout(() => resetForRetryRef.current(), 1000);
      }
    });

    return () => {
      if (paymentRequestRef.current) {
        paymentRequestRef.current.off("paymentmethod");
      }
    };
  }, [stripe, clientSecret, amountInCents]);

  if (isCreatingIntent) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canMakePayment && showNotAvailable) {
    return (
      <Alert className="bg-muted/50 border-muted">
        <Smartphone className="h-4 w-4" />
        <AlertDescription>
          Apple Pay / Google Pay n'est pas disponible sur cet appareil ou ce navigateur.
          Veuillez utiliser Safari sur iOS avec Apple Pay configuré, ou Chrome sur Android avec Google Pay.
        </AlertDescription>
      </Alert>
    );
  }

  if (!canMakePayment || !clientSecret) {
    return null;
  }

  return (
    <div className="w-full">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              theme: "dark",
              height: "48px",
              type: "default",
            },
          },
        }}
      />
    </div>
  );
};
