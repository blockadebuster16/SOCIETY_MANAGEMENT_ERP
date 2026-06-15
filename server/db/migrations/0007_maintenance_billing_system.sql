-- Migration to implement Milestone 8B: Maintenance Billing System

-- Drop conflicting old tables if they exist
DROP TABLE IF EXISTS maintenance_receipts CASCADE;
DROP TABLE IF EXISTS maintenance_bills CASCADE;

-- 1. Create billing_cycles table
CREATE TABLE billing_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' NOT NULL CHECK (status IN ('Draft', 'Generated', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create bill_templates table
CREATE TABLE bill_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) NOT NULL,
    unit_type VARCHAR(50) NOT NULL CHECK (unit_type IN ('Residential', 'Commercial')),
    base_charge_sqft NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    fixed_charge NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    sinking_fund NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    repair_fund NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    water_charges NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    parking_charges NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Create late_fee_rules table
CREATE TABLE late_fee_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    rate_percent NUMERIC(5, 2) NOT NULL,
    grace_period_days INTEGER DEFAULT 0 NOT NULL,
    charge_type VARCHAR(50) DEFAULT 'Percentage' NOT NULL CHECK (charge_type IN ('Percentage', 'Fixed')),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Create discount_rules table
CREATE TABLE discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    rate_percent NUMERIC(5, 2) NOT NULL,
    days_before_due INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Create maintenance_bills table
CREATE TABLE maintenance_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE RESTRICT NOT NULL,
    cycle_id UUID REFERENCES billing_cycles(id) ON DELETE RESTRICT NOT NULL,
    bill_number VARCHAR(100) UNIQUE NOT NULL,
    base_amount NUMERIC(12, 2) NOT NULL CHECK (base_amount >= 0),
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (tax_amount >= 0),
    penalty_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (penalty_amount >= 0),
    discount_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (discount_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid' NOT NULL CHECK (status IN ('Unpaid', 'Paid', 'Partially Paid', 'Overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_property_cycle UNIQUE (property_id, cycle_id)
);

-- Attach updated_at trigger to maintenance_bills
CREATE TRIGGER update_maintenance_bills_updated_at
BEFORE UPDATE ON maintenance_bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Create bill_items table
CREATE TABLE bill_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES maintenance_bills(id) ON DELETE CASCADE NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Create receipts table
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE RESTRICT NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('Razorpay', 'Cash', 'Cheque', 'Bank Transfer')),
    reference_number VARCHAR(150),
    amount_received NUMERIC(12, 2) NOT NULL CHECK (amount_received > 0),
    received_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Create payment_allocations table
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE NOT NULL,
    bill_id UUID REFERENCES maintenance_bills(id) ON DELETE CASCADE NOT NULL,
    allocated_amount NUMERIC(12, 2) NOT NULL CHECK (allocated_amount > 0),
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Seed default billing templates and rules
INSERT INTO bill_templates (template_name, unit_type, base_charge_sqft, fixed_charge, sinking_fund, repair_fund, water_charges, parking_charges) VALUES
('Standard Residential Template', 'Residential', 2.50, 500.00, 350.00, 350.00, 300.00, 200.00),
('Standard Commercial Template', 'Commercial', 0.00, 3000.00, 500.00, 500.00, 500.00, 500.00);

INSERT INTO late_fee_rules (rule_name, rate_percent, grace_period_days, charge_type) VALUES
('Standard 15% Interest', 15.00, 5, 'Percentage');

INSERT INTO discount_rules (rule_name, rate_percent, days_before_due) VALUES
('Early Payment 2% Discount', 2.00, 5);
