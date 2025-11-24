-- Modifier la table factures pour supporter les commandes invités
-- Rendre les champs demarche_id et garage_id optionnels
ALTER TABLE factures ALTER COLUMN demarche_id DROP NOT NULL;
ALTER TABLE factures ALTER COLUMN garage_id DROP NOT NULL;

-- Ajouter une colonne pour lier aux guest orders
ALTER TABLE factures ADD COLUMN guest_order_id UUID REFERENCES guest_orders(id);

-- Créer un index pour les recherches par guest_order_id
CREATE INDEX IF NOT EXISTS idx_factures_guest_order_id ON factures(guest_order_id);

-- Ajouter une contrainte pour s'assurer qu'une facture est liée soit à une démarche soit à une guest order
ALTER TABLE factures ADD CONSTRAINT factures_type_check 
CHECK (
  (demarche_id IS NOT NULL AND guest_order_id IS NULL) OR 
  (demarche_id IS NULL AND guest_order_id IS NOT NULL)
);