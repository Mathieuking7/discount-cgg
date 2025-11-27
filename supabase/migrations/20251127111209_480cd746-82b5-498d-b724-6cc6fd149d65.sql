-- Make the factures bucket public so files can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'factures';

-- Add RLS policy for public read access on factures
CREATE POLICY "Factures are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'factures');

-- Allow authenticated users to upload factures (for admin/webhook)
CREATE POLICY "Service role can upload factures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'factures');

-- Allow updates on factures
CREATE POLICY "Service role can update factures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'factures');