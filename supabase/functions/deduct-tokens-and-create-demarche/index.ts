import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify JWT from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Create authenticated client to verify the user
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Token invalide" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Service role client for privileged operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const {
      garage_id,
      demarche_type,
      immatriculation,
      payment_option,
      frais_dossier,
      prix_carte_grise,
      client_email,
      client_nom,
      client_telephone,
      vehicule_data,
    } = await req.json();

    // Validate required fields
    if (!garage_id || !demarche_type || !immatriculation || !payment_option) {
      return new Response(
        JSON.stringify({ error: "Champs requis manquants: garage_id, demarche_type, immatriculation, payment_option" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    if (!['garage_dossier', 'garage_tout', 'client_tout'].includes(payment_option)) {
      return new Response(
        JSON.stringify({ error: "Option de paiement invalide" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify the user owns this garage
    const { data: garage, error: garageError } = await supabase
      .from("garages")
      .select("id, user_id, token_balance")
      .eq("id", garage_id)
      .single();

    if (garageError || !garage) {
      return new Response(
        JSON.stringify({ error: "Garage introuvable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    if (garage.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Accès refusé à ce garage" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Calculate amounts based on payment_option
    const dossier = Number(frais_dossier) || 0;
    const carteGrise = Number(prix_carte_grise) || 0;
    let garage_amount = 0;
    let client_amount = 0;
    let client_payment_status = 'not_required';
    let transaction_type = 'frais_dossier';

    switch (payment_option) {
      case 'garage_dossier':
        // Option A: garage pays frais_dossier, client pays carte_grise
        garage_amount = dossier;
        client_amount = carteGrise;
        client_payment_status = 'pending';
        transaction_type = 'frais_dossier';
        break;
      case 'garage_tout':
        // Option B: garage pays everything
        garage_amount = dossier + carteGrise;
        client_amount = 0;
        client_payment_status = 'not_required';
        transaction_type = 'frais_dossier_et_carte_grise';
        break;
      case 'client_tout':
        // Option C: client pays everything, garage pays nothing from tokens
        garage_amount = 0;
        client_amount = dossier + carteGrise;
        client_payment_status = 'pending';
        transaction_type = 'frais_dossier_et_carte_grise';
        break;
    }

    // Atomic operation via RPC / raw SQL
    // Lock the garage row, check balance, deduct, insert demarche, insert transaction
    const { data: result, error: rpcError } = await supabase.rpc('deduct_tokens_and_create_demarche', {
      p_garage_id: garage_id,
      p_user_id: user.id,
      p_demarche_type: demarche_type,
      p_immatriculation: immatriculation,
      p_payment_option: payment_option,
      p_frais_dossier: dossier,
      p_prix_carte_grise: carteGrise,
      p_garage_amount: garage_amount,
      p_client_amount: client_amount,
      p_client_payment_status: client_payment_status,
      p_client_email: client_email || null,
      p_client_nom: client_nom || null,
      p_client_telephone: client_telephone || null,
      p_vehicule_data: vehicule_data ? JSON.stringify(vehicule_data) : null,
      p_transaction_type: transaction_type,
    });

    if (rpcError) {
      console.error("RPC error:", rpcError);
      // Check for insufficient balance error from the function
      if (rpcError.message?.includes('Solde insuffisant')) {
        return new Response(
          JSON.stringify({ error: "Solde de jetons insuffisant", required: garage_amount, available: garage.token_balance }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      return new Response(
        JSON.stringify({ error: rpcError.message || "Erreur lors de la création de la démarche" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Demarche created successfully:", result);

    return new Response(
      JSON.stringify({
        success: true,
        demarche_id: result.demarche_id,
        client_payment_link_id: result.client_payment_link_id,
        garage_new_balance: result.garage_new_balance,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error('Error in deduct-tokens-and-create-demarche:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur inconnue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
