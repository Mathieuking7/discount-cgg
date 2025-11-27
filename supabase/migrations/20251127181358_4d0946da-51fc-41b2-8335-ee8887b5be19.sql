-- Add new columns to guest_orders for optional services and personal information
ALTER TABLE public.guest_orders 
ADD COLUMN IF NOT EXISTS dossier_prioritaire boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS certificat_non_gage boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_cotitulaire boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cotitulaire_nom text,
ADD COLUMN IF NOT EXISTS cotitulaire_prenom text,
ADD COLUMN IF NOT EXISTS vehicule_pro boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS vehicule_leasing boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_mineur boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_heberge boolean DEFAULT false;