import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// =============================================================================
// AUTH EMAIL - Multi-provider: RESEND_API_KEY -> BREVO_API_KEY -> log only
// This is called by Supabase Auth hooks for signup/recovery/invite emails.
// IMPORTANT: Auth emails are critical - if sending fails, we still return 200
// so the auth flow is not blocked, but we log the error.
// =============================================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
  console.warn(`=== AUTH EMAIL NOT SENT (no provider) === To: ${toEmail} | Subject: ${params.subject}`);
  return { success: true, provider: "log_only", data: { message: "Logged only" } };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseUrl = "https://discountcartegrise.fr";

  switch (type) {
    case "signup":
    case "email_change":
      return {
        subject: "Confirmez votre adresse email - DiscountCarteGrise",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">DiscountCarteGrise</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Confirmez votre adresse email</h2>
              <p>Bonjour,</p>
              <p>Merci de votre inscription sur DiscountCarteGrise. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.confirmation_url}" style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Confirmer mon email</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${data.confirmation_url}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">Si vous n'avez pas cree de compte sur DiscountCarteGrise, vous pouvez ignorer cet email.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>${new Date().getFullYear()} DiscountCarteGrise - Tous droits reserves</p>
              <p><a href="${baseUrl}" style="color: #2563eb;">discountcartegrise.fr</a></p>
            </div>
          </body>
          </html>
        `
      };

    case "recovery":
    case "magiclink":
      return {
        subject: "Reinitialisez votre mot de passe - DiscountCarteGrise",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">DiscountCarteGrise</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Reinitialisez votre mot de passe</h2>
              <p>Bonjour,</p>
              <p>Vous avez demande la reinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour creer un nouveau mot de passe :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.confirmation_url}" style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reinitialiser mon mot de passe</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${data.confirmation_url}</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 0;">Si vous n'avez pas demande cette reinitialisation, vous pouvez ignorer cet email.</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>${new Date().getFullYear()} DiscountCarteGrise - Tous droits reserves</p>
              <p><a href="${baseUrl}" style="color: #2563eb;">discountcartegrise.fr</a></p>
            </div>
          </body>
          </html>
        `
      };

    case "invite":
      return {
        subject: "Vous etes invite sur DiscountCarteGrise",
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">DiscountCarteGrise</h1>
            </div>
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Vous etes invite !</h2>
              <p>Bonjour,</p>
              <p>Vous avez ete invite a rejoindre DiscountCarteGrise. Cliquez sur le bouton ci-dessous pour accepter l'invitation et creer votre compte :</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.confirmation_url}" style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Accepter l'invitation</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
              <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${data.confirmation_url}</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>${new Date().getFullYear()} DiscountCarteGrise - Tous droits reserves</p>
              <p><a href="${baseUrl}" style="color: #2563eb;">discountcartegrise.fr</a></p>
            </div>
          </body>
          </html>
        `
      };

    default:
      return {
        subject: "Notification - DiscountCarteGrise",
        html: `
          <!DOCTYPE html>
          <html><head><meta charset="utf-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px;">
            <p>Vous avez recu une notification de DiscountCarteGrise.</p>
            <p><a href="${data.confirmation_url}">Cliquez ici</a></p>
          </body>
          </html>
        `
      };
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log("Received auth email request:", JSON.stringify(payload, null, 2));

    const { user, email_data } = payload;

    if (!user?.email || !email_data) {
      throw new Error("Missing user email or email_data");
    }

    const emailType = email_data.email_action_type || "signup";
    const confirmationUrl = email_data.confirmation_url ||
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${emailType}&redirect_to=${email_data.redirect_to || 'https://discountcartegrise.fr'}`;

    const template = getEmailTemplate(emailType, {
      ...email_data,
      confirmation_url: confirmationUrl
    });

    const result = await doSendEmail({
      from: "DiscountCarteGrise <noreply@discountcartegrise.fr>",
      to: [user.email],
      subject: template.subject,
      html: template.html,
    });

    if (!result.success) {
      console.error(`Auth email failed via ${result.provider}:`, result.error);
    } else {
      console.log(`Auth email sent to ${user.email} via ${result.provider}`);
    }

    // Always return success so auth flow is not blocked
    return new Response(JSON.stringify({ success: true, provider: result.provider }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email:", error);
    // Return success to not block auth flow
    return new Response(
      JSON.stringify({ success: true, warning: "Auth email failed but auth flow continues", error: error.message }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
