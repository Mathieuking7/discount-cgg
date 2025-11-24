import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupération du mode actif et de la clé correspondante
    const stripeMode = Deno.env.get('STRIPE_MODE') || 'test';
    const publishableKey = stripeMode === 'live'
      ? Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY')
      : Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY_TEST');
    
    if (!publishableKey) {
      throw new Error(`VITE_STRIPE_PUBLISHABLE_KEY${stripeMode === 'test' ? '_TEST' : ''} not configured`);
    }

    console.log(`Returning Stripe key for mode: ${stripeMode.toUpperCase()}`);
    console.log(`Key starts with: ${publishableKey.substring(0, 7)}...`);

    return new Response(
      JSON.stringify({ 
        publishableKey,
        mode: stripeMode 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in get-stripe-key:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
