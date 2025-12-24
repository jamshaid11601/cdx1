-- ============================================
-- COMPLETE DATABASE SETUP FOR CUSTOM ORDERS
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- This script does everything needed in the correct order:
-- 1. Creates custom_orders table
-- 2. Fixes custom_requests table
-- 3. Sets up all constraints and policies

-- ============================================
-- PART 1: Create custom_orders table
-- ============================================

CREATE TABLE IF NOT EXISTS public.custom_orders (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    request_id uuid REFERENCES public.custom_requests(id) ON DELETE SET NULL,
    title text NOT NULL,
    description text,
    amount numeric NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
    payment_status text DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    start_date date,
    end_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_orders_client_id ON public.custom_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_request_id ON public.custom_orders(request_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON public.custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON public.custom_orders(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_custom_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_orders_updated_at
    BEFORE UPDATE ON public.custom_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_custom_orders_updated_at();

-- Enable RLS
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Clients can view own custom orders"
    ON public.custom_orders FOR SELECT
    USING (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all custom orders"
    ON public.custom_orders FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Clients can insert own custom orders"
    ON public.custom_orders FOR INSERT
    WITH CHECK (client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert custom orders"
    ON public.custom_orders FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can update custom orders"
    ON public.custom_orders FOR UPDATE
    USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- PART 2: Fix custom_requests table
-- ============================================

-- Drop the problematic foreign key constraint
ALTER TABLE public.custom_requests 
DROP CONSTRAINT IF EXISTS custom_requests_converted_project_id_fkey;

-- Make converted_project_id nullable
ALTER TABLE public.custom_requests 
ALTER COLUMN converted_project_id DROP NOT NULL;

-- Add new column for custom_order_id
ALTER TABLE public.custom_requests
ADD COLUMN IF NOT EXISTS custom_order_id uuid REFERENCES public.custom_orders(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_custom_requests_custom_order_id ON public.custom_requests(custom_order_id);

-- Add approved_price column if it doesn't exist
ALTER TABLE public.custom_requests
ADD COLUMN IF NOT EXISTS approved_price DECIMAL(10,2);

-- ============================================
-- PART 3: Verify everything worked
-- ============================================

-- Check custom_orders table
SELECT 'custom_orders table created' AS status,
       COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_name = 'custom_orders';

-- Check custom_requests updates
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'custom_requests' 
AND column_name IN ('custom_order_id', 'approved_price', 'converted_project_id')
ORDER BY column_name;

-- Success message
SELECT '✅ Database setup complete!' AS message,
       'You can now test the payment flow' AS next_step;
