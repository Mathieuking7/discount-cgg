import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Multi-provider: RESEND_API_KEY -> BREVO_API_KEY -> log only
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
};

const validateAuth = async (req: Request): Promise<boolean> => {
  const providedKey = req.headers.get("x-internal-key");
  if (providedKey === INTERNAL_API_KEY) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (user && !userError) {
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
      if (roleData) return true;
    }
  }
  return false;
};

async function doSendEmail(params: { from: string; to: string; subject: string; html: string }) {
  if (RESEND_API_KEY) {
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(RESEND_API_KEY);
    const res = await resend.emails.send(params);
    if (res.error) return { success: false, provider: "resend", error: JSON.stringify(res.error) };
    return { success: true, provider: "resend", data: res.data };
  }
  if (BREVO_API_KEY) {
    const fromMatch = params.from.match(/^(.+?)\s*<(.+?)>$/);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "api-key": BREVO_API_KEY!, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: fromMatch?.[1]?.trim() || "DiscountCarteGrise", email: fromMatch?.[2]?.trim() || "noreply@discountcartegrise.fr" },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.html,
      }),
    });
    if (!res.ok) return { success: false, provider: "brevo", error: `Brevo ${res.status}: ${await res.text()}` };
    return { success: true, provider: "brevo", data: await res.json() };
  }
  console.warn(`=== EMAIL NOT SENT (no provider) === To: ${params.to} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

interface DocumentNotificationRequest {
  type: 'validation_approved' | 'validation_rejected';
  orderData: {
    tracking_number: string;
    email: string;
    nom: string;
    prenom: string;
    documentName: string;
    rejectionReason?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const isAuthorized = await validateAuth(req);
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { type, orderData }: DocumentNotificationRequest = await req.json();

    let subject = "";
    let html = "";

    if (type === 'validation_approved') {
      subject = "Document valide - " + orderData.tracking_number;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Document valide</h1>
          <p>Bonjour ${orderData.prenom} ${orderData.nom},</p>
          <p>Votre document <strong>${orderData.documentName}</strong> a ete valide avec succes.</p>
          <p>Numero de suivi : <strong>${orderData.tracking_number}</strong></p>
          <p>Nous continuons le traitement de votre dossier.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
        </div>
      `;
    } else if (type === 'validation_rejected') {
      subject = "Document refuse - Action requise - " + orderData.tracking_number;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Document refuse</h1>
          <p>Bonjour ${orderData.prenom} ${orderData.nom},</p>
          <p>Malheureusement, votre document <strong>${orderData.documentName}</strong> n'a pas pu etre valide.</p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 16px 0;">
            <strong>Raison :</strong> ${orderData.rejectionReason || 'Document illisible ou incomplet'}
          </div>
          <p>Veuillez telecharger un nouveau document via votre page de suivi :</p>
          <p><a href="https://discountcartegrise.fr/suivi/${orderData.tracking_number}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Acceder a mon suivi</a></p>
          <p>Numero de suivi : <strong>${orderData.tracking_number}</strong></p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
        </div>
      `;
    }

    const result = await doSendEmail({
      from: "DiscountCarteGrise <noreply@discountcartegrise.fr>",
      to: orderData.email,
      subject,
      html,
    });

    // Log to email_log
    try {
      await supabase.from("email_log").insert({
        recipient_email: orderData.email,
        subject,
        template_type: `document_${type}`,
        status: result.success ? (result.provider === "log_only" ? "logged" : "sent") : "failed",
        error_message: result.error || null,
      });
    } catch (e) { console.error("Failed to save email_log:", e); }

    if (!result.success) console.error(`Email failed via ${result.provider}:`, result.error);

    // Always return success
    return new Response(JSON.stringify({ success: true, provider: result.provider, data: result.data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-document-notification:", error);
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but operation continues", error: error.message }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
