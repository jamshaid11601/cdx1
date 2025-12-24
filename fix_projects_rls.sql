-- Fix RLS policies for projects table to allow inserts
-- Run this in Supabase SQL Editor

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;

-- Allow authenticated users to insert their own projects
CREATE POLICY "projects_insert_policy" ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if user is admin OR if they're creating a project for their own client record
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR 
         EXISTS (
           SELECT 1 FROM public.clients
           WHERE clients.id = projects.client_id
           AND clients.user_id = auth.uid()
         ))
  )
);

-- Allow users to view their own projects (clients) or all projects (admins)
CREATE POLICY "projects_select_policy" ON public.projects
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR 
         EXISTS (
           SELECT 1 FROM public.clients
           WHERE clients.id = projects.client_id
           AND clients.user_id = auth.uid()
         ))
  )
);

-- Allow admins to update any project, clients to update their own
CREATE POLICY "projects_update_policy" ON public.projects
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND (users.role = 'admin' OR 
         EXISTS (
           SELECT 1 FROM public.clients
           WHERE clients.id = projects.client_id
           AND clients.user_id = auth.uid()
         ))
  )
);

-- Allow admins to delete any project
CREATE POLICY "projects_delete_policy" ON public.projects
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';
