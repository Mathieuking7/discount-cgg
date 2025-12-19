import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { factureId } = await req.json();

    if (!factureId) {
      return new Response(
        JSON.stringify({ error: "factureId requis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer la facture
    const { data: facture, error: factureError } = await supabase
      .from("factures")
      .select("pdf_url, numero")
      .eq("id", factureId)
      .single();

    if (factureError || !facture) {
      console.error("Erreur facture:", factureError);
      return new Response(
        JSON.stringify({ error: "Facture non trouvée" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!facture.pdf_url) {
      return new Response(
        JSON.stringify({ error: "PDF non disponible pour cette facture" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extraire le chemin du fichier depuis l'URL
    let filePath = facture.pdf_url;
    
    // Si c'est une URL complète, extraire le chemin après /factures/
    if (filePath.includes('/storage/v1/object/')) {
      const match = filePath.match(/\/storage\/v1\/object\/(?:public|sign)\/factures\/(.+)/);
      if (match) {
        filePath = decodeURIComponent(match[1]);
      }
    } else if (filePath.includes('/factures/')) {
      const match = filePath.match(/\/factures\/(.+)$/);
      if (match) {
        filePath = decodeURIComponent(match[1]);
      }
    } else if (filePath.startsWith('factures/')) {
      filePath = filePath.replace('factures/', '');
    }

    console.log("Création d'une URL signée pour:", filePath);

    // Créer une URL signée (valide 60 secondes)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("factures")
      .createSignedUrl(filePath, 60);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error("Erreur création URL signée:", signedUrlError);
      
      // Essayer avec le chemin original si l'extraction a échoué
      if (facture.pdf_url !== filePath) {
        console.log("Tentative avec chemin original:", facture.pdf_url);
        const { data: retryData, error: retryError } = await supabase.storage
          .from("factures")
          .createSignedUrl(facture.pdf_url, 60);
        
        if (!retryError && retryData?.signedUrl) {
          return new Response(
            JSON.stringify({ signedUrl: retryData.signedUrl, filename: `facture_${facture.numero}.pdf` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        console.error("Erreur retry URL signée:", retryError);
      }
      
      return new Response(
        JSON.stringify({ error: "Impossible de générer l'URL de téléchargement" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ signedUrl: signedUrlData.signedUrl, filename: `facture_${facture.numero}.pdf` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
