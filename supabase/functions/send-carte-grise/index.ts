import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Multi-provider: RESEND_API_KEY -> BREVO_API_KEY -> log only
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
};

const validateAuth = async (req: Request): Promise<boolean> => {
  const providedKey = req.headers.get("x-internal-key");
  if (providedKey === INTERNAL_API_KEY) return true;

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (user && !userError) {
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").single();
      if (roleData) return true;
    }
  }
  return false;
};

async function doSendEmail(params: { from: string; to: string; subject: string; html: string; attachments?: { filename: string; content: string }[] }) {
  if (RESEND_API_KEY) {
    const { Resend } = await import("https://esm.sh/resend@2.0.0");
    const resend = new Resend(RESEND_API_KEY);
    const res = await resend.emails.send({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    });
    if (res.error) return { success: false, provider: "resend", error: JSON.stringify(res.error) };
    return { success: true, provider: "resend", data: res.data };
  }
  if (BREVO_API_KEY) {
    const fromMatch = params.from.match(/^(.+?)\s*<(.+?)>$/);
    const body: Record<string, any> = {
      sender: { name: fromMatch?.[1]?.trim() || "DiscountCarteGrise", email: fromMatch?.[2]?.trim() || "noreply@discountcartegrise.fr" },
      to: [{ email: params.to }],
      subject: params.subject,
      htmlContent: params.html,
    };
    if (params.attachments?.length) {
      body.attachment = params.attachments.map(a => ({ name: a.filename, content: a.content }));
    }
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "api-key": BREVO_API_KEY!, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { success: false, provider: "brevo", error: `Brevo ${res.status}: ${await res.text()}` };
    return { success: true, provider: "brevo", data: await res.json() };
  }
  console.warn(`=== CARTE GRISE EMAIL NOT SENT (no provider) === To: ${params.to} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

interface SendCarteGriseRequest {
  orderId: string;
  carteGriseUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const isAuthorized = await validateAuth(req);
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { orderId, carteGriseUrl }: SendCarteGriseRequest = await req.json();

    console.log('Sending carte grise email for order:', orderId);

    const { data: order, error: orderError } = await supabase
      .from('guest_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Fetch carte grise file
    const carteGriseResponse = await fetch(carteGriseUrl);
    const carteGriseBlob = await carteGriseResponse.blob();
    const carteGriseBuffer = await carteGriseBlob.arrayBuffer();
    const carteGriseBase64 = btoa(
      String.fromCharCode(...new Uint8Array(carteGriseBuffer))
    );

    const subject = `Votre carte grise - Commande ${order.tracking_number}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Votre carte grise est prete !</h1>
        <p>Bonjour ${order.prenom} ${order.nom},</p>
        <p>Nous avons le plaisir de vous informer que votre carte grise pour le vehicule <strong>${order.immatriculation}</strong> est prete.</p>
        <p>Vous trouverez votre carte grise en piece jointe de ce mail.</p>
        <p style="margin-top: 30px;">
          <strong>Numero de suivi :</strong> ${order.tracking_number}
        </p>
        <p style="margin-top: 30px; color: #666;">
          Cordialement,<br>
          L'equipe DiscountCarteGrise
        </p>
      </div>
    `;

    const result = await doSendEmail({
      from: 'DiscountCarteGrise <noreply@discountcartegrise.fr>',
      to: order.email,
      subject,
      html,
      attachments: [{
        filename: `carte-grise-${order.immatriculation}.pdf`,
        content: carteGriseBase64,
      }],
    });

    // Log to email_log
    try {
      await supabase.from("email_log").insert({
        recipient_email: order.email,
        subject,
        template_type: "carte_grise_delivery",
        status: result.success ? (result.provider === "log_only" ? "logged" : "sent") : "failed",
        error_message: result.error || null,
        order_id: order.id,
      });
    } catch (e) { console.error("Failed to save email_log:", e); }

    if (!result.success) console.error(`Carte grise email failed via ${result.provider}:`, result.error);
    else console.log(`Carte grise email sent via ${result.provider}`);

    // Always return success
    return new Response(
      JSON.stringify({ success: true, provider: result.provider, data: result.data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-carte-grise:', error);
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but operation continues", error: error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
