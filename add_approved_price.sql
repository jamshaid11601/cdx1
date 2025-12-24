-- Add approved_price column to custom_requests table
ALTER TABLE public.custom_requests
ADD COLUMN IF NOT EXISTS approved_price DECIMAL(10,2);

-- Add comment
COMMENT ON COLUMN public.custom_requests.approved_price IS 'Price set by admin when approving the request';
