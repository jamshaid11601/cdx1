-- ============================================
-- MESSAGING SUPPORT FOR CUSTOM ORDERS
-- Safe to run multiple times (Idempotent)
-- ============================================

-- 1. Ensure request_id column exists in messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES public.custom_requests(id) ON DELETE CASCADE;

-- 2. Ensure project_id is nullable (since it either links to a project OR a request)
ALTER TABLE public.messages 
ALTER COLUMN project_id DROP NOT NULL;

-- 3. Update Search Performance
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);

-- 4. FIX RLS POLICIES (Ensures clients can see messages related to their requests)
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT TO authenticated
USING (
  -- Admin sees all
  (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  OR
  -- Clients see messages in their projects
  (EXISTS (SELECT 1 FROM public.projects JOIN public.clients ON clients.id = projects.client_id WHERE projects.id = messages.project_id AND clients.user_id = auth.uid()))
  OR
  -- Clients see messages in their custom requests
  (EXISTS (SELECT 1 FROM public.custom_requests WHERE custom_requests.id = messages.request_id AND custom_requests.user_id = auth.uid()))
  OR
  -- Everyone sees their own messages
  (sender_id = auth.uid())
);

-- 5. FIX INSERT POLICY (Ensures clients can reply to their requests)
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid() AND (
    (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) OR
    (EXISTS (SELECT 1 FROM public.projects JOIN public.clients ON clients.id = projects.client_id WHERE projects.id = messages.project_id AND clients.user_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM public.custom_requests WHERE custom_requests.id = messages.request_id AND custom_requests.user_id = auth.uid()))
  )
);

SELECT '✅ Messaging SQL setup complete!' as status;
