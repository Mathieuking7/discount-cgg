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
    // Format attendu: https://xxx.supabase.co/storage/v1/object/public/factures/path/file.pdf
    // ou: factures/path/file.pdf (chemin relatif)
    let filePath = facture.pdf_url;
    
    // Si c'est une URL complète, extraire le chemin
    if (filePath.includes('/storage/v1/object/')) {
      const match = filePath.match(/\/storage\/v1\/object\/(?:public|sign)\/factures\/(.+)/);
      if (match) {
        filePath = match[1];
      }
    } else if (filePath.startsWith('factures/')) {
      filePath = filePath.replace('factures/', '');
    }

    console.log("Téléchargement du fichier:", filePath);

    // Télécharger le fichier depuis le bucket privé
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("factures")
      .download(filePath);

    if (downloadError || !fileData) {
      console.error("Erreur téléchargement storage:", downloadError);
      
      // Essayer avec le chemin original si l'extraction a échoué
      if (facture.pdf_url !== filePath) {
        console.log("Tentative avec chemin original:", facture.pdf_url);
        const { data: retryData, error: retryError } = await supabase.storage
          .from("factures")
          .download(facture.pdf_url);
        
        if (retryError || !retryData) {
          console.error("Erreur téléchargement retry:", retryError);
          return new Response(
            JSON.stringify({ error: "Impossible de télécharger le PDF" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        const pdfBytes = await retryData.arrayBuffer();
        return new Response(pdfBytes, {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="facture_${facture.numero}.pdf"`,
          },
        });
      }
      
      return new Response(
        JSON.stringify({ error: "Impossible de télécharger le PDF" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBytes = await fileData.arrayBuffer();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="facture_${facture.numero}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
