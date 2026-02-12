
-- Add new enum value
ALTER TYPE public.demarche_type ADD VALUE IF NOT EXISTS 'SUCCESSION_HERITAGE_PRO';

-- Insert action rapide
INSERT INTO public.actions_rapides (code, titre, description, prix, ordre, actif, couleur, require_immatriculation, test_only)
VALUES ('SUCCESSION_HERITAGE_PRO', 'Succession et Héritage', 'Changement de titulaire suite à un décès (héritier garde ou vend le véhicule)', 29.90, 16, true, 'primary', true, false);

-- Insert base documents (communs aux deux cas)
INSERT INTO public.action_documents (action_id, nom_document, obligatoire, ordre)
SELECT id, 'Pièce d''identité de l''héritier (recto/verso)', true, 1 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Permis de conduire de l''héritier (recto/verso)', true, 2 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Justificatif de domicile de moins de 6 mois de l''héritier', true, 3 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Ancien certificat d''immatriculation', true, 4 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Mandat Cerfa 13757 signé', true, 5 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Certificat de décès', true, 6 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Acte notarié mentionnant le véhicule ou justificatif de la qualité d''héritier', true, 7 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'
UNION ALL
SELECT id, 'Contrôle technique en cours de validité (pour les véhicules de plus de 4 ans)', true, 8 FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO';

-- Question 1: Que souhaite faire l'héritier ?
INSERT INTO public.action_questions (action_id, question_text, ordre, is_blocking, blocking_message)
SELECT id, 'Que souhaite faire l''héritier avec le véhicule ?', 1, false, null
FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO';

-- Options Q1
INSERT INTO public.action_question_options (question_id, option_text, ordre, is_blocking, blocking_message)
SELECT id, 'Garder le véhicule', 1, false, null FROM action_questions 
WHERE question_text = 'Que souhaite faire l''héritier avec le véhicule ?'
AND action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO')
UNION ALL
SELECT id, 'Vendre ou donner le véhicule', 2, false, null FROM action_questions 
WHERE question_text = 'Que souhaite faire l''héritier avec le véhicule ?'
AND action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO');

-- Question 2: Plusieurs héritiers ?
INSERT INTO public.action_questions (action_id, question_text, ordre, is_blocking, blocking_message)
SELECT id, 'Y a-t-il plusieurs héritiers ?', 2, false, null
FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO';

-- Options Q2
INSERT INTO public.action_question_options (question_id, option_text, ordre, is_blocking, blocking_message)
SELECT id, 'Oui, plusieurs héritiers', 1, false, null FROM action_questions 
WHERE question_text = 'Y a-t-il plusieurs héritiers ?'
AND action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO')
UNION ALL
SELECT id, 'Non, héritier unique', 2, false, null FROM action_questions 
WHERE question_text = 'Y a-t-il plusieurs héritiers ?'
AND action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO');

-- Question 3: Délai du décès ? (pertinent si vente)
INSERT INTO public.action_questions (action_id, question_text, ordre, is_blocking, blocking_message)
SELECT id, 'Le décès a-t-il eu lieu il y a moins de 3 mois ?', 3, false, null
FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO';

-- Options Q3
INSERT INTO public.action_question_options (question_id, option_text, ordre, is_blocking, blocking_message)
SELECT id, 'Oui, moins de 3 mois', 1, false, null FROM action_questions 
WHERE question_text = 'Le décès a-t-il eu lieu il y a moins de 3 mois ?'
AND action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO')
UNION ALL
SELECT id, 'Non, plus de 3 mois', 2, false, null FROM action_questions 
WHERE question_text = 'Le décès a-t-il eu lieu il y a moins de 3 mois ?'
AND action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO');

-- Conditional documents: "Garder le véhicule" → Cerfa 13750
INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Demande d''immatriculation Cerfa 13750 signée', true
FROM action_question_options WHERE option_text = 'Garder le véhicule'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

-- Conditional documents: "Plusieurs héritiers" → Lettre de désistement
INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Lettre de désistement signée de tous les héritiers avec leurs pièces d''identité', true
FROM action_question_options WHERE option_text = 'Oui, plusieurs héritiers'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

-- Conditional documents: "Moins de 3 mois" → docs acquéreur
INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'CNI de l''acquéreur (recto/verso)', true
FROM action_question_options WHERE option_text = 'Oui, moins de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Permis de conduire de l''acquéreur', true
FROM action_question_options WHERE option_text = 'Oui, moins de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Justificatif de domicile de l''acquéreur', true
FROM action_question_options WHERE option_text = 'Oui, moins de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Certificat de cession', true
FROM action_question_options WHERE option_text = 'Oui, moins de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Demande d''immatriculation au nom de l''acquéreur', true
FROM action_question_options WHERE option_text = 'Oui, moins de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Attestation de non-circulation du véhicule depuis le décès signée par l''héritier', true
FROM action_question_options WHERE option_text = 'Oui, moins de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));

-- Conditional documents: "Plus de 3 mois" → Cerfa 13750 au nom héritier
INSERT INTO public.action_conditional_documents (option_id, nom_document, obligatoire)
SELECT id, 'Demande d''immatriculation Cerfa 13750 au nom de l''héritier', true
FROM action_question_options WHERE option_text = 'Non, plus de 3 mois'
AND question_id IN (SELECT id FROM action_questions WHERE action_id = (SELECT id FROM actions_rapides WHERE code = 'SUCCESSION_HERITAGE_PRO'));
