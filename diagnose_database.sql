-- Diagnostic: Check if services table exists and its structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'services'
ORDER BY ordinal_position;

-- Check the foreign key constraint details
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'projects'
AND kcu.column_name = 'service_id';

-- Check if the UUID we're trying to use exists
SELECT id, title FROM public.services WHERE id = '00000000-0000-0000-0000-000000000001';

-- List all services to see what exists
SELECT id, title, category FROM public.services LIMIT 10;
