ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'attente_paiement_client';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'en_cours';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'terminee';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'annulee';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'expedition';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'livree';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'documents_valides';
ALTER TYPE demarche_status ADD VALUE IF NOT EXISTS 'document_refuse';
