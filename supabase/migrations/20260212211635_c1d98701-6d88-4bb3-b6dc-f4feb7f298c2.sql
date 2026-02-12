
-- Add new demarche type to enum
ALTER TYPE public.demarche_type ADD VALUE IF NOT EXISTS 'ANNULER_CORRIGER_DC_DA_PRO';

-- Insert action rapide
INSERT INTO public.actions_rapides (code, titre, description, prix, ordre, actif, require_immatriculation, couleur)
VALUES ('ANNULER_CORRIGER_DC_DA_PRO', 'Annuler ou corriger une DC ou DA', 'Annulation ou correction d''une déclaration de cession ou d''achat', 29.90, 130, true, true, 'primary');

DO $$
DECLARE
  action_uuid uuid;
  q1_uuid uuid;
  opt_annuler uuid;
  opt_corriger uuid;
BEGIN
  SELECT id INTO action_uuid FROM public.actions_rapides WHERE code = 'ANNULER_CORRIGER_DC_DA_PRO';

  -- Question: Annuler ou Corriger ?
  INSERT INTO public.action_questions (action_id, question_text, ordre, is_blocking, blocking_message)
  VALUES (action_uuid, 'Souhaitez-vous annuler ou corriger la déclaration ?', 1, false, null)
  RETURNING id INTO q1_uuid;

  INSERT INTO public.action_question_options (question_id, option_text, ordre, is_blocking, blocking_message)
  VALUES (q1_uuid, 'Annuler la déclaration', 1, false, null)
  RETURNING id INTO opt_annuler;

  INSERT INTO public.action_question_options (question_id, option_text, ordre, is_blocking, blocking_message)
  VALUES (q1_uuid, 'Corriger la déclaration', 2, false, null)
  RETURNING id INTO opt_corriger;

  -- Base documents (communs)
  INSERT INTO public.action_documents (action_id, nom_document, ordre, obligatoire) VALUES
    (action_uuid, 'Justificatif d''identité et permis de conduire des deux parties – acheteur et vendeur (Kbis + ID gérant si pro)', 1, true),
    (action_uuid, 'Justificatif de domicile de moins de 6 mois du mandant', 2, true),
    (action_uuid, 'Carte grise barrée', 3, true),
    (action_uuid, 'Mandat signé (Cerfa 13757)', 4, true),
    (action_uuid, 'Certificat de cession signé (Cerfa 15776)', 5, true);

  -- Conditional docs for "Annuler"
  INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire) VALUES
    (opt_annuler, 'Attestation manuscrite d''annulation de vente signée par les deux parties', true);

  -- Conditional docs for "Corriger"
  INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire) VALUES
    (opt_corriger, 'Certificat de cession corrigé (Cerfa 15776) – ancienne version et nouvelle version corrigée', true),
    (opt_corriger, 'Si erreur sur l''identité : pièce d''identité du nouveau titulaire', false),
    (opt_corriger, 'Si erreur sur l''adresse : justificatif de domicile de moins de 6 mois du nouveau titulaire', false);

END $$;
