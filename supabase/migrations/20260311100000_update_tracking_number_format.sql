-- Update tracking number format from TRK-XXXXXXXX to SIV-XXXXXX
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  new_tracking TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
  random_part TEXT := '';
BEGIN
  FOR i IN 1..6 LOOP
    random_part := random_part || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;

  new_tracking := 'SIV-' || random_part;

  WHILE EXISTS (SELECT 1 FROM public.guest_orders WHERE tracking_number = new_tracking) LOOP
    random_part := '';
    FOR i IN 1..6 LOOP
      random_part := random_part || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    new_tracking := 'SIV-' || random_part;
  END LOOP;

  RETURN new_tracking;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
