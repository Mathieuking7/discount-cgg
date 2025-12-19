-- Ajouter la politique RLS permettant aux garages de supprimer leurs propres documents
CREATE POLICY "Garages can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (
  demarche_id IN (
    SELECT d.id 
    FROM demarches d
    JOIN garages g ON d.garage_id = g.id
    WHERE g.user_id = auth.uid()
  )
);
