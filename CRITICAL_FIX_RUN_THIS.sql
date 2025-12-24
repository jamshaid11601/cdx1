-- CRITICAL FIX: Make service_id nullable in projects table
-- This MUST be run in Supabase SQL Editor for custom requests to work

-- Step 1: Drop the constraint
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_service_id_fkey;

-- Step 2: Make the column nullable (remove NOT NULL if it exists)
ALTER TABLE public.projects 
ALTER COLUMN service_id DROP NOT NULL;

-- Step 3: Add the constraint back, allowing NULL values
ALTER TABLE public.projects
ADD CONSTRAINT projects_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES public.services(id) 
ON DELETE SET NULL;

-- Verify it worked
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'projects' 
AND column_name = 'service_id';

-- Expected output: is_nullable = 'YES'
