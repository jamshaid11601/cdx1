-- Create custom_orders table for custom request projects
-- This is separate from regular projects to avoid foreign key conflicts

-- Create custom_orders table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_orders_client_id ON public.custom_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_request_id ON public.custom_orders(request_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON public.custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_created_at ON public.custom_orders(created_at DESC);

-- Create updated_at trigger
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

-- Enable Row Level Security
ALTER TABLE public.custom_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_orders

-- Clients can view their own orders
CREATE POLICY "Clients can view own custom orders"
    ON public.custom_orders
    FOR SELECT
    USING (
        client_id IN (
            SELECT id FROM public.clients WHERE user_id = auth.uid()
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins can view all custom orders"
    ON public.custom_orders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert orders
CREATE POLICY "Admins can insert custom orders"
    ON public.custom_orders
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clients can insert their own orders (for payment processing)
CREATE POLICY "Clients can insert own custom orders"
    ON public.custom_orders
    FOR INSERT
    WITH CHECK (
        client_id IN (
            SELECT id FROM public.clients WHERE user_id = auth.uid()
        )
    );

-- Admins can update orders
CREATE POLICY "Admins can update custom orders"
    ON public.custom_orders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Add comment
COMMENT ON TABLE public.custom_orders IS 'Custom orders created from approved custom requests';
