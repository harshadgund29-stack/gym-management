-- ============================================================
-- Sample Data for Testing
-- Admin password = "123456"
-- Other passwords = "password123"
-- ============================================================

USE gym_management;

-- ============================================================
-- Users (1 Admin, 2 Trainers, 3 Members)
-- Admin: admin@gmail.com / 123456
-- Others: password123
-- BCrypt hash for "123456":
--   $2a$10$qpki1DXjLMF3pmsg/poiM.F0rr9ttc5.S7WtSM1.5AgwVLV9zRjFy
-- BCrypt hash for "password123":
--   $2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W
-- ============================================================
INSERT INTO users (first_name, last_name, email, password, role, phone, address) VALUES
('Admin',   'User',    'admin@gmail.com', '$2a$10$qpki1DXjLMF3pmsg/poiM.F0rr9ttc5.S7WtSM1.5AgwVLV9zRjFy', 'ADMIN',   '555-0001', '1 Admin Street'),
('John',    'Trainer', 'john@gym.com',    '$2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W', 'TRAINER', '555-0002', '2 Trainer Ave'),
('Sarah',   'Coach',   'sarah@gym.com',   '$2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W', 'TRAINER', '555-0003', '3 Coach Blvd'),
('Alice',   'Member',  'alice@gym.com',   '$2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W', 'MEMBER',  '555-0004', '4 Member Lane'),
('Bob',     'Smith',   'bob@gym.com',     '$2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W', 'MEMBER',  '555-0005', '5 Fitness Road'),
('Charlie', 'Brown',   'charlie@gym.com', '$2a$10$qP8ZYKx84XaEk5PKuIKZNOtF6dG9aWgOaJObSy6nAD/KfxPRMJn7W', 'MEMBER',  '555-0006', '6 Gym Street');

-- ============================================================
-- Membership Plans
-- ============================================================
INSERT INTO membership_plans (name, description, price, duration_months, features, active) VALUES
('Basic',   'Access to gym floor and basic equipment',          29.99,  1, 'Gym Access,Locker Room,Basic Equipment',          TRUE),
('Premium', 'Full access including classes and pool',           59.99,  1, 'Gym Access,All Classes,Pool,Sauna,Locker Room',   TRUE),
('VIP',     'Unlimited access with personal trainer sessions',  99.99,  1, 'All Premium Features,Personal Trainer,Nutrition Plan,Priority Booking', TRUE),
('Annual',  'Best value - 12 months at a discounted rate',     499.99, 12, 'All Premium Features,Free Guest Passes,Merchandise Discount', TRUE);

-- ============================================================
-- Memberships
-- ============================================================
INSERT INTO memberships (member_id, plan_id, start_date, end_date, status) VALUES
(4, 2, '2026-01-01', '2026-02-01', 'ACTIVE'),
(5, 1, '2026-01-15', '2026-02-15', 'ACTIVE'),
(6, 3, '2026-02-01', '2026-03-01', 'ACTIVE');

-- ============================================================
-- Payments
-- ============================================================
INSERT INTO payments (member_id, membership_id, amount, status, payment_method, transaction_id) VALUES
(4, 1, 59.99, 'COMPLETED', 'CREDIT_CARD', 'TXN-001'),
(5, 2, 29.99, 'COMPLETED', 'CASH',        'TXN-002'),
(6, 3, 99.99, 'COMPLETED', 'ONLINE',      'TXN-003');

-- ============================================================
-- Training Sessions
-- ============================================================
INSERT INTO training_sessions (trainer_id, member_id, title, description, session_date, duration_minutes, status) VALUES
(2, 4, 'Cardio Blast',      'High intensity cardio workout',    '2026-05-20 09:00:00', 60, 'SCHEDULED'),
(2, 5, 'Strength Training', 'Upper body strength session',      '2026-05-21 10:00:00', 45, 'SCHEDULED'),
(3, 6, 'Yoga & Flexibility','Morning yoga and stretching',      '2026-05-22 07:00:00', 60, 'SCHEDULED'),
(2, 4, 'Core Workout',      'Abs and core strengthening',       '2026-05-15 09:00:00', 45, 'COMPLETED');

-- ============================================================
-- Workout Plans
-- ============================================================
INSERT INTO workout_plans (trainer_id, member_id, title, description, exercises, goal, week_duration) VALUES
(2, 4, 'Alice Weight Loss Plan',
 'Designed to help Alice lose 5kg in 8 weeks',
 'Monday: 30min run + squats\nWednesday: Cycling + lunges\nFriday: HIIT + plank',
 'Lose 5kg', 8),
(3, 6, 'Charlie Muscle Building',
 'Progressive overload program for muscle gain',
 'Day 1: Chest & Triceps\nDay 2: Back & Biceps\nDay 3: Legs\nDay 4: Shoulders',
 'Gain 3kg muscle', 12);
