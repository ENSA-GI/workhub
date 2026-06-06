-- Update seed users to have email_verified = true and set a password
UPDATE users
SET email_verified = true,
    password = crypt('password123', gen_salt('bf', 10))
WHERE email IN ('admin@workhub.com', 'youssef@techvision.ma', 'fatima@techvision.ma', 'mohammed@techvision.ma');
