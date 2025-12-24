-- Fix RLS policy to allow admins to update project status
-- Run this in Supabase SQL Editor

-- Drop the existing update policy
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;

-- Create a new update policy that allows admins to update
CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE
TO authenticated
USING (
  -- Admin can update any project
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR
  -- Client can update their own projects
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = projects.client_id
    AND clients.user_id = auth.uid()
  )
)
WITH CHECK (
  -- Same check for the updated row
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = projects.client_id
    AND clients.user_id = auth.uid()
  )
);

-- Verify the policy
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'projects'
AND policyname = 'projects_update_policy';
