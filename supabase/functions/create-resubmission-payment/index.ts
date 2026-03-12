import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, demarche_id } = await req.json();

    if (!order_id && !demarche_id) {
      throw new Error("order_id ou demarche_id est requis");
    }

    console.log(`📦 Creating resubmission payment for ${order_id ? 'order' : 'demarche'} ${order_id || demarche_id}`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let email: string;
    let trackingNumber: string;
    let successUrl: string;
    let cancelUrl: string;
    let metadata: Record<string, string>;
    let resubmissionAmount: number;

    // Handle guest order resubmission
    if (order_id) {
      const { data: order, error: orderError } = await supabaseClient
        .from("guest_orders")
        .select("*")
        .eq("id", order_id)
        .single();

      if (orderError || !order) {
        throw new Error("Commande non trouvée");
      }

      if (!order.requires_resubmission_payment) {
        throw new Error("Cette commande ne nécessite pas de paiement de renvoi");
      }

      if (order.resubmission_paid) {
        throw new Error("Le paiement de renvoi a déjà été effectué");
      }

      resubmissionAmount = Number(order.resubmission_amount);
      if (!resubmissionAmount || resubmissionAmount <= 0) {
        throw new Error("Montant de renvoi invalide pour cette commande");
      }

      email = order.email;
      trackingNumber = order.tracking_number;
      successUrl = `${req.headers.get("origin")}/suivi/${order.tracking_number}?resubmission_paid=true`;
      cancelUrl = `${req.headers.get("origin")}/suivi/${order.tracking_number}?resubmission_cancelled=true`;
      metadata = {
        order_id: order_id,
        type: 'resubmission_payment',
        tracking_number: order.tracking_number,
      };
    }
    // Handle demarche resubmission
    else if (demarche_id) {
      const { data: demarche, error: demarcheError } = await supabaseClient
        .from("demarches")
        .select("*, garages(*)")
        .eq("id", demarche_id)
        .single();

      if (demarcheError || !demarche) {
        throw new Error("Démarche non trouvée");
      }

      if (!demarche.requires_resubmission_payment) {
        throw new Error("Cette démarche ne nécessite pas de paiement de renvoi");
      }

      if (demarche.resubmission_paid) {
        throw new Error("Le paiement de renvoi a déjà été effectué");
      }

      resubmissionAmount = Number(demarche.resubmission_amount);
      if (!resubmissionAmount || resubmissionAmount <= 0) {
        throw new Error("Montant de renvoi invalide pour cette démarche");
      }

      email = demarche.garages?.email || "";
      trackingNumber = demarche.numero_demarche || demarche_id;
      successUrl = `${req.headers.get("origin")}/demarche/${demarche_id}?resubmission_paid=true`;
      cancelUrl = `${req.headers.get("origin")}/demarche/${demarche_id}?resubmission_cancelled=true`;
      metadata = {
        demarche_id: demarche_id,
        type: 'demarche_resubmission_payment',
        tracking_number: trackingNumber,
      };
    } else {
      throw new Error("order_id ou demarche_id requis");
    }

    // Check if a Stripe customer record exists for this email
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session for resubmission fee
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Frais de renvoi de documents',
              description: `${order_id ? 'Commande' : 'Démarche'} ${trackingNumber} - Frais de traitement pour renvoi de documents`,
            },
            unit_amount: Math.round(resubmissionAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    console.log(`✅ Checkout session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ Error creating resubmission payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});