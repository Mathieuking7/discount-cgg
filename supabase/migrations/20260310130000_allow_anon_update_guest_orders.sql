-- Allow anonymous users to update guest_orders they created
-- This is needed for the CommanderSansCompte flow where the user fills in
-- personal info and documents after creating the initial order.
-- Scoped: anon can only update orders that are not yet paid (status = 'en_attente').

DROP POLICY IF EXISTS "Only admins can update guest orders" ON public.guest_orders;

-- Anon users can update orders that haven't been paid yet
CREATE POLICY "Anyone can update unpaid guest orders"
ON public.guest_orders
FOR UPDATE
TO anon, authenticated
USING (paye = false)
WITH CHECK (true);

-- Admins can update any guest order
CREATE POLICY "Admins can update any guest orders"
ON public.guest_orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anon users to SELECT and DELETE their own guest_order_documents
-- (needed for re-uploading documents in CommanderSansCompte)
CREATE POLICY "Anyone can view guest order documents for unpaid orders"
ON public.guest_order_documents
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.guest_orders
    WHERE guest_orders.id = guest_order_documents.order_id
    AND guest_orders.paye = false
    AND guest_orders.status = 'en_attente'
  )
);

CREATE POLICY "Anyone can delete guest order documents for unpaid orders"
ON public.guest_order_documents
FOR DELETE
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.guest_orders
    WHERE guest_orders.id = guest_order_documents.order_id
    AND guest_orders.paye = false
    AND guest_orders.status = 'en_attente'
  )
);
