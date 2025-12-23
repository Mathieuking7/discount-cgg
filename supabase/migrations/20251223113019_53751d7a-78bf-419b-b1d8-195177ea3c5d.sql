-- Ajouter colonne test_only aux actions rapides
ALTER TABLE public.actions_rapides 
ADD COLUMN test_only BOOLEAN NOT NULL DEFAULT false;