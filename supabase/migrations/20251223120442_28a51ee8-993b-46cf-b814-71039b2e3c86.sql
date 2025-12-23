-- Add PRO demarche types used in the UI
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'demarche_type'
      AND e.enumlabel = 'WW_PROVISOIRE_PRO'
  ) THEN
    ALTER TYPE public.demarche_type ADD VALUE 'WW_PROVISOIRE_PRO';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'demarche_type'
      AND e.enumlabel = 'W_GARAGE_PRO'
  ) THEN
    ALTER TYPE public.demarche_type ADD VALUE 'W_GARAGE_PRO';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'demarche_type'
      AND e.enumlabel = 'QUITUS_FISCAL_PRO'
  ) THEN
    ALTER TYPE public.demarche_type ADD VALUE 'QUITUS_FISCAL_PRO';
  END IF;
END $$;