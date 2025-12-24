-- Table pour stocker les réponses aux questionnaires des démarches
CREATE TABLE public.demarche_questionnaire_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demarche_id UUID NOT NULL REFERENCES public.demarches(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.action_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.action_question_options(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(demarche_id, question_id)
);

-- Enable RLS
ALTER TABLE public.demarche_questionnaire_responses ENABLE ROW LEVEL SECURITY;

-- Garages can view responses for their own demarches
CREATE POLICY "Garages can view their own questionnaire responses"
ON public.demarche_questionnaire_responses
FOR SELECT
USING (
  demarche_id IN (
    SELECT d.id FROM demarches d
    JOIN garages g ON d.garage_id = g.id
    WHERE g.user_id = auth.uid()
  )
);

-- Garages can insert responses for their own demarches
CREATE POLICY "Garages can insert questionnaire responses"
ON public.demarche_questionnaire_responses
FOR INSERT
WITH CHECK (
  demarche_id IN (
    SELECT d.id FROM demarches d
    JOIN garages g ON d.garage_id = g.id
    WHERE g.user_id = auth.uid()
  )
);

-- Garages can update responses for their own demarches
CREATE POLICY "Garages can update their own questionnaire responses"
ON public.demarche_questionnaire_responses
FOR UPDATE
USING (
  demarche_id IN (
    SELECT d.id FROM demarches d
    JOIN garages g ON d.garage_id = g.id
    WHERE g.user_id = auth.uid()
  )
);

-- Admins can view all responses
CREATE POLICY "Admins can view all questionnaire responses"
ON public.demarche_questionnaire_responses
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage all responses
CREATE POLICY "Admins can manage all questionnaire responses"
ON public.demarche_questionnaire_responses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));