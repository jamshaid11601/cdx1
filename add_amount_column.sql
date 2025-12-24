-- Migration: Add missing amount column to projects table
-- Run this in Supabase SQL Editor if the projects table already exists without the amount column

-- Check if column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'projects' 
        AND column_name = 'amount'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN amount numeric;
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'projects'
ORDER BY ordinal_position;
