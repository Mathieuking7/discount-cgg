-- Extend guest_orders status constraint to support full order lifecycle
ALTER TABLE public.guest_orders DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE public.guest_orders ADD CONSTRAINT check_status CHECK (
  status IN (
    'en_attente',
    'paye',
    'en_traitement',
    'documents_valides',
    'document_refuse',
    'soumis_ants',
    'cpi_disponible',
    'valide',
    'finalise',
    'termine',
    'annule',
    'refuse'
  )
);
