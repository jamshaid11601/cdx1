-- Make service_id nullable in projects table for custom requests
-- Custom requests don't have a service_id, so this field must be nullable

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.projects 
DROP CONSTRAINT IF EXISTS projects_service_id_fkey;

-- Make service_id nullable
ALTER TABLE public.projects 
ALTER COLUMN service_id DROP NOT NULL;

-- Re-add the foreign key constraint with ON DELETE SET NULL
ALTER TABLE public.projects
ADD CONSTRAINT projects_service_id_fkey 
FOREIGN KEY (service_id) 
REFERENCES public.services(id) 
ON DELETE SET NULL;

-- Verify the change
COMMENT ON COLUMN public.projects.service_id IS 'Link to the service purchased (nullable for custom requests)';
