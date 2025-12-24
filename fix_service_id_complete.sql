-- Complete fix for service_id foreign key constraint
-- This ensures custom requests can create projects without a service_id

-- Step 1: Check current constraint
SELECT conname, contype, confupdtype, confdeltype
FROM pg_constraint
WHERE conrelid = 'public.projects'::regclass
AND conname = 'projects_service_id_fkey';

-- Step 2: Drop the existing foreign key constraint
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_service_id_fkey;

-- Step 3: Ensure service_id column is nullable
ALTER TABLE public.projects 
ALTER COLUMN service_id DROP NOT NULL;

-- Step 4: Re-create the foreign key constraint allowing NULL values
ALTER TABLE public.projects
ADD CONSTRAINT projects_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES public.services(id) 
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 5: Verify the change
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'projects' 
AND column_name = 'service_id';

-- Expected result: is_nullable should be 'YES'
