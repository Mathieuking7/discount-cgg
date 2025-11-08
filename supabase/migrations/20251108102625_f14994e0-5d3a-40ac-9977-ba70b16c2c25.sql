-- Add missing columns to vehicules table
ALTER TABLE public.vehicules
ADD COLUMN IF NOT EXISTS numero_formule TEXT,
ADD COLUMN IF NOT EXISTS carrosserie TEXT,
ADD COLUMN IF NOT EXISTS co2 NUMERIC,
ADD COLUMN IF NOT EXISTS couleur TEXT,
ADD COLUMN IF NOT EXISTS cylindree NUMERIC,
ADD COLUMN IF NOT EXISTS date_cg DATE,
ADD COLUMN IF NOT EXISTS date_mec DATE,
ADD COLUMN IF NOT EXISTS energie TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT,
ADD COLUMN IF NOT EXISTS puiss_ch NUMERIC,
ADD COLUMN IF NOT EXISTS puiss_fisc NUMERIC,
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS version TEXT,
ADD COLUMN IF NOT EXISTS ptr NUMERIC;

-- Update RLS policies to allow garages to update their vehicles
CREATE POLICY "Garages can update their own vehicules"
ON public.vehicules
FOR UPDATE
USING (garage_id IN (
  SELECT id FROM garages WHERE user_id = auth.uid()
));

-- Update RLS policies to allow garages to delete their vehicles
CREATE POLICY "Garages can delete their own vehicules"
ON public.vehicules
FOR DELETE
USING (garage_id IN (
  SELECT id FROM garages WHERE user_id = auth.uid()
));