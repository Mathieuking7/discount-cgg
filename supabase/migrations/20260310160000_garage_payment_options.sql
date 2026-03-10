-- Add payment option columns to demarches
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS payment_option text CHECK (payment_option IN ('garage_dossier', 'garage_tout', 'client_tout'));
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS garage_paid_amount numeric DEFAULT 0;
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_paid_amount numeric DEFAULT 0;
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_payment_status text CHECK (client_payment_status IN ('not_required', 'pending', 'paid')) DEFAULT 'not_required';
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_payment_link_id uuid DEFAULT gen_random_uuid();
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_email text;
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_nom text;
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_telephone text;
ALTER TABLE demarches ADD COLUMN IF NOT EXISTS client_paid_at timestamptz;

-- Unique index on payment link ID
CREATE UNIQUE INDEX IF NOT EXISTS idx_demarches_client_payment_link ON demarches(client_payment_link_id) WHERE client_payment_link_id IS NOT NULL;

-- Token transaction audit table
CREATE TABLE IF NOT EXISTS demarche_token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demarche_id uuid NOT NULL REFERENCES demarches(id),
  garage_id uuid NOT NULL REFERENCES garages(id),
  amount numeric NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('frais_dossier', 'carte_grise', 'frais_dossier_et_carte_grise', 'remboursement')),
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE demarche_token_transactions ENABLE ROW LEVEL SECURITY;

-- Garage can see their own transactions
CREATE POLICY "Garages can view own transactions"
ON demarche_token_transactions FOR SELECT TO authenticated
USING (garage_id IN (SELECT id FROM garages WHERE user_id = auth.uid()));

-- Admin can see all
CREATE POLICY "Admins can view all transactions"
ON demarche_token_transactions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anon SELECT on demarches via client_payment_link_id (for the client page)
CREATE POLICY "Anon can view demarche by payment link"
ON demarches FOR SELECT TO anon
USING (client_payment_link_id IS NOT NULL AND client_payment_status IN ('pending', 'paid'));

-- Allow anon UPDATE on demarches for client completing their part
CREATE POLICY "Anon can update demarche via payment link"
ON demarches FOR UPDATE TO anon
USING (client_payment_status = 'pending')
WITH CHECK (true);

-- Add extended statuses for guest_orders too
ALTER TABLE guest_orders ADD COLUMN IF NOT EXISTS extended_status text DEFAULT 'en_attente';
