-- Allow garages to delete their own unpaid draft demarches
CREATE POLICY "Garages can delete their own unpaid drafts" 
ON public.demarches 
FOR DELETE 
USING (
  is_draft = true 
  AND paye = false 
  AND garage_id IN (
    SELECT garages.id
    FROM garages
    WHERE garages.user_id = auth.uid()
  )
);