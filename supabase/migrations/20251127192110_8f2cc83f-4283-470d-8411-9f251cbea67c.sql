-- Update generate_tracking_number function to use random alphanumeric codes for security
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TEXT AS $$
DECLARE
  new_tracking TEXT;
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluding confusing chars: 0,O,1,I
  i INTEGER;
  random_part TEXT := '';
BEGIN
  -- Generate a random 8-character alphanumeric code
  FOR i IN 1..8 LOOP
    random_part := random_part || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
  END LOOP;
  
  new_tracking := 'TRK-' || random_part;
  
  -- Check for collision (extremely unlikely but safe)
  WHILE EXISTS (SELECT 1 FROM guest_orders WHERE tracking_number = new_tracking) LOOP
    random_part := '';
    FOR i IN 1..8 LOOP
      random_part := random_part || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    new_tracking := 'TRK-' || random_part;
  END LOOP;
  
  RETURN new_tracking;
END;
$$ LANGUAGE plpgsql;