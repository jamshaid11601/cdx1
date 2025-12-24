-- CLEANUP: Remove unused database objects
-- Run this AFTER the FINAL_FIX_custom_requests.sql

-- This script cleans up any unused columns, constraints, or objects
-- that were created during development but are no longer needed

-- 1. Check what we have in custom_requests table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_requests'
ORDER BY ordinal_position;

-- 2. List all foreign key constraints on custom_requests
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'custom_requests';

-- Note: We keep converted_project_id for backward compatibility
-- It can remain as a nullable field without foreign key constraint
-- This allows old records to still reference projects if needed

COMMENT ON COLUMN public.custom_requests.converted_project_id IS 'Legacy field - kept for backward compatibility';
COMMENT ON COLUMN public.custom_requests.custom_order_id IS 'Links to custom_orders table for new custom request orders';
