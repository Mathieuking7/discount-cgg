-- Add RLS policy to allow admins to update guest order documents
CREATE POLICY "Admins can update guest order documents"
ON guest_order_documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);