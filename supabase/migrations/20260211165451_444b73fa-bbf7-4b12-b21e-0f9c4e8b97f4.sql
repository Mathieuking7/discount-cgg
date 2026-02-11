
-- Add new enum value
ALTER TYPE public.demarche_type ADD VALUE IF NOT EXISTS 'ANNULATION_CPI_WW_PRO';

-- Insert action rapide
INSERT INTO public.actions_rapides (code, titre, description, prix, ordre, actif, couleur, require_immatriculation, test_only)
VALUES ('ANNULATION_CPI_WW_PRO', 'Annulation CPI WW', 'Annulation d''un certificat provisoire d''immatriculation WW pour les sociétés', 29.90, 14, true, 'primary', true, false);

-- Insert base documents
INSERT INTO public.action_documents (action_id, nom_document, obligatoire, ordre)
SELECT id, 'Attestation d''annulation de vente manuscrite (signée par vendeur et acquéreur, cachet + signature si pro)', true, 1 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO'
UNION ALL
SELECT id, 'Pièce d''identité des deux parties : acheteur et vendeur (Kbis + ID dirigeant pour les pros)', true, 2 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO'
UNION ALL
SELECT id, 'Attestation d''assurance', true, 3 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO'
UNION ALL
SELECT id, 'Mandat signé et tamponné (cerfa 13757)', true, 4 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO'
UNION ALL
SELECT id, 'Certificat d''immatriculation étranger', true, 5 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO'
UNION ALL
SELECT id, 'Certificat de conformité COC', false, 6 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO'
UNION ALL
SELECT id, 'Facture d''achat ou Certificat de cession', true, 7 FROM actions_rapides WHERE code = 'ANNULATION_CPI_WW_PRO';
