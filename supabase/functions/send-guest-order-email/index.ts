import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-key',
};

const INTERNAL_API_KEY = Deno.env.get("INTERNAL_API_KEY");

// Validate either internal API key OR admin JWT
const validateAuth = async (req: Request): Promise<boolean> => {
  const providedKey = req.headers.get("x-internal-key");
  if (providedKey === INTERNAL_API_KEY) {
    return true;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
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
  console.log('Fetching email template for type:', type);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Fetch template from database
  const { data: template, error } = await supabase
    .from('email_templates')
    .select('subject, html_content')
    .eq('type', type)
    .single();

  if (error || !template) {
    console.error('Error fetching template:', error);
    throw new Error(`Template not found for type: ${type}`);
  }

  const baseUrl = "https://discountcg.fr";
  const trackingUrl = `${baseUrl}/suivi/${orderData.tracking_number}`;

  // Replace variables in subject and content
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
    console.error("Unauthorized: Invalid or missing authentication");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { type, orderData }: EmailRequest = await req.json();

    console.log('Sending email:', { type, tracking: orderData.tracking_number });

    const { subject, html } = await getEmailContent(type, orderData);

    const { data, error } = await resend.emails.send({
      from: 'DiscountCarteGrise <noreply@discountcartegrise.fr>',
      to: orderData.email,
      subject,
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
