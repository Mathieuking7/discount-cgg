-- Ensure all 16 demarche types exist (15 from frontend + DA)
-- Uses ON CONFLICT (code) DO NOTHING so it's safe to re-run

INSERT INTO guest_demarche_types (code, titre, description, prix_base, actif, ordre, require_vehicle_info, require_carte_grise_price) VALUES
  ('CG', 'Carte Grise (Changement de titulaire)', 'Demande de nouvelle carte grise suite a un changement de proprietaire', 30, true, 1, true, true),
  ('DA', 'Declaration d''Achat', 'Declaration d''achat d''un vehicule d''occasion', 19.90, true, 2, true, false),
  ('DC', 'Declaration de Cession', 'Declaration de vente d''un vehicule', 19.90, true, 3, true, false),
  ('CHGT_ADRESSE', 'Changement d''adresse', 'Mise a jour de l''adresse sur votre carte grise suite a un demenagement.', 29, true, 3, true, false),
  ('DUPLICATA', 'Duplicata de carte grise', 'Obtention d''un duplicata en cas de perte, vol ou deterioration de votre carte grise.', 39, true, 4, true, false),
  ('CG_NEUF', 'Immatriculation vehicule neuf', 'Premiere immatriculation d''un vehicule neuf achete en concession.', 30, true, 5, false, true),
  ('CPI_WW', 'Carte grise import (CPI/WW)', 'Immatriculation d''un vehicule importe de l''etranger en France.', 49, true, 6, false, true),
  ('FIV', 'Fiche d''identification vehicule (FIV)', 'Consultation du fichier des vehicules pour obtenir les informations techniques.', 14.90, true, 7, true, false),
  ('MODIF_CG', 'Modification carte grise', 'Modification des informations inscrites sur votre carte grise (usage, carrosserie, etc.).', 29, true, 8, true, false),
  ('SUCCESSION', 'Carte grise succession', 'Transfert de la carte grise suite a une succession ou un heritage.', 39, true, 9, true, false),
  ('COTITULAIRE', 'Ajout/retrait cotitulaire', 'Ajout ou retrait d''un cotitulaire sur la carte grise du vehicule.', 29, true, 10, true, false),
  ('QUITUS_FISCAL', 'Quitus fiscal', 'Obtention du quitus fiscal obligatoire pour immatriculer un vehicule importe.', 39, true, 11, false, false),
  ('CHGT_ADRESSE_LOCATAIRE', 'Changement adresse locataire', 'Mise a jour de l''adresse du locataire sur la carte grise du vehicule en leasing.', 29, true, 12, true, false),
  ('IMMAT_CYCLO_ANCIEN', 'Immatriculation cyclomoteur', 'Immatriculation d''un cyclomoteur ancien non encore immatricule dans le SIV.', 29, true, 13, false, false),
  ('ANNULER_CPI_WW', 'Annulation CPI/WW', 'Annulation d''un certificat provisoire d''immatriculation (CPI) ou plaque WW.', 19.90, true, 14, true, false),
  ('DEMANDE_IMMAT', 'Demande d''immatriculation', 'Demande d''immatriculation pour un vehicule non encore enregistre dans le SIV.', 29, true, 15, false, false)
ON CONFLICT (code) DO NOTHING;

-- Seed required documents for DA (Declaration d'Achat) - the only type currently missing docs
-- Use a guard to avoid duplicates since there's no unique constraint on (nom_document, demarche_type_code)
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif)
SELECT v.nom_document, v.demarche_type_code, v.ordre, v.obligatoire, v.actif
FROM (VALUES
  ('Piece d''identite (CNI ou passeport)', 'DA', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'DA', 2, true, true),
  ('Certificat de cession (Cerfa 15776)', 'DA', 3, true, true),
  ('Carte grise du vehicule', 'DA', 4, true, true)
) AS v(nom_document, demarche_type_code, ordre, obligatoire, actif)
WHERE NOT EXISTS (
  SELECT 1 FROM guest_order_required_documents d
  WHERE d.demarche_type_code = v.demarche_type_code AND d.nom_document = v.nom_document
);
