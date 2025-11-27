-- Create table for admin documents sent to clients
CREATE TABLE public.guest_order_admin_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.guest_orders(id) ON DELETE CASCADE,
  nom_fichier TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  taille_octets INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_by UUID,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.guest_order_admin_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage admin documents"
ON public.guest_order_admin_documents
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view admin documents"
ON public.guest_order_admin_documents
FOR SELECT
USING (true);

-- Add admin_document email template
INSERT INTO public.email_templates (type, subject, html_content, description)
VALUES (
  'admin_document',
  'Document disponible - Commande {{tracking_number}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .document-box { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0; }
    .btn { display: inline-block; background: #1a365d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Document disponible</h1>
    </div>
    <div class="content">
      <p>Bonjour {{prenom}} {{nom}},</p>
      <p>Un nouveau document est disponible pour votre commande <strong>{{tracking_number}}</strong>.</p>
      <div class="document-box">
        <strong>📄 {{document_name}}</strong>
        {{#if description}}
        <p style="color: #6b7280; margin-top: 8px;">{{description}}</p>
        {{/if}}
      </div>
      <p>Vous pouvez consulter ce document sur votre page de suivi :</p>
      <a href="{{tracking_url}}" class="btn">Voir ma commande</a>
    </div>
    <div class="footer">
      <p>Discount Carte Grise - Service de carte grise en ligne</p>
    </div>
  </div>
</body>
</html>',
  'Email envoyé aux particuliers quand l''admin leur envoie un document'
);