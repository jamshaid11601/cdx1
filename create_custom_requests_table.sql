-- Create custom_requests table for "Start Building" form submissions
-- Run this in Supabase SQL Editor

-- Create custom_requests table
CREATE TABLE IF NOT EXISTS public.custom_requests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  category text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  details text,
  budget text,
  timeline text,
  attachment_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'converted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_requests_user_id ON public.custom_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_requests_status ON public.custom_requests(status);
CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at ON public.custom_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_requests_email ON public.custom_requests(email);

-- Enable RLS
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "custom_requests_insert_policy" ON public.custom_requests;
DROP POLICY IF EXISTS "custom_requests_select_policy" ON public.custom_requests;
DROP POLICY IF EXISTS "custom_requests_update_policy" ON public.custom_requests;

-- Allow anyone (authenticated or not) to insert requests
CREATE POLICY "custom_requests_insert_policy" ON public.custom_requests
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own requests, admins to view all
CREATE POLICY "custom_requests_select_policy" ON public.custom_requests
FOR SELECT
USING (
  -- Admin can see all
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
  OR
  -- Users can see their own
  user_id = auth.uid()
  OR
  -- Allow viewing by email if not logged in
  (auth.uid() IS NULL AND email IS NOT NULL)
);

-- Only admins can update requests
CREATE POLICY "custom_requests_update_policy" ON public.custom_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_custom_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_custom_requests_updated_at_trigger ON public.custom_requests;
CREATE TRIGGER update_custom_requests_updated_at_trigger
BEFORE UPDATE ON public.custom_requests
FOR EACH ROW
EXECUTE FUNCTION update_custom_requests_updated_at();

-- Verify table was created
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'custom_requests'
ORDER BY ordinal_position;
