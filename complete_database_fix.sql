-- Complete fix for all database issues
-- Run this in Supabase SQL Editor

-- 1. Fix project_status enum to match Kanban stages
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'in_progress';
ALTER TYPE project_status ADD VALUE IF NOT EXISTS 'review';

-- 2. Create messages table (if not exists)
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('client', 'admin')),
  message_text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Add indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- 4. Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing message policies if any
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;

-- 6. Create message policies
CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.clients ON clients.id = projects.client_id
    WHERE projects.id = messages.project_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "messages_update_policy" ON public.messages
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin')
  OR sender_id = auth.uid()
);

-- 7. Verify everything
SELECT 
  'project_status enum values:' as info,
  enumlabel as value
FROM pg_enum
WHERE enumtypid = 'project_status'::regtype
ORDER BY enumsortorder;

SELECT 
  'messages table columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
