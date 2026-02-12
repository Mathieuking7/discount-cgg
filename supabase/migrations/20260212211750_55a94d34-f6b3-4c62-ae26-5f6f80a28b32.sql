
ALTER TYPE public.demarche_type ADD VALUE IF NOT EXISTS 'CYCLO_ANCIEN_PRO';

INSERT INTO public.actions_rapides (code, titre, description, prix, ordre, actif, require_immatriculation, couleur)
VALUES ('CYCLO_ANCIEN_PRO', 'Immatriculer un cyclo ancien', 'Immatriculation d''un cyclomoteur ancien sans carte grise', 29.90, 140, true, false, 'primary');

DO $$
DECLARE
  action_uuid uuid;
BEGIN
  SELECT id INTO action_uuid FROM public.actions_rapides WHERE code = 'CYCLO_ANCIEN_PRO';

  INSERT INTO public.action_documents (action_id, nom_document, ordre, obligatoire) VALUES
    (action_uuid, 'Extrait Kbis de moins de 6 mois + Pièce d''identité du dirigeant (recto/verso)', 1, true),
    (action_uuid, 'Facture d''achat ou certificat de cession signé et tamponné', 2, true),
    (action_uuid, 'Mandat signé et tamponné (Cerfa 13757)', 3, true),
    (action_uuid, 'Demande d''immatriculation signée et tamponnée (Cerfa 13750)', 4, true),
    (action_uuid, 'Photos du cyclomoteur : plaques constructeur, numéro de série, cadre, véhicule en intégralité', 5, true),
    (action_uuid, 'Attestation d''identification du véhicule délivrée par le constructeur ou son représentant (ou Attestation FFVE)', 6, true),
    (action_uuid, 'Attestation d''assurance', 7, true);
END $$;
