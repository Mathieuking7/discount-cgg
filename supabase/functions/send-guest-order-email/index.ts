import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// =============================================================================
// MULTI-PROVIDER EMAIL SENDING (same logic as send-email)
// Priority: RESEND_API_KEY -> BREVO_API_KEY -> log only
// See send-email/index.ts for setup instructions.
// =============================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
};

const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");

const validateAuth = async (req: Request): Promise<boolean> => {
  const providedKey = req.headers.get("x-internal-key");
  if (providedKey && INTERNAL_API_KEY && providedKey === INTERNAL_API_KEY) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (token === supabaseKey) return true;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (user && !userError) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();
      if (roleData) return true;
    }
  }

  return false;
};

// ---------------------------------------------------------------------------
// Provider functions
// ---------------------------------------------------------------------------
async function sendViaResend(params: { from: string; to: string; subject: string; html: string }) {
  const { Resend } = await import("https://esm.sh/resend@2.0.0");
  const resend = new Resend(RESEND_API_KEY);
  const res = await resend.emails.send(params);
  if (res.error) return { success: false, error: JSON.stringify(res.error) };
  return { success: true, data: res.data };
}

async function sendViaBrevo(params: { from: string; to: string; subject: string; html: string }) {
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

async function doSendEmail(params: { from: string; to: string; subject: string; html: string }) {
  if (RESEND_API_KEY) return { ...(await sendViaResend(params)), provider: "resend" };
  if (BREVO_API_KEY) return { ...(await sendViaBrevo(params)), provider: "brevo" };

  console.warn("=== EMAIL NOT SENT (no provider) ===");
  console.log(`  To: ${params.to} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

async function saveToEmailLog(supabase: any, p: { to: string; subject: string; type: string; status: string; errorMessage?: string; orderId?: string }) {
  try {
    await supabase.from("email_log").insert({
      recipient_email: p.to,
      subject: p.subject,
      template_type: p.type,
      status: p.status,
      error_message: p.errorMessage || null,
      order_id: p.orderId || null,
    });
  } catch (e) {
    console.error("Failed to save email_log:", e);
  }
}

interface EmailRequest {
  type: 'order_confirmation' | 'documents_received' | 'payment_confirmed' | 'processing' | 'completed';
  orderData: {
    tracking_number: string;
    email: string;
    nom: string;
    prenom: string;
    immatriculation: string;
    montant_ttc: number;
  };
}

const getEmailContent = async (type: string, orderData: any) => {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: template, error } = await supabase
    .from('email_templates')
    .select('subject, html_content')
    .eq('type', type)
    .single();

  if (error || !template) {
    console.error('Error fetching template:', error);
    throw new Error(`Template not found for type: ${type}`);
  }

  const baseUrl = "https://discountcartegrise.fr";
  const trackingUrl = `${baseUrl}/suivi/${orderData.tracking_number}`;

  let subject = template.subject;
  let html = template.html_content;

  const replacements: Record<string, string> = {
    '{{tracking_number}}': orderData.tracking_number || '',
    '{{prenom}}': orderData.prenom || '',
    '{{nom}}': orderData.nom || '',
    '{{immatriculation}}': orderData.immatriculation || '',
    '{{montant_ttc}}': orderData.montant_ttc?.toFixed(2) || '0',
    '{{marque}}': orderData.marque || '',
    '{{modele}}': orderData.modele || '',
    '{{tracking_url}}': trackingUrl,
  };

  Object.entries(replacements).forEach(([key, value]) => {
    subject = subject.replace(new RegExp(key, 'g'), value);
    html = html.replace(new RegExp(key, 'g'), value);
  });

  return { subject, html };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const isAuthorized = await validateAuth(req);
  if (!isAuthorized) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { type, orderData }: EmailRequest = await req.json();

    console.log('Sending guest order email:', { type, tracking: orderData.tracking_number });

    const { subject, html } = await getEmailContent(type, orderData);

    const result = await doSendEmail({
      from: 'DiscountCarteGrise <noreply@discountcartegrise.fr>',
      to: orderData.email,
      subject,
      html,
    });

    await saveToEmailLog(supabase, {
      to: orderData.email,
      subject,
      type,
      status: result.success ? (result.provider === "log_only" ? "logged" : "sent") : "failed",
      errorMessage: result.error,
    });

    if (!result.success) {
      console.error(`Email failed via ${result.provider}:`, result.error);
    } else {
      console.log(`Email sent via ${result.provider}`);
    }

    // Always return success so the order flow is not blocked
    return new Response(
      JSON.stringify({ success: true, provider: result.provider, data: result.data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-guest-order-email:', error);

    // Never crash the order flow
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but order continues", error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
