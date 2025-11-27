-- Add resubmission payment fields to demarches table
ALTER TABLE public.demarches 
ADD COLUMN IF NOT EXISTS requires_resubmission_payment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS resubmission_payment_amount numeric DEFAULT 10,
ADD COLUMN IF NOT EXISTS resubmission_paid boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS resubmission_payment_intent_id text;