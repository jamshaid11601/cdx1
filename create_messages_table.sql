-- Create messages table for client-admin communication
-- Run this in Supabase SQL Editor

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('client', 'admin')),
  message_text text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
-- Allow authenticated users to insert messages
CREATE POLICY "messages_insert_policy" ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
);

-- Allow users to view messages in their projects
CREATE POLICY "messages_select_policy" ON public.messages
FOR SELECT
TO authenticated
USING (
  -- Admin can see all messages
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR
  -- Clients can see messages in their projects
  EXISTS (
    SELECT 1 FROM public.projects
    JOIN public.clients ON clients.id = projects.client_id
    WHERE projects.id = messages.project_id
    AND clients.user_id = auth.uid()
  )
  OR
  -- Users can see their own messages
  sender_id = auth.uid()
);

-- Allow users to update their own messages (mark as read)
CREATE POLICY "messages_update_policy" ON public.messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR sender_id = auth.uid()
);

-- Verify table was created
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'messages'
ORDER BY ordinal_position;
