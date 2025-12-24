-- FINAL FIX: Update custom_requests table to work with custom_orders
-- This removes the foreign key constraint that's causing the error

-- Step 1: Drop the foreign key constraint on converted_project_id
ALTER TABLE public.custom_requests 
DROP CONSTRAINT IF EXISTS custom_requests_converted_project_id_fkey;

-- Step 2: Make converted_project_id nullable and remove any constraints
ALTER TABLE public.custom_requests 
ALTER COLUMN converted_project_id DROP NOT NULL;

-- Step 3: Rename the column to be more generic (optional but cleaner)
-- We'll keep it as converted_project_id but it can now reference either projects or custom_orders

-- Step 4: Add a new column for custom_order_id
ALTER TABLE public.custom_requests
ADD COLUMN IF NOT EXISTS custom_order_id uuid REFERENCES public.custom_orders(id) ON DELETE SET NULL;

-- Step 5: Create index for performance
CREATE INDEX IF NOT EXISTS idx_custom_requests_custom_order_id ON public.custom_requests(custom_order_id);

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_requests' 
AND column_name IN ('converted_project_id', 'custom_order_id');
