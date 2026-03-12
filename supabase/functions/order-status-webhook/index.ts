import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// =============================================================================
// MULTI-PROVIDER EMAIL SENDING
// Priority: RESEND_API_KEY -> BREVO_API_KEY -> log only
// See send-email/index.ts for full setup instructions.
// =============================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-key",
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
const validateAuth = async (req: Request): Promise<boolean> => {
  const providedKey = req.headers.get("x-internal-key");
  if (providedKey && INTERNAL_API_KEY && providedKey === INTERNAL_API_KEY) return true;

  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("apikey");

  if (apiKey === supabaseServiceKey) return true;

  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (apiKey && supabaseAnonKey && apiKey === supabaseAnonKey) return true;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (token === supabaseServiceKey) return true;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (user && !error) return true;
  }
  return false;
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

  console.warn("=== EMAIL NOT SENT (no provider) ===");
  console.log(`  To: ${params.to} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

// ---------------------------------------------------------------------------
// Email template helpers
// ---------------------------------------------------------------------------
const BASE_URL = "https://discountcartegrise.fr";

const brandHeader = `
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
    <h2 style="color: #ffffff; margin: 0; font-size: 22px; letter-spacing: 1px;">SIVFlow</h2>
    <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Service de carte grise en ligne</p>
  </div>
`;

const brandFooter = `
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 4px 0;">SIVFlow &mdash; DiscountCarteGrise</p>
    <p style="margin: 4px 0;">contact@discountcartegrise.fr</p>
    <p style="margin: 4px 0;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
  </div>
`;

function trackingButton(trackingNumber: string, label = "Suivre ma commande") {
  const url = `${BASE_URL}/suivi/${trackingNumber}`;
  return `
    <div style="text-align: center; margin: 24px 0;">
      <a href="${url}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        ${label}
      </a>
    </div>
  `;
}

function orderInfoBox(order: any) {
  return `
    <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 6px 0;"><strong>N&deg; de suivi :</strong> ${order.tracking_number}</p>
      <p style="margin: 6px 0;"><strong>Immatriculation :</strong> ${order.immatriculation}</p>
      ${order.demarche_type ? `<p style="margin: 6px 0;"><strong>Type de demarche :</strong> ${order.demarche_type}</p>` : ""}
    </div>
  `;
}

function wrap(body: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      ${brandHeader}
      <div style="padding: 24px;">
        ${body}
      </div>
      ${brandFooter}
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Status -> email mapping
// ---------------------------------------------------------------------------
interface StatusEmail {
  subject: string;
  html: string;
}

function getStatusEmail(
  newStatus: string,
  order: any,
  additionalData?: any
): StatusEmail | null {
  const greeting = `<p>Bonjour ${order.prenom} ${order.nom},</p>`;

  switch (newStatus) {
    case "paye":
      return {
        subject: `Paiement recu - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #22c55e;">Paiement recu</h2>
          <p>Nous avons bien recu votre paiement de <strong>${order.montant_ttc}&nbsp;&euro;</strong>. Notre equipe va maintenant traiter votre dossier.</p>
          ${orderInfoBox(order)}
          <p>Vous serez notifie a chaque etape de l'avancement de votre demarche.</p>
          ${trackingButton(order.tracking_number)}
        `),
      };

    case "documents_valides":
      return {
        subject: `Documents valides - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #22c55e;">Vos documents ont ete valides</h2>
          <p>Tous les documents de votre dossier ont ete verifies et valides par notre equipe. Nous passons a l'etape suivante du traitement.</p>
          ${orderInfoBox(order)}
          ${trackingButton(order.tracking_number)}
        `),
      };

    case "document_refuse": {
      const reason = additionalData?.reason || "Veuillez consulter votre espace de suivi pour plus de details.";
      const docs = additionalData?.rejected_documents as
        | { nom: string; raison: string }[]
        | undefined;
      const docList = docs
        ? `<ul style="margin: 0; padding-left: 20px;">${docs.map((d) => `<li style="margin: 6px 0;"><strong>${d.nom} :</strong> ${d.raison}</li>`).join("")}</ul>`
        : `<p>${reason}</p>`;

      return {
        subject: `Document refuse - Action requise - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #ef4444;">Un document a ete refuse</h2>
          <p>Un ou plusieurs documents de votre dossier necessitent votre attention :</p>
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            ${docList}
          </div>
          <p>Veuillez telecharger les documents corriges via votre espace de suivi :</p>
          ${trackingButton(order.tracking_number, "Renvoyer mes documents")}
        `),
      };
    }

    case "soumis_ants":
      return {
        subject: `Dossier soumis a l'ANTS - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #3b82f6;">Votre dossier a ete soumis a l'ANTS</h2>
          <p>Votre dossier a ete transmis a l'Agence Nationale des Titres Securises (ANTS) pour traitement. Le delai habituel est de quelques jours ouvrables.</p>
          ${orderInfoBox(order)}
          ${trackingButton(order.tracking_number)}
        `),
      };

    case "cpi_disponible":
      return {
        subject: `CPI disponible - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #22c55e;">Votre CPI est disponible</h2>
          <p>Votre Certificat Provisoire d'Immatriculation (CPI) est maintenant disponible. Vous pouvez le telecharger depuis votre espace de suivi.</p>
          ${orderInfoBox(order)}
          ${trackingButton(order.tracking_number, "Telecharger mon CPI")}
        `),
      };

    case "termine":
      return {
        subject: `Carte grise expediee - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #22c55e;">Votre carte grise a ete expediee !</h2>
          <p>Excellente nouvelle ! Votre carte grise pour le vehicule <strong>${order.immatriculation}</strong> a ete expediee. Vous la recevrez sous quelques jours a votre adresse.</p>
          ${orderInfoBox(order)}
          <p style="margin-top: 20px;">Merci de votre confiance !</p>
          ${trackingButton(order.tracking_number)}
        `),
      };

    case "annule":
      return {
        subject: `Commande annulee - ${order.tracking_number}`,
        html: wrap(`
          ${greeting}
          <h2 style="color: #ef4444;">Votre commande a ete annulee</h2>
          <p>Nous vous informons que votre commande <strong>${order.tracking_number}</strong> a ete annulee.</p>
          ${additionalData?.reason ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin: 0;"><strong>Motif :</strong> ${additionalData.reason}</p></div>` : ""}
          <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter a <a href="mailto:contact@discountcartegrise.fr">contact@discountcartegrise.fr</a>.</p>
          ${trackingButton(order.tracking_number, "Voir le detail")}
        `),
      };

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const isAuthorized = await validateAuth(req);
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { order_id, new_status, old_status, additional_data } = await req.json();

    if (!order_id || !new_status) {
      return new Response(
        JSON.stringify({ error: "order_id and new_status are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("guest_orders")
      .select("*")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Skip if customer opted out of email notifications
    if (!order.email_notifications) {
      console.log(`Email notifications disabled for order ${order.tracking_number}`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailContent = getStatusEmail(new_status, order, additional_data);
    if (!emailContent) {
      console.log(`No email template for status: ${new_status}`);
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: "no_template" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email via multi-provider
    const result = await doSendEmail({
      from: "DiscountCarteGrise <noreply@discountcartegrise.fr>",
      replyTo: "contact@discountcartegrise.fr",
      to: order.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    // Log to email_log table
    try {
      await supabase.from("email_log").insert({
        recipient_email: order.email,
        subject: emailContent.subject,
        template_type: `order_status_${new_status}`,
        status: result.success ? (result.provider === "log_only" ? "logged" : "sent") : "failed",
        error_message: result.error || null,
        order_id: order.id,
      });
    } catch (e) {
      console.error("Failed to save email_log:", e);
    }

    if (!result.success) {
      console.error(`Email failed via ${result.provider}:`, result.error);
    } else {
      console.log(`Email sent for order ${order.tracking_number} status=${new_status} via ${result.provider}`);
    }

    // Always return success so the status update flow is not blocked
    return new Response(
      JSON.stringify({ success: true, provider: result.provider, data: result.data }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in order-status-webhook:", error);

    // Never crash the status update flow
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but status update continues", error: error.message }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
