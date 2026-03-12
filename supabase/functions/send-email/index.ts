import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// =============================================================================
// MULTI-PROVIDER EMAIL SENDING
// =============================================================================
// Priority:
// 1. If RESEND_API_KEY is set -> use Resend
// 2. If BREVO_API_KEY is set -> use Brevo (Sendinblue) - 300 free emails/day
// 3. Otherwise -> log only + save to email_log table (no email actually sent)
//
// To switch to Brevo:
//   1. Sign up at https://www.brevo.com (free: 300 emails/day)
//   2. Get your API key from Settings > SMTP & API > API Keys
//   3. Set BREVO_API_KEY in Supabase secrets:
//      supabase secrets set BREVO_API_KEY=xkeysib-xxxxx
//   4. Verify your sender domain/email in Brevo dashboard
//
// To switch to Resend:
//   1. Sign up at https://resend.com
//   2. Set RESEND_API_KEY in Supabase secrets
// =============================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-internal-key",
};

const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Validate either internal API key, service role key, anon key, OR any authenticated user
const validateAuth = async (req: Request): Promise<boolean> => {
  // Check internal API key first (for service-to-service calls)
  const providedKey = req.headers.get("x-internal-key");
  if (providedKey && INTERNAL_API_KEY && providedKey === INTERNAL_API_KEY) {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("apikey");

  // Accept service role key directly
  if (apiKey === supabaseServiceKey) return true;

  // Accept anon key (for frontend calls)
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (apiKey && supabaseAnonKey && apiKey === supabaseAnonKey) return true;

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    if (token === supabaseServiceKey) return true;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (user && !userError) return true;
  }

  return false;
};

// Escape HTML to prevent XSS in email templates
const escapeHtml = (str: string): string => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
}

interface EmailRequest {
  type: string;
  to: string;
  data: Record<string, any>;
  attachments?: EmailAttachment[];
}

// ---------------------------------------------------------------------------
// Send email via Resend
// ---------------------------------------------------------------------------
async function sendViaResend(params: {
  from: string;
  replyTo?: string;
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const { Resend } = await import("https://esm.sh/resend@2.0.0");
  const resend = new Resend(RESEND_API_KEY);

  const res = await resend.emails.send({
    from: params.from,
    reply_to: params.replyTo,
    to: params.to,
    subject: params.subject,
    html: params.html,
    attachments: params.attachments?.map(a => ({ filename: a.filename, content: a.content })),
  });

  if (res.error) {
    return { success: false, error: JSON.stringify(res.error) };
  }
  return { success: true, data: res.data };
}

// ---------------------------------------------------------------------------
// Send email via Brevo (Sendinblue) HTTP API
// ---------------------------------------------------------------------------
async function sendViaBrevo(params: {
  from: string;
  replyTo?: string;
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  // Parse "Name <email>" format
  const fromMatch = params.from.match(/^(.+?)\s*<(.+?)>$/);
  const senderName = fromMatch ? fromMatch[1].trim() : "DiscountCarteGrise";
  const senderEmail = fromMatch ? fromMatch[2].trim() : "noreply@discountcartegrise.fr";

  const body: Record<string, any> = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: params.to }],
    subject: params.subject,
    htmlContent: params.html,
  };

  if (params.replyTo) {
    body.replyTo = { email: params.replyTo };
  }

  if (params.attachments?.length) {
    body.attachment = params.attachments.map(a => ({
      name: a.filename,
      content: a.content,
    }));
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { success: false, error: `Brevo ${res.status}: ${errText}` };
  }

  const data = await res.json();
  return { success: true, data };
}

// ---------------------------------------------------------------------------
// Log-only fallback (no provider configured)
// ---------------------------------------------------------------------------
function logOnly(params: {
  to: string;
  subject: string;
  html: string;
}): { success: boolean; data: any; error?: string } {
  console.warn("=== EMAIL NOT SENT (no provider configured) ===");
  console.log(`  To: ${params.to}`);
  console.log(`  Subject: ${params.subject}`);
  console.log(`  HTML length: ${params.html.length} chars`);
  console.warn("=== Set RESEND_API_KEY or BREVO_API_KEY to enable sending ===");
  return { success: true, data: { provider: "log_only", message: "Email logged but not sent" } };
}

// ---------------------------------------------------------------------------
// Save to email_log table
// ---------------------------------------------------------------------------
async function saveToEmailLog(supabase: any, params: {
  to: string;
  subject: string;
  type: string;
  status: string;
  errorMessage?: string;
  orderId?: string;
}) {
  try {
    await supabase.from("email_log").insert({
      recipient_email: params.to,
      subject: params.subject,
      template_type: params.type,
      status: params.status,
      error_message: params.errorMessage || null,
      order_id: params.orderId || null,
    });
  } catch (e) {
    // Never crash if logging fails
    console.error("Failed to save email_log:", e);
  }
}

// ---------------------------------------------------------------------------
// Unified send function
// ---------------------------------------------------------------------------
async function sendEmail(params: {
  from: string;
  replyTo?: string;
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}): Promise<{ success: boolean; provider: string; data?: any; error?: string }> {
  if (RESEND_API_KEY) {
    console.log("Using Resend provider");
    const result = await sendViaResend(params);
    return { ...result, provider: "resend" };
  }

  if (BREVO_API_KEY) {
    console.log("Using Brevo provider");
    const result = await sendViaBrevo(params);
    return { ...result, provider: "brevo" };
  }

  console.log("No email provider configured, logging only");
  const result = logOnly(params);
  return { ...result, provider: "log_only" };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseUrl = "https://discountcartegrise.fr";
  const trackingUrl = data?.tracking_number ? `${baseUrl}/suivi/${data.tracking_number}` : "";

  switch (type) {
    // === GUEST ORDER EMAILS ===
    case "order_confirmation":
      return {
        subject: `Commande confirmee - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Commande confirmee !</h1>
            <p>Bonjour ${data.prenom} ${data.nom},</p>
            <p>Nous avons bien recu votre commande pour la carte grise du vehicule <strong>${data.immatriculation}</strong>.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Numero de suivi :</strong> ${data.tracking_number}</p>
              <p style="margin: 8px 0;"><strong>Montant TTC :</strong> ${data.montant_ttc} EUR</p>
            </div>

            <p>Suivez votre commande en cliquant sur le bouton ci-dessous :</p>
            <a href="${trackingUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Suivre ma commande
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "payment_confirmed":
      return {
        subject: `Paiement confirme - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Paiement confirme !</h1>
            <p>Bonjour ${data.prenom} ${data.nom},</p>
            <p>Votre paiement de <strong>${data.montant_ttc} EUR</strong> a ete confirme.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Numero de suivi :</strong> ${data.tracking_number}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
              <p style="margin: 8px 0;"><strong>Montant :</strong> ${data.montant_ttc} EUR</p>
            </div>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Votre facture est jointe a cet email</strong></p>
            </div>

            <p>Nous allons maintenant traiter votre dossier. Vous recevrez un email des qu'il y aura du nouveau.</p>

            <a href="${trackingUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Suivre ma commande
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "document_rejected":
      return {
        subject: `Documents a fournir - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">Documents a corriger</h1>
            <p>Bonjour ${data.prenom} ${data.nom},</p>
            <p>Certains documents necessitent votre attention pour la commande <strong>${data.tracking_number}</strong>.</p>

            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #991b1b;">Documents concernes :</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${data.rejectedDocuments?.map((doc: any) => `
                  <li style="margin: 8px 0;">
                    <strong>${doc.nom}:</strong> ${doc.raison}
                  </li>
                `).join('') || '<li>Voir le detail sur votre espace de suivi</li>'}
              </ul>
            </div>

            <p>Veuillez telecharger les documents corriges via votre espace de suivi :</p>

            <a href="${trackingUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder a mon suivi
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "completed":
      return {
        subject: `Votre carte grise est prete ! - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Votre carte grise est prete !</h1>
            <p>Bonjour ${data.prenom} ${data.nom},</p>
            <p>Excellente nouvelle ! Votre carte grise pour le vehicule <strong>${data.immatriculation}</strong> est maintenant disponible.</p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Numero de suivi :</strong> ${data.tracking_number}</p>
              <p style="margin: 8px 0;">Vous pouvez telecharger votre carte grise depuis votre espace de suivi.</p>
            </div>

            <a href="${trackingUrl}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Telecharger ma carte grise
            </a>

            <p style="margin-top: 20px;">Merci de votre confiance !</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "resubmission_payment_required":
      return {
        subject: `Paiement requis pour renvoyer vos documents - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b;">Paiement requis</h1>
            <p>Bonjour ${data.prenom} ${data.nom},</p>
            <p>Suite a des documents illisibles ou non recevables, un paiement de <strong>${data.amount} EUR</strong> est requis pour pouvoir renvoyer vos documents.</p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Numero de suivi :</strong> ${data.tracking_number}</p>
              <p style="margin: 8px 0;"><strong>Montant a payer :</strong> ${data.amount} EUR</p>
              ${data.reason ? `<p style="margin: 8px 0;"><strong>Motif :</strong> ${data.reason}</p>` : ''}
            </div>

            <p>Une fois le paiement effectue, vous pourrez renvoyer vos documents corriges.</p>

            <a href="${trackingUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Payer et renvoyer mes documents
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "demarche_resubmission_payment_required":
      return {
        subject: `Paiement requis pour renvoyer les documents - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b;">Paiement requis</h1>
            <p>Bonjour ${data.nom},</p>
            <p>Suite a des documents illisibles ou non recevables pour la demarche <strong>${data.immatriculation}</strong>, un paiement de <strong>${data.amount} EUR</strong> est requis pour pouvoir renvoyer les documents.</p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>N Demarche :</strong> ${data.tracking_number}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
              <p style="margin: 8px 0;"><strong>Montant a payer :</strong> ${data.amount} EUR</p>
              ${data.reason ? `<p style="margin: 8px 0;"><strong>Motif :</strong> ${data.reason}</p>` : ''}
            </div>

            <p>Une fois le paiement effectue, vous pourrez renvoyer vos documents corriges depuis votre espace garage.</p>

            <a href="${baseUrl}/demarche/${data.demarche_id}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder a ma demarche
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    // === GARAGE/DEMARCHE EMAILS ===
    case "demarche_payment_confirmed":
      return {
        subject: `Paiement recu - Demarche ${data.demarcheId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Paiement confirme</h1>
            <p>Bonjour ${data.customerName},</p>
            <p>Le paiement pour la demarche <strong>${data.demarcheId}</strong> a ete confirme.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Demarche :</strong> ${data.demarcheId}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
              <p style="margin: 8px 0;"><strong>Montant TTC :</strong> ${data.montantTTC} EUR</p>
            </div>

            <p>Le traitement de votre demarche va commencer.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "account_verified":
      return {
        subject: `Compte verifie - Bienvenue !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Compte verifie !</h1>
            <p>Bonjour ${data.customerName},</p>
            <p>Felicitations ! Votre compte a ete verifie et active avec succes.</p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;">Vous pouvez maintenant acceder a toutes les fonctionnalites de la plateforme.</p>
            </div>

            <a href="${baseUrl}/dashboard" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder au tableau de bord
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "account_rejected":
      return {
        subject: `Demande de verification refusee`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #ef4444;">Demande refusee</h1>
            <p>Bonjour ${data.customerName},</p>
            <p>Malheureusement, votre demande de verification de compte n'a pas pu etre approuvee.</p>

            ${data.rejectionReason ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
                <strong>Raison :</strong> ${data.rejectionReason}
              </div>
            ` : ''}

            <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "admin_document":
      return {
        subject: `Document disponible - ${data.tracking_number}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Nouveau document disponible</h1>
            <p>Bonjour ${data.prenom} ${data.nom},</p>
            <p>Un nouveau document est disponible pour votre commande <strong>${data.tracking_number}</strong>.</p>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>${data.document_name}</strong></p>
              ${data.description ? `<p style="margin: 8px 0; color: #6b7280;">${data.description}</p>` : ''}
            </div>

            <p>Vous pouvez consulter et telecharger ce document sur votre page de suivi :</p>

            <a href="${trackingUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder a mon suivi
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "admin_new_demarche":
      return {
        subject: `[ADMIN] Nouvelle demande a traiter - ${data.reference}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Nouvelle demande a traiter</h1>
            <p>Une nouvelle demande est disponible et necessite votre attention.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Type :</strong> ${data.type}</p>
              <p style="margin: 8px 0;"><strong>Reference :</strong> ${data.reference}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
              <p style="margin: 8px 0;"><strong>Client :</strong> ${data.client_name}</p>
              <p style="margin: 8px 0;"><strong>Montant TTC :</strong> ${data.montant_ttc} EUR</p>
              ${data.is_free_token ? '<p style="margin: 8px 0; color: #22c55e;"><strong>Demarche offerte (jeton gratuit)</strong></p>' : ''}
            </div>

            <a href="https://discountcartegrise.fr/dashboard/demarches" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder au tableau admin
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement.</p>
          </div>
        `,
      };

    case "garage_demarche_confirmation":
      return {
        subject: `Demarche soumise - ${data.reference}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Demarche soumise avec succes !</h1>
            <p>Bonjour ${data.garage_name},</p>
            <p>Votre demarche a bien ete enregistree et sera traitee dans les plus brefs delais.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Type :</strong> ${data.type}</p>
              <p style="margin: 8px 0;"><strong>Reference :</strong> ${data.reference}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
              <p style="margin: 8px 0;"><strong>Montant TTC :</strong> ${data.montant_ttc} EUR</p>
              ${data.is_free_token ? '<p style="margin: 8px 0; color: #22c55e;"><strong>Demarche offerte (jeton gratuit utilise)</strong></p>' : ''}
            </div>

            <p>Vous pouvez suivre l'avancement de votre demarche depuis votre espace garage.</p>

            <a href="https://discountcartegrise.fr/mes-demarches" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Voir mes demarches
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    // === GARAGE NOTIFICATION EMAILS ===
    case "garage_document_received":
      return {
        subject: `Nouveau document disponible - ${data.reference}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Nouveau document disponible</h1>
            <p>Bonjour ${data.garage_name},</p>
            <p>Un nouveau document est disponible pour votre demarche <strong>${data.reference}</strong> (${data.immatriculation}).</p>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>${data.document_name}</strong></p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
            </div>

            <p>Vous pouvez consulter et telecharger ce document depuis votre espace garage :</p>

            <a href="${baseUrl}/demarche/${data.demarche_id}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder a ma demarche
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "garage_demarche_completed":
      return {
        subject: `Votre demarche est terminee ! - ${data.reference}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Votre demarche est terminee !</h1>
            <p>Bonjour ${data.garage_name},</p>
            <p>Excellente nouvelle ! Votre demarche <strong>${data.reference}</strong> pour le vehicule <strong>${data.immatriculation}</strong> a ete traitee avec succes.</p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Type :</strong> ${data.type}</p>
              <p style="margin: 8px 0;"><strong>Reference :</strong> ${data.reference}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
            </div>

            <p>Les documents finaux sont disponibles dans votre espace garage. Vous pouvez les telecharger des maintenant.</p>

            <a href="${baseUrl}/demarche/${data.demarche_id}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Telecharger mes documents
            </a>

            <p style="margin-top: 20px;">Merci de votre confiance !</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    // === RECHARGE & BALANCE PAYMENT EMAILS ===
    case "recharge_confirmed":
      return {
        subject: `Recharge confirmee - ${data.amount}EUR ajoutes a votre solde`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Recharge confirmee !</h1>
            <p>Bonjour ${data.garage_name},</p>
            <p>Votre recharge de solde a ete effectuee avec succes.</p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Montant recharge :</strong> ${data.amount} EUR</p>
              <p style="margin: 8px 0;"><strong>Montant paye :</strong> ${data.price} EUR</p>
              <p style="margin: 8px 0;"><strong>Nouveau solde :</strong> ${data.new_balance} EUR</p>
            </div>

            <p>Vous pouvez utiliser ce solde pour payer vos prochaines demarches.</p>

            <a href="https://discountcartegrise.fr/dashboard" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Acceder au tableau de bord
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "balance_payment_confirmed":
      return {
        subject: `Paiement par solde confirme - ${data.demarche_id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #22c55e;">Paiement valide !</h1>
            <p>Bonjour ${data.garage_name},</p>
            <p>Votre demarche a ete payee avec succes en utilisant votre solde.</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Type :</strong> ${data.type}</p>
              <p style="margin: 8px 0;"><strong>Reference :</strong> ${data.demarche_id}</p>
              <p style="margin: 8px 0;"><strong>Immatriculation :</strong> ${data.immatriculation}</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Montant debite :</strong> ${data.amount} EUR</p>
              <p style="margin: 8px 0;"><strong>Solde restant :</strong> ${data.new_balance} EUR</p>
            </div>

            <p>Le traitement de votre demarche va commencer.</p>

            <a href="https://discountcartegrise.fr/mes-demarches" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Voir mes demarches
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
          </div>
        `,
      };

    case "admin_balance_recharge":
      return {
        subject: `[ADMIN] Nouvelle recharge de solde - ${data.garage_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Nouvelle recharge de solde</h1>
            <p>Un garage vient de recharger son compte.</p>

            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Garage :</strong> ${data.garage_name}</p>
              <p style="margin: 8px 0;"><strong>Email :</strong> ${data.garage_email}</p>
            </div>

            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Montant paye :</strong> ${data.price} EUR</p>
              <p style="margin: 8px 0;"><strong>Credit ajoute :</strong> ${data.amount} EUR</p>
              <p style="margin: 8px 0;"><strong>Nouveau solde :</strong> ${data.new_balance} EUR</p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Notification automatique - DiscountCarteGrise</p>
          </div>
        `,
      };

    case "admin_verification_request":
      return {
        subject: `[ADMIN] Nouveau garage a verifier - ${data.garage_name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #f59e0b;">Nouvelle demande de verification</h1>
            <p>Un garage vient de soumettre ses documents de verification.</p>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
              <p style="margin: 8px 0;"><strong>Garage :</strong> ${data.garage_name}</p>
              <p style="margin: 8px 0;"><strong>Email :</strong> ${data.garage_email}</p>
            </div>

            <p>Veuillez verifier les documents soumis dans l'interface d'administration.</p>

            <a href="https://discountcartegrise.fr/dashboard/manage-garages" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Verifier le garage
            </a>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Notification automatique - DiscountCarteGrise</p>
          </div>
        `,
      };

    case "custom_notification":
      return {
        subject: data.subject || `Notification - DiscountCarteGrise`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #3b82f6;">Notification</h1>
            <p>Bonjour ${escapeHtml(data.customerName || 'Client')},</p>

            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; white-space: pre-wrap;">
              ${escapeHtml(data.message)}
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">L'equipe DiscountCarteGrise</p>
            <p style="color: #6b7280; font-size: 12px;">contact@discountcartegrise.fr</p>
          </div>
        `,
      };

    case "promotion_free_token":
      return {
        subject: `Offre speciale - Jeton OFFERT pour votre premiere demarche !`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">JETON OFFERT !</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-top: 10px;">Votre premiere demarche DA ou DC est gratuite</p>
            </div>

            <p>Bonjour${data.prenom ? ` ${data.prenom}` : ''},</p>

            <p>Nous avons le plaisir de vous offrir <strong>un jeton gratuit</strong> pour realiser votre premiere demarche !</p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin-top: 0; color: #166534;">Ce que vous obtenez :</h3>
              <ul style="margin: 0; padding-left: 20px; color: #15803d;">
                <li style="margin: 8px 0;"><strong>1 jeton offert</strong> a l'inscription</li>
                <li style="margin: 8px 0;">Utilisable pour une <strong>DA</strong> (Declaration d'Achat) ou <strong>DC</strong> (Declaration de Cession)</li>
                <li style="margin: 8px 0;">Traitement rapide sous 24h</li>
                <li style="margin: 8px 0;">Support dedie par email</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://discountcartegrise.fr/register" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 18px; font-weight: bold;">
                Creer mon compte et profiter de l'offre
              </a>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #92400e;">
                <strong>Bon a savoir :</strong> Apres votre premiere demarche gratuite, profitez de nos tarifs avantageux et rechargez votre solde avec des bonus allant jusqu'a +25% !
              </p>
            </div>

            <p>N'hesitez pas a nous contacter si vous avez des questions.</p>

            <p style="margin-top: 20px;">A tres bientot,<br><strong>L'equipe DiscountCarteGrise</strong></p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              DiscountCarteGrise - Service de cartes grises en ligne<br>
              contact@discountcartegrise.fr
            </p>
          </div>
        `,
      };

    case "simple_text":
      return {
        subject: data.subject || "Message",
        html: data.html || `<div style="font-family: Arial, sans-serif;">${escapeHtml(data.message || '')}</div>`,
      };

    default:
      throw new Error(`Type d'email non supporte: ${type}`);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate authentication
  const isAuthorized = await validateAuth(req);
  if (!isAuthorized) {
    console.error("Unauthorized: Invalid or missing authentication");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { type, to, data, attachments, from: customFrom }: EmailRequest & { from?: string } = await req.json();

    console.log(`Sending email type=${type} to=${to}`);

    const { subject, html } = getEmailTemplate(type, data);

    const fromAddress = customFrom || "DiscountCarteGrise <noreply@discountcartegrise.fr>";
    const replyTo = customFrom ? undefined : "contact@discountcartegrise.fr";

    const result = await sendEmail({
      from: fromAddress,
      replyTo,
      to,
      subject,
      html,
      attachments,
    });

    // Always log to email_log table regardless of success/failure
    await saveToEmailLog(supabase, {
      to,
      subject,
      type,
      status: result.success ? (result.provider === "log_only" ? "logged" : "sent") : "failed",
      errorMessage: result.error,
    });

    if (!result.success) {
      console.error(`Email sending failed via ${result.provider}:`, result.error);
      // Return success anyway so the caller flow is not blocked
      return new Response(
        JSON.stringify({ success: true, warning: "Email sending failed but operation continues", provider: result.provider, error: result.error }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Email sent successfully via ${result.provider}`);

    return new Response(JSON.stringify({ success: true, provider: result.provider, data: result.data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-email:", error);

    // Never crash the flow - return success with warning
    return new Response(
      JSON.stringify({ success: true, warning: "Email function errored but operation continues", error: error.message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
