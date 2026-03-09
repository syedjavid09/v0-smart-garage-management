-- Update the first user to be an admin
-- Run this AFTER you've signed up with your email

-- Option 1: Make the first registered user an admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1);

-- Option 2: Make a specific user an admin by email
-- Uncomment and replace 'your-email@example.com' with your actual email
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-email@example.com';
