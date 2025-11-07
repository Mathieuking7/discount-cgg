-- Create storage bucket for demarche documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'demarche-documents',
  'demarche-documents',
  true,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for demarche documents
CREATE POLICY "Anyone can view demarche documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'demarche-documents');

CREATE POLICY "Authenticated users can upload demarche documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'demarche-documents' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own demarche documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'demarche-documents'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Admins can delete demarche documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'demarche-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);