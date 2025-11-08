-- Create table for quick actions configuration
CREATE TABLE public.actions_rapides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  titre text NOT NULL,
  description text,
  prix numeric NOT NULL DEFAULT 0,
  couleur text NOT NULL DEFAULT 'primary',
  ordre integer NOT NULL DEFAULT 0,
  actif boolean NOT NULL DEFAULT true,
  require_immatriculation boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for required documents per action
CREATE TABLE public.action_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES public.actions_rapides(id) ON DELETE CASCADE,
  nom_document text NOT NULL,
  ordre integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.actions_rapides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for actions_rapides
CREATE POLICY "Everyone can view active actions"
ON public.actions_rapides
FOR SELECT
USING (actif = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert actions"
ON public.actions_rapides
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update actions"
ON public.actions_rapides
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete actions"
ON public.actions_rapides
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for action_documents
CREATE POLICY "Everyone can view documents for active actions"
ON public.action_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.actions_rapides
    WHERE id = action_documents.action_id
    AND (actif = true OR has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Admins can insert documents"
ON public.action_documents
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update documents"
ON public.action_documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete documents"
ON public.action_documents
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_actions_rapides_updated_at
BEFORE UPDATE ON public.actions_rapides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default actions
INSERT INTO public.actions_rapides (code, titre, description, prix, couleur, ordre) VALUES
('DA', 'Déclaration d''achat', 'Certificat de cession, déclaration d''achat', 10, 'primary', 1),
('DC', 'Déclaration de cession', 'Certificat de cession, carte grise', 10, 'accent', 2),
('CG', 'Carte Grise', 'Documents complets requis', 30, 'success', 3);

-- Insert default documents for DA
INSERT INTO public.action_documents (action_id, nom_document, ordre)
SELECT id, 'Certificat de cession (cerfa 15776*01)', 1 FROM public.actions_rapides WHERE code = 'DA'
UNION ALL
SELECT id, 'Certificat déclaration d''achat (cerfa 13751*02)', 2 FROM public.actions_rapides WHERE code = 'DA'
UNION ALL
SELECT id, 'Carte grise barrée tamponnée recto/verso', 3 FROM public.actions_rapides WHERE code = 'DA'
UNION ALL
SELECT id, 'Dernière DA enregistrée (si achat à un pro)', 4 FROM public.actions_rapides WHERE code = 'DA'
UNION ALL
SELECT id, 'Accusé d''enregistrement déclaration de cession', 5 FROM public.actions_rapides WHERE code = 'DA';

-- Insert default documents for DC
INSERT INTO public.action_documents (action_id, nom_document, ordre)
SELECT id, 'Certificat de cession (cerfa 15776*01)', 1 FROM public.actions_rapides WHERE code = 'DC'
UNION ALL
SELECT id, 'Certificat déclaration d''achat (si achat à un pro)', 2 FROM public.actions_rapides WHERE code = 'DC'
UNION ALL
SELECT id, 'Carte grise barrée tamponnée recto/verso', 3 FROM public.actions_rapides WHERE code = 'DC'
UNION ALL
SELECT id, 'Carte d''identité du nouveau propriétaire', 4 FROM public.actions_rapides WHERE code = 'DC'
UNION ALL
SELECT id, 'Dernière DA enregistrée (si achat à un pro)', 5 FROM public.actions_rapides WHERE code = 'DC';

-- Insert default documents for CG
INSERT INTO public.action_documents (action_id, nom_document, ordre)
SELECT id, 'Carte d''identité', 1 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Permis de conduire', 2 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Carte grise barrée et tamponnée recto/verso', 3 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Certificat de cession (cerfa 15776*01)', 4 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Contrôle technique -6 mois', 5 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Justificatif de domicile -3 mois', 6 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Attestation d''assurance', 7 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Mandat (cerfa 13757*03)', 8 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Demande de certificat d''immatriculation (cerfa 13750*05)', 9 FROM public.actions_rapides WHERE code = 'CG'
UNION ALL
SELECT id, 'Dernière DA (si ancien propriétaire est un pro)', 10 FROM public.actions_rapides WHERE code = 'CG';