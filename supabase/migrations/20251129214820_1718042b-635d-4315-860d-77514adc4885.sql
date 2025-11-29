-- Corriger le trigger pour éviter les doublons de rôles
CREATE OR REPLACE FUNCTION public.handle_new_garage_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only create garage if the user metadata contains garage data
  IF NEW.raw_user_meta_data->>'raison_sociale' IS NOT NULL THEN
    -- Insert garage only if it doesn't exist for this user
    INSERT INTO public.garages (
      user_id,
      raison_sociale,
      siret,
      adresse,
      code_postal,
      ville,
      email,
      telephone
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'raison_sociale',
      NEW.raw_user_meta_data->>'siret',
      NEW.raw_user_meta_data->>'adresse',
      NEW.raw_user_meta_data->>'code_postal',
      NEW.raw_user_meta_data->>'ville',
      NEW.raw_user_meta_data->>'email',
      NEW.raw_user_meta_data->>'telephone'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Assign garage role only if not already assigned
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'garage')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;