-- Fix guest_orders check_status constraint to include all statuses used in the codebase
ALTER TABLE public.guest_orders DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE public.guest_orders ADD CONSTRAINT check_status CHECK (
  status IN (
    'en_attente',
    'paye',
    'en_traitement',
    'en_cours',
    'documents_valides',
    'documents_refuses',
    'document_refuse',
    'soumis_ants',
    'cpi_disponible',
    'valide',
    'finalise',
    'termine',
    'terminee',
    'annule',
    'annulee',
    'refuse',
    'attente_paiement',
    'attente_paiement_client',
    'expedition',
    'livree',
    'payee'
  )
);
