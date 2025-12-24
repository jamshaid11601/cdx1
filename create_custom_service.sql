-- Alternative solution: Create a placeholder service for custom requests
-- This ensures we always have a valid service_id

-- Create a special "Custom Request" service
INSERT INTO public.services (id, title, description, price, category, features, status)
VALUES (
    '00000000-0000-0000-0000-000000000001', -- Fixed UUID for custom requests
    'Custom Request Project',
    'Project created from a custom client request',
    0, -- Price is determined by the custom request
    'custom',
    ARRAY['Custom scope', 'Flexible timeline', 'Tailored solution'],
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Now update the code to use this service_id instead of null
-- This avoids the foreign key constraint issue entirely
