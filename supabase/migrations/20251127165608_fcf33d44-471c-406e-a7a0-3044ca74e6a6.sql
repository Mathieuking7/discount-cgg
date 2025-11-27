-- Ajouter la colonne prix_carte_grise pour stocker la taxe régionale séparément
ALTER TABLE public.demarches ADD COLUMN IF NOT EXISTS prix_carte_grise DECIMAL(10,2) DEFAULT 0;