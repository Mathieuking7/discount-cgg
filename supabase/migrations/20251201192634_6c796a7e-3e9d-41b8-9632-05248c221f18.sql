-- Add unlimited free tokens column to garages table
ALTER TABLE public.garages 
ADD COLUMN unlimited_free_tokens boolean DEFAULT false;

-- Set unlimited free tokens for contact@autotransfert.fr
UPDATE public.garages 
SET unlimited_free_tokens = true 
WHERE email = 'contact@autotransfert.fr';