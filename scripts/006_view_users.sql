-- View all users and their roles
SELECT 
  id,
  email,
  full_name,
  role,
  phone,
  created_at
FROM profiles
ORDER BY created_at DESC;
