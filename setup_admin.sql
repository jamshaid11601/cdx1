-- ============================================
-- STEP 1: Create Admin User Manually
-- ============================================
-- Since we can't create auth.users directly via SQL,
-- you'll need to sign up manually with these credentials:
-- Email: admin@codexier.com
-- Password: Admin@123456
-- Then run the rest of this script to make that user an admin

-- ============================================
-- STEP 2: Update User to Admin Role
-- ============================================
-- After signing up with admin@codexier.com, run this to make them admin:
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@codexier.com';

-- ============================================
-- STEP 3: Verify Admin User
-- ============================================
SELECT id, email, full_name, role, created_at 
FROM public.users 
WHERE email = 'admin@codexier.com';

-- ============================================
-- ALTERNATIVE: If you want to use a different email
-- ============================================
-- 1. Sign up with your preferred email/password
-- 2. Replace 'admin@codexier.com' with your email in the UPDATE query above
-- 3. Run the UPDATE and SELECT queries
