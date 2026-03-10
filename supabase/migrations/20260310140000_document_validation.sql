-- Add admin workflow columns to guest_orders
-- notes_admin: internal admin notes on the dossier
-- status_history: JSON activity log of all actions taken

ALTER TABLE guest_orders
  ADD COLUMN IF NOT EXISTS notes_admin text,
  ADD COLUMN IF NOT EXISTS status_history jsonb DEFAULT '[]'::jsonb;

-- Ensure guest_order_documents has validation columns (idempotent)
ALTER TABLE guest_order_documents
  ADD COLUMN IF NOT EXISTS validation_status text DEFAULT 'en_attente',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS validated_at timestamptz;
