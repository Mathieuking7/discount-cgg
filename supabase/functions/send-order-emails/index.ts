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

async function doSendEmail(params: { from: string; to: string | string[]; subject: string; html: string }) {
  const toEmail = Array.isArray(params.to) ? params.to[0] : params.to;
  if (RESEND_API_KEY) {
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(RESEND_API_KEY);
    const res = await resend.emails.send({ from: params.from, to: Array.isArray(params.to) ? params.to : [params.to], subject: params.subject, html: params.html });
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
        to: [{ email: toEmail }],
        subject: params.subject,
        htmlContent: params.html,
      }),
    });
    if (!res.ok) return { success: false, provider: "brevo", error: `Brevo ${res.status}: ${await res.text()}` };
    return { success: true, provider: "brevo", data: await res.json() };
  }
  console.warn(`=== EMAIL NOT SENT (no provider) === To: ${toEmail} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

interface EmailRequest {
  type: 'order_complete' | 'document_rejected' | 'payment_confirmed' | 'account_verified' | 'account_rejected' | 'simple_message';
  orderId?: string;
  trackingNumber?: string;
  demarcheId?: string;
  email: string;
  customerName: string;
  immatriculation?: string;
  rejectedDocuments?: Array<{ nom: string; raison: string }>;
  montantTTC?: number;
  rejectionReason?: string;
  customSubject?: string;
  customMessage?: string;
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
    const emailData: EmailRequest = await req.json();

    let subject: string;
    let html: string;

    if (emailData.type === 'simple_message') {
      subject = emailData.customSubject || 'Message';
      html = `<div style="font-family: Arial, sans-serif;">${emailData.customMessage || ''}</div>`;
    } else {
      const { data: template, error: templateError } = await supabase
        .from('email_templates')
        .select('subject, html_content')
        .eq('type', emailData.type)
        .single();

      if (templateError) {
        console.error(`Template not found for type: ${emailData.type}`, templateError);
        throw new Error(`Email template not found: ${emailData.type}`);
      }

      let replacements: Record<string, string> = {
        customerName: emailData.customerName,
        immatriculation: emailData.immatriculation || '',
        trackingNumber: emailData.trackingNumber || '',
        demarcheId: emailData.demarcheId || '',
        montantTTC: emailData.montantTTC?.toString() || '',
        rejectionReason: emailData.rejectionReason || '',
      };

      if (emailData.rejectedDocuments && emailData.rejectedDocuments.length > 0) {
        replacements.rejectedDocuments = emailData.rejectedDocuments.map(doc => `<li><strong>${doc.nom}</strong>: ${doc.raison}</li>`).join('');
      }

      subject = template.subject;
      html = template.html_content;

      Object.entries(replacements).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(placeholder, value);
        html = html.replace(placeholder, value);
      });
    }

    console.log(`Sending email type: ${emailData.type} to ${emailData.email}`);

    const result = await doSendEmail({
      from: "DiscountCarteGrise <noreply@discountcartegrise.fr>",
      to: emailData.email,
      subject,
      html,
    });

    // Log to email_log
    try {
      await supabase.from("email_log").insert({
        recipient_email: emailData.email,
        subject,
        template_type: emailData.type,
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
    console.error("Error in send-order-emails:", error);
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but operation continues", error: error.message }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
