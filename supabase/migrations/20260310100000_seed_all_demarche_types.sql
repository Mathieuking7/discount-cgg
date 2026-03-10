-- Seed all missing guest_demarche_types (12 types missing, CG/DC/DA already exist)

INSERT INTO guest_demarche_types (code, titre, description, prix_base, actif, ordre, require_vehicle_info, require_carte_grise_price) VALUES
  ('CHGT_ADRESSE', 'Changement d''adresse', 'Mise a jour de l''adresse sur votre carte grise suite a un demenagement.', 29, true, 3, true, false),
  ('DUPLICATA', 'Duplicata de carte grise', 'Obtention d''un duplicata en cas de perte, vol ou deterioration de votre carte grise.', 39, true, 4, true, false),
  ('CG_NEUF', 'Immatriculation vehicule neuf', 'Premiere immatriculation d''un vehicule neuf achete en concession.', 30, true, 5, true, true),
  ('CPI_WW', 'Carte grise import (CPI/WW)', 'Immatriculation d''un vehicule importe de l''etranger en France.', 49, true, 6, true, true),
  ('FIV', 'Fiche d''identification vehicule (FIV)', 'Consultation du fichier des vehicules pour obtenir les informations techniques.', 14.90, true, 7, true, false),
  ('MODIF_CG', 'Modification carte grise', 'Modification des informations inscrites sur votre carte grise (usage, carrosserie, etc.).', 29, true, 8, true, false),
  ('SUCCESSION', 'Carte grise succession', 'Transfert de la carte grise suite a une succession ou un heritage.', 39, true, 9, true, false),
  ('COTITULAIRE', 'Ajout/retrait cotitulaire', 'Ajout ou retrait d''un cotitulaire sur la carte grise du vehicule.', 29, true, 10, true, false),
  ('QUITUS_FISCAL', 'Quitus fiscal', 'Obtention du quitus fiscal obligatoire pour immatriculer un vehicule importe.', 39, true, 11, false, false),
  ('CHGT_ADRESSE_LOCATAIRE', 'Changement adresse locataire', 'Mise a jour de l''adresse du locataire sur la carte grise du vehicule en leasing.', 29, true, 12, true, false),
  ('IMMAT_CYCLO_ANCIEN', 'Immatriculation cyclomoteur', 'Immatriculation d''un cyclomoteur ancien non encore immatricule dans le SIV.', 29, true, 13, true, false),
  ('ANNULER_CPI_WW', 'Annulation CPI/WW', 'Annulation d''un certificat provisoire d''immatriculation (CPI) ou plaque WW.', 19.90, true, 14, true, false),
  ('DEMANDE_IMMAT', 'Demande d''immatriculation', 'Demande d''immatriculation pour un vehicule non encore enregistre dans le SIV.', 29, true, 15, true, false)
ON CONFLICT (code) DO NOTHING;

-- Seed required documents for each demarche type (table has no description column)

-- CHGT_ADRESSE
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'CHGT_ADRESSE', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'CHGT_ADRESSE', 2, true, true),
  ('Carte grise originale', 'CHGT_ADRESSE', 3, true, true);

-- DUPLICATA
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'DUPLICATA', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'DUPLICATA', 2, true, true),
  ('Declaration de perte ou recepisse de plainte', 'DUPLICATA', 3, true, true);

-- CG_NEUF
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'CG_NEUF', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'CG_NEUF', 2, true, true),
  ('Certificat de conformite europeen', 'CG_NEUF', 3, true, true),
  ('Facture d''achat du vehicule', 'CG_NEUF', 4, true, true);

-- CPI_WW
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'CPI_WW', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'CPI_WW', 2, true, true),
  ('Carte grise etrangere', 'CPI_WW', 3, true, true),
  ('Quitus fiscal', 'CPI_WW', 4, true, true),
  ('Controle technique (moins de 6 mois)', 'CPI_WW', 5, true, true);

-- FIV
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'FIV', 1, true, true);

-- MODIF_CG
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'MODIF_CG', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'MODIF_CG', 2, true, true),
  ('Carte grise originale', 'MODIF_CG', 3, true, true),
  ('Justificatif de modification', 'MODIF_CG', 4, true, true);

-- SUCCESSION
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'SUCCESSION', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'SUCCESSION', 2, true, true),
  ('Carte grise du vehicule', 'SUCCESSION', 3, true, true),
  ('Acte de succession ou attestation heredite', 'SUCCESSION', 4, true, true);

-- COTITULAIRE
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite du titulaire', 'COTITULAIRE', 1, true, true),
  ('Piece d''identite du cotitulaire', 'COTITULAIRE', 2, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'COTITULAIRE', 3, true, true),
  ('Carte grise originale', 'COTITULAIRE', 4, true, true);

-- QUITUS_FISCAL
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'QUITUS_FISCAL', 1, true, true),
  ('Facture d''achat du vehicule', 'QUITUS_FISCAL', 2, true, true),
  ('Carte grise etrangere', 'QUITUS_FISCAL', 3, true, true);

-- CHGT_ADRESSE_LOCATAIRE
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'CHGT_ADRESSE_LOCATAIRE', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'CHGT_ADRESSE_LOCATAIRE', 2, true, true),
  ('Contrat de location ou leasing', 'CHGT_ADRESSE_LOCATAIRE', 3, true, true),
  ('Carte grise originale', 'CHGT_ADRESSE_LOCATAIRE', 4, true, true);

-- IMMAT_CYCLO_ANCIEN
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'IMMAT_CYCLO_ANCIEN', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'IMMAT_CYCLO_ANCIEN', 2, true, true),
  ('Justificatif de propriete du cyclomoteur', 'IMMAT_CYCLO_ANCIEN', 3, true, true);

-- ANNULER_CPI_WW
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'ANNULER_CPI_WW', 1, true, true),
  ('CPI ou document WW a annuler', 'ANNULER_CPI_WW', 2, true, true),
  ('Justificatif d''annulation', 'ANNULER_CPI_WW', 3, true, true);

-- DEMANDE_IMMAT
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite (CNI ou passeport)', 'DEMANDE_IMMAT', 1, true, true),
  ('Justificatif de domicile (moins de 6 mois)', 'DEMANDE_IMMAT', 2, true, true),
  ('Justificatif de propriete du vehicule', 'DEMANDE_IMMAT', 3, true, true);

-- DC (exists but has no docs yet)
INSERT INTO guest_order_required_documents (nom_document, demarche_type_code, ordre, obligatoire, actif) VALUES
  ('Piece d''identite du vendeur', 'DC', 1, true, true),
  ('Piece d''identite de l''acheteur', 'DC', 2, true, true),
  ('Carte grise barree et signee', 'DC', 3, true, true),
  ('Certificat de cession (Cerfa 15776)', 'DC', 4, true, true);
