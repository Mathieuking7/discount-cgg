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
    // Use production Stripe publishable key
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY') || Deno.env.get('VITE_STRIPE_PUBLISHABLE_KEY');

    if (!publishableKey) {
      // Return a safe fallback instead of crashing - frontend will handle missing key gracefully
      return new Response(
        JSON.stringify({ publishableKey: null, warning: 'Stripe not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ publishableKey }),
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
