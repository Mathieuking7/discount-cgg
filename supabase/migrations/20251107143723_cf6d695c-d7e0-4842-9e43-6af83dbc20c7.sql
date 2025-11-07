-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'garage');
CREATE TYPE public.demarche_type AS ENUM ('DA', 'DC', 'CG', 'CG_DA', 'DA_DC', 'CG_IMPORT');
CREATE TYPE public.demarche_status AS ENUM ('en_saisie', 'en_attente', 'paye', 'valide', 'finalise', 'refuse');
CREATE TYPE public.paiement_status AS ENUM ('en_attente', 'valide', 'refuse', 'rembourse');

-- Create garages table (professional companies)
CREATE TABLE public.garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  raison_sociale TEXT NOT NULL,
  siret TEXT NOT NULL UNIQUE,
  adresse TEXT NOT NULL,
  code_postal TEXT NOT NULL,
  ville TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  is_gold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on garages
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create vehicules table
CREATE TABLE public.vehicules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE NOT NULL,
  immatriculation TEXT NOT NULL,
  marque TEXT,
  modele TEXT,
  vin TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(garage_id, immatriculation)
);

-- Enable RLS on vehicules
ALTER TABLE public.vehicules ENABLE ROW LEVEL SECURITY;

-- Create demarches table
CREATE TABLE public.demarches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE NOT NULL,
  vehicule_id UUID REFERENCES public.vehicules(id) ON DELETE SET NULL,
  type demarche_type NOT NULL,
  status demarche_status DEFAULT 'en_saisie' NOT NULL,
  immatriculation TEXT NOT NULL,
  commentaire TEXT,
  montant_ht DECIMAL(10,2) DEFAULT 0,
  montant_ttc DECIMAL(10,2) DEFAULT 0,
  frais_dossier DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS on demarches
ALTER TABLE public.demarches ENABLE ROW LEVEL SECURITY;

-- Create documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demarche_id UUID REFERENCES public.demarches(id) ON DELETE CASCADE NOT NULL,
  nom_fichier TEXT NOT NULL,
  type_document TEXT NOT NULL,
  url TEXT NOT NULL,
  taille_octets INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create paiements table
CREATE TABLE public.paiements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demarche_id UUID REFERENCES public.demarches(id) ON DELETE CASCADE NOT NULL,
  garage_id UUID REFERENCES public.garages(id) ON DELETE CASCADE NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  status paiement_status DEFAULT 'en_attente' NOT NULL,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  validated_at TIMESTAMPTZ
);

-- Enable RLS on paiements
ALTER TABLE public.paiements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for garages
CREATE POLICY "Garages can view their own data"
  ON public.garages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Garages can update their own data"
  ON public.garages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all garages"
  ON public.garages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "New users can insert their garage profile"
  ON public.garages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vehicules
CREATE POLICY "Garages can view their own vehicules"
  ON public.vehicules FOR SELECT
  TO authenticated
  USING (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Garages can insert their own vehicules"
  ON public.vehicules FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all vehicules"
  ON public.vehicules FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for demarches
CREATE POLICY "Garages can view their own demarches"
  ON public.demarches FOR SELECT
  TO authenticated
  USING (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Garages can insert their own demarches"
  ON public.demarches FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Garages can update their own demarches"
  ON public.demarches FOR UPDATE
  TO authenticated
  USING (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all demarches"
  ON public.demarches FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all demarches"
  ON public.demarches FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for documents
CREATE POLICY "Garages can view documents for their demarches"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    demarche_id IN (
      SELECT d.id FROM public.demarches d
      JOIN public.garages g ON d.garage_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

CREATE POLICY "Garages can insert documents for their demarches"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    demarche_id IN (
      SELECT d.id FROM public.demarches d
      JOIN public.garages g ON d.garage_id = g.id
      WHERE g.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for paiements
CREATE POLICY "Garages can view their own paiements"
  ON public.paiements FOR SELECT
  TO authenticated
  USING (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Garages can insert their own paiements"
  ON public.paiements FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id IN (
      SELECT id FROM public.garages WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all paiements"
  ON public.paiements FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all paiements"
  ON public.paiements FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_garages_updated_at
  BEFORE UPDATE ON public.garages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_demarches_updated_at
  BEFORE UPDATE ON public.demarches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();