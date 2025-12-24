-- Database updates for enhanced custom request workflow
-- Run this in Supabase SQL Editor

-- 1. Add converted_project_id to custom_requests table
ALTER TABLE public.custom_requests 
ADD COLUMN IF NOT EXISTS converted_project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_custom_requests_converted_project 
ON public.custom_requests(converted_project_id);

-- 2. Update messages table to support both projects and requests
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS request_id uuid REFERENCES public.custom_requests(id) ON DELETE CASCADE;

-- Make project_id nullable (either project OR request)
ALTER TABLE public.messages 
ALTER COLUMN project_id DROP NOT NULL;

-- 3. Drop existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'messages_link_check' 
        AND table_name = 'messages'
    ) THEN
        ALTER TABLE public.messages DROP CONSTRAINT messages_link_check;
    END IF;
END $$;

-- Add new constraint: must have either project_id OR request_id (not both, not neither)
ALTER TABLE public.messages 
ADD CONSTRAINT messages_link_check 
CHECK (
  (project_id IS NOT NULL AND request_id IS NULL) OR
  (project_id IS NULL AND request_id IS NOT NULL)
);

-- 4. Add indexes for messages
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);

-- 5. Update RLS policies for messages to include requests
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;

CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT TO authenticated
USING (
  -- Admin sees all messages
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR
  -- User sees messages in their projects
  EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.clients ON clients.id = projects.client_id
    WHERE projects.id = messages.project_id
    AND clients.user_id = auth.uid()
  )
  OR
  -- User sees messages in their requests
  EXISTS (
    SELECT 1 FROM public.custom_requests
    WHERE custom_requests.id = messages.request_id
    AND custom_requests.user_id = auth.uid()
  )
  OR
  -- User sees their own messages
  sender_id = auth.uid()
);

-- 6. Update insert policy for messages
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;

CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND (
    -- Can insert if it's their project
    EXISTS (
      SELECT 1 FROM public.projects
      JOIN public.clients ON clients.id = projects.client_id
      WHERE projects.id = messages.project_id
      AND clients.user_id = auth.uid()
    )
    OR
    -- Can insert if it's their request
    EXISTS (
      SELECT 1 FROM public.custom_requests
      WHERE custom_requests.id = messages.request_id
      AND custom_requests.user_id = auth.uid()
    )
    OR
    -- Admin can insert anywhere
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
);

-- 7. Verify changes
SELECT 
  'custom_requests columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'custom_requests'
AND column_name IN ('converted_project_id')
ORDER BY ordinal_position;

SELECT 
  'messages columns:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('project_id', 'request_id')
ORDER BY ordinal_position;

-- Success message
SELECT 'Database schema updated successfully!' as status;
