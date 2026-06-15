-- Migration: Update Notice Categories Check Constraint
-- Target: PostgreSQL (Supabase Compatible)

-- Drop the default inline constraint (usually named notices_category_check)
ALTER TABLE notices DROP CONSTRAINT IF EXISTS notices_category_check;

-- Add the expanded categories constraint
ALTER TABLE notices ADD CONSTRAINT notices_category_check CHECK (category IN (
    'General', 
    'Maintenance', 
    'Emergency', 
    'AGM', 
    'SGM', 
    'Festival', 
    'Security', 
    'Parking', 
    'Water Supply', 
    'Lift Maintenance'
));
