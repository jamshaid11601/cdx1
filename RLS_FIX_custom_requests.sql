-- ============================================
-- FIX RLS FOR CUSTOM REQUESTS UPDATE
-- Allows clients to update their own requests (needed for checkout)
-- ============================================

-- Drop existing update policy
DROP POLICY IF EXISTS "custom_requests_update_policy" ON public.custom_requests;

-- Create new update policy that allows both admins AND the request owner
CREATE POLICY "custom_requests_update_policy" ON public.custom_requests
FOR UPDATE
TO authenticated
USING (
  -- Admin can update anything
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  OR
  -- Users can update their own requests
  (user_id = auth.uid())
)
WITH CHECK (
  -- Admin can update anything
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  OR
  -- Users can only update their own requests
  (user_id = auth.uid())
);

SELECT '✅ custom_requests RLS updated successfully!' as status;
