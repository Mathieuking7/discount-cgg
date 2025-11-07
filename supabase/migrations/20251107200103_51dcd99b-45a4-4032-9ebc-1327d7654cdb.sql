-- Make existing bucket public so public URLs work
UPDATE storage.buckets
SET public = true
WHERE id = 'demarche-documents';

-- Allow admins to UPDATE documents validation fields
CREATE POLICY "Admins can update all documents"
ON public.documents
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to INSERT documents (e.g., final documents uploaded by admin)
CREATE POLICY "Admins can insert documents"
ON public.documents
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));