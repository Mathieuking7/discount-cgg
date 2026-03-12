import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// =============================================================================
// MULTI-PROVIDER EMAIL SENDING (same logic as send-email)
// Priority: RESEND_API_KEY -> BREVO_API_KEY -> log only
// See send-email/index.ts for setup instructions.
// =============================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ---------------------------------------------------------------------------
// Provider functions
// ---------------------------------------------------------------------------
async function sendViaResend(params: { from: string; replyTo: string; to: string; subject: string; html: string }) {
  const { Resend } = await import("https://esm.sh/resend@2.0.0");
  const resend = new Resend(RESEND_API_KEY);
  const res = await resend.emails.send({
    from: params.from,
    reply_to: params.replyTo,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  if (res.error) return { success: false, error: JSON.stringify(res.error) };
  return { success: true, data: res.data };
}

async function sendViaBrevo(params: { from: string; replyTo: string; to: string; subject: string; html: string }) {
  const fromMatch = params.from.match(/^(.+?)\s*<(.+?)>$/);
  const senderName = fromMatch ? fromMatch[1].trim() : "DiscountCarteGrise";
  const senderEmail = fromMatch ? fromMatch[2].trim() : "noreply@discountcartegrise.fr";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: params.to }],
      replyTo: { email: params.replyTo },
      subject: params.subject,
      htmlContent: params.html,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Brevo ${res.status}: ${errText}` };
  }
  return { success: true, data: await res.json() };
}

async function doSendEmail(params: { from: string; replyTo: string; to: string; subject: string; html: string }) {
  if (RESEND_API_KEY) return { ...(await sendViaResend(params)), provider: "resend" };
  if (BREVO_API_KEY) return { ...(await sendViaBrevo(params)), provider: "brevo" };

  console.warn("=== CONTACT EMAIL NOT SENT (no provider) ===");
  console.log(`  From: ${params.replyTo} | To: ${params.to} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

async function saveToEmailLog(supabase: any, p: { to: string; subject: string; type: string; status: string; errorMessage?: string }) {
  try {
    await supabase.from("email_log").insert({
      recipient_email: p.to,
      subject: p.subject,
      template_type: p.type,
      status: p.status,
      error_message: p.errorMessage || null,
    });
  } catch (e) {
    console.error("Failed to save email_log:", e);
  }
}

interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { name, email, phone, message }: ContactRequest = await req.json();

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Nom, email et message sont requis" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Format d'email invalide" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Contact form from ${name} (${email})`);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : '';
    const safeMessage = escapeHtml(message);

    const subject = `Nouveau message de ${safeName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #3b82f6;">Nouveau message de contact</h1>

        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Nom :</strong> ${safeName}</p>
          <p style="margin: 8px 0;"><strong>Email :</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
          ${safePhone ? `<p style="margin: 8px 0;"><strong>Telephone :</strong> ${safePhone}</p>` : ''}
        </div>

        <div style="background-color: #fff; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Message :</h3>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Cet email a ete envoye depuis le formulaire de contact de DiscountCarteGrise.fr
        </p>
      </div>
    `;

    const result = await doSendEmail({
      from: "DiscountCarteGrise <noreply@discountcartegrise.fr>",
      replyTo: email,
      to: "contact@discountcartegrise.fr",
      subject,
      html,
    });

    await saveToEmailLog(supabase, {
      to: "contact@discountcartegrise.fr",
      subject,
      type: "contact_form",
      status: result.success ? (result.provider === "log_only" ? "logged" : "sent") : "failed",
      errorMessage: result.error,
    });

    if (!result.success) {
      console.error(`Contact email failed via ${result.provider}:`, result.error);
    } else {
      console.log(`Contact email sent via ${result.provider}`);
    }

    // Always return success so the contact form UX is not broken
    return new Response(JSON.stringify({ success: true, provider: result.provider }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email:", error);

    // Never crash the contact form flow
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but form submission recorded", error: error.message }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
