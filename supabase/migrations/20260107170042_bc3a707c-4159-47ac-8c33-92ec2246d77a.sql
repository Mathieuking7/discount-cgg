-- Ajouter la colonne token_purchase_id à la table factures
ALTER TABLE public.factures 
ADD COLUMN IF NOT EXISTS token_purchase_id uuid REFERENCES public.token_purchases(id);

-- Créer un index pour les requêtes
CREATE INDEX IF NOT EXISTS idx_factures_token_purchase_id ON public.factures(token_purchase_id);