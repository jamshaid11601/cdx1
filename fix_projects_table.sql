-- Complete Migration: Add all missing columns to projects table
-- Run this in Supabase SQL Editor

-- Add service_id column
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES public.services(id) ON DELETE SET NULL;

-- Add amount column
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS amount numeric;

-- Add title column if missing
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS title text;

-- Add description column if missing
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS description text;

-- Update title to NOT NULL after adding it
DO $$ 
BEGIN
    -- Set default title for existing rows
    UPDATE public.projects SET title = 'Project' WHERE title IS NULL;
    
    -- Make title NOT NULL
    ALTER TABLE public.projects ALTER COLUMN title SET NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_projects_service_id ON public.projects(service_id);

-- Verify all columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;
