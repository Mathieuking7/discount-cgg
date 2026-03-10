-- 1. Create payment_links table
CREATE TABLE IF NOT EXISTS payment_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL,
  description text,
  recipient_email text,
  recipient_name text,
  expires_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paid', 'expired', 'cancelled')),
  short_code text UNIQUE NOT NULL,
  order_id uuid REFERENCES guest_orders(id),
  demarche_type text,
  created_by uuid REFERENCES auth.users(id),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create branding_config table
CREATE TABLE IF NOT EXISTS branding_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT 'SIVFlow',
  logo_url text,
  primary_color text DEFAULT '#1B2A4A',
  secondary_color text DEFAULT '#D4A853',
  accent_color text DEFAULT '#002395',
  contact_email text,
  contact_phone text,
  address text,
  siret text,
  footer_text text DEFAULT 'Service agree et conforme ANTS',
  updated_at timestamptz DEFAULT now()
);
-- Insert singleton row
INSERT INTO branding_config (company_name) VALUES ('SIVFlow') ON CONFLICT DO NOTHING;

-- 3. Create email_log table
CREATE TABLE IF NOT EXISTS email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text,
  template_type text,
  status text DEFAULT 'sent',
  payment_link_id uuid REFERENCES payment_links(id),
  order_id uuid REFERENCES guest_orders(id),
  error_message text,
  sent_at timestamptz DEFAULT now()
);

-- 4. Add columns to guest_orders
ALTER TABLE guest_orders ADD COLUMN IF NOT EXISTS payment_link_id uuid REFERENCES payment_links(id);
ALTER TABLE guest_orders ADD COLUMN IF NOT EXISTS notes_admin text;
ALTER TABLE guest_orders ADD COLUMN IF NOT EXISTS documents_validated boolean DEFAULT false;

-- 5. Add columns to guest_demarche_types
ALTER TABLE guest_demarche_types ADD COLUMN IF NOT EXISTS prix_pro numeric DEFAULT 0;
ALTER TABLE guest_demarche_types ADD COLUMN IF NOT EXISTS actif_pro boolean DEFAULT true;
ALTER TABLE guest_demarche_types ADD COLUMN IF NOT EXISTS categorie text DEFAULT 'autre';

-- 6. Fix FIV and annuler-cpi-ww prices
UPDATE guest_demarche_types SET prix_base = 14.90 WHERE code = 'FIV';
UPDATE guest_demarche_types SET prix_base = 19.90 WHERE code = 'ANNULER_CPI_WW';

-- 7. Enable RLS on new tables and add admin policies
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE branding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access payment_links" ON payment_links FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access branding_config" ON branding_config FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin full access email_log" ON email_log FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
