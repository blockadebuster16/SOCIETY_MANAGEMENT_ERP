-- Migration script: 0011_enterprise_upgrade.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- MODULE 1: SECURITY DASHBOARD TABLES
-- =========================================================================

-- Security Incident Register (Separate from resident complaints)
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL, -- guard, supervisor, or resident
    category VARCHAR(50) NOT NULL CHECK (category IN ('Security Breach', 'Suspicious Activity', 'Medical Emergency', 'Parking Issue', 'Power Failure', 'Lift Breakdown', 'Water Leakage', 'Fire Incident', 'Other')),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Investigating', 'Resolved', 'Closed')),
    priority VARCHAR(10) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Gate Passes for material/renovations/furniture movements
CREATE TABLE IF NOT EXISTS gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pass_type VARCHAR(30) NOT NULL CHECK (pass_type IN ('Furniture Movement', 'Renovation Material', 'Appliance Delivery', 'Contractor Entry', 'Other')),
    visitor_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(100),
    vehicle_number VARCHAR(20),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Used', 'Expired')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extended Vehicle Gate Logs
CREATE TABLE IF NOT EXISTS vehicle_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('2-Wheeler', '4-Wheeler', 'Commercial', 'Other')),
    ownership_type VARCHAR(20) NOT NULL CHECK (ownership_type IN ('Resident', 'Visitor', 'Vendor', 'Delivery')),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL, -- Null if vendor or general visitor
    driver_name VARCHAR(100),
    phone VARCHAR(20),
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    entered_by_guard UUID NOT NULL REFERENCES users(id),
    exited_by_guard UUID REFERENCES users(id),
    remarks TEXT
);

-- Delivery Tracking Logs
CREATE TABLE IF NOT EXISTS delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    partner VARCHAR(30) NOT NULL CHECK (partner IN ('Swiggy', 'Zomato', 'Amazon', 'Flipkart', 'Blinkit', 'Courier', 'Other')),
    delivery_person_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    vehicle_number VARCHAR(20),
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    entered_by_guard UUID NOT NULL REFERENCES users(id),
    exited_by_guard UUID REFERENCES users(id)
);

-- =========================================================================
-- MODULE 2: NOTIFICATION CENTER
-- =========================================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trigger_name VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'notice_published'
    subject_template VARCHAR(200) NOT NULL,
    body_template TEXT NOT NULL,
    channels VARCHAR(20)[] NOT NULL, -- Array: 'in_app', 'email', 'whatsapp', 'sms'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notification Logs (Queue/Audit Trail)
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('In-App', 'Email', 'WhatsApp', 'SMS')),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Sent', 'Failed')),
    subject TEXT,
    body TEXT NOT NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- MODULE 3: VENDOR MANAGEMENT SYSTEM
-- =========================================================================

-- Master Vendors Registry
CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    company_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Electrician', 'Plumber', 'Lift Contractor', 'Housekeeping', 'Security Agency', 'Fire Safety Vendor', 'Water Tank Vendor', 'Civil Contractor', 'Internet Provider', 'Other')),
    contact_person VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    emergency_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Annual Maintenance Contracts (AMC)
CREATE TABLE IF NOT EXISTS vendor_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL CHECK (end_date >= start_date),
    contract_amount NUMERIC(12, 2) NOT NULL CHECK (contract_amount >= 0),
    payment_terms TEXT,
    auto_renew BOOLEAN DEFAULT FALSE,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendor Performance Reviews
CREATE TABLE IF NOT EXISTS vendor_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    rated_by UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- MODULE 4: SOCIETY ASSET MANAGEMENT
-- =========================================================================

-- Assets Register
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Lift', 'Water Pump', 'Generator', 'Fire Equipment', 'CCTV', 'Intercom', 'Water Tanks', 'Garden Equipment', 'Solar Panels', 'Other')),
    purchase_date DATE,
    purchase_cost NUMERIC(12, 2) CHECK (purchase_cost >= 0),
    warranty_expiry DATE,
    amc_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    amc_expiry DATE,
    current_value NUMERIC(12, 2),
    depreciation_rate_annual NUMERIC(5, 2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'Under Service', 'Faulty', 'Scrapped')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Service & Repair Logs
CREATE TABLE IF NOT EXISTS asset_service_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN ('Routine Maintenance', 'Emergency Repair', 'Warranty Inspection', 'AMC Checkup')),
    technician_name VARCHAR(100),
    cost NUMERIC(12, 2) DEFAULT 0.00 CHECK (cost >= 0),
    description TEXT NOT NULL,
    parts_replaced TEXT,
    next_service_due DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- MODULE 5: MEETING MANAGEMENT SYSTEM
-- =========================================================================

-- Meetings Register
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    meeting_type VARCHAR(30) NOT NULL CHECK (meeting_type IN ('AGM', 'SGM', 'Committee Meeting', 'Vendor Meeting', 'Emergency Meeting')),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    agenda TEXT[] NOT NULL, -- Array of agenda topics
    minutes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Attendance checklist
CREATE TABLE IF NOT EXISTS meeting_attendees (
    meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) NOT NULL DEFAULT 'Absent' CHECK (attendance_status IN ('Present', 'Absent', 'Excused')),
    remarks VARCHAR(255),
    PRIMARY KEY (meeting_id, user_id)
);

-- Resolutions passed in meeting
CREATE TABLE IF NOT EXISTS meeting_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    resolution_number VARCHAR(30) UNIQUE NOT NULL,
    topic VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    voting_for INTEGER DEFAULT 0,
    voting_against INTEGER DEFAULT 0,
    voting_abstained INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Approved' CHECK (status IN ('Approved', 'Rejected', 'Deferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Action Items assigned from meeting
CREATE TABLE IF NOT EXISTS meeting_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    due_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- MODULE 6: DIGITAL VOTING SYSTEM
-- =========================================================================

-- Voting Session
CREATE TABLE IF NOT EXISTS voting_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    session_type VARCHAR(30) NOT NULL CHECK (session_type IN ('Committee Election', 'Redevelopment Voting', 'Special Resolution', 'Budget Approval')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL CHECK (end_time > start_time),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Closed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Options/Candidates on the ballot
CREATE TABLE IF NOT EXISTS voting_ballots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    option_title VARCHAR(150) NOT NULL,
    option_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Votes (Highly audited to guarantee anonymity and double-voting prevention)
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    ballot_id UUID NOT NULL REFERENCES voting_ballots(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ledger registering who voted, to prevent double voting WITHOUT exposing the choice
CREATE TABLE IF NOT EXISTS voting_ledger (
    session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (session_id, user_id)
);

-- =========================================================================
-- MODULE 7: PROPERTY-CENTRIC REDESIGN MODIFICATIONS
-- =========================================================================

-- Ensure COMPLAINTS has property_id and user_id is set to filer
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Verify DOCUMENTS matches property-centric scope if it concerns a flat
ALTER TABLE documents ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE CASCADE;

-- Scoped notices to support residential vs commercial targeting
ALTER TABLE notices ADD COLUMN IF NOT EXISTS target_unit_type VARCHAR(20) DEFAULT 'ALL' CHECK (target_unit_type IN ('ALL', 'Residential', 'Commercial'));

-- =========================================================================
-- INDEXING STRATEGY
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_sec_incident_soc ON security_incidents(society_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_prop ON gate_passes(property_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_logs_num ON vehicle_logs(vehicle_number);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_prop ON delivery_logs(property_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_soc ON assets(society_id);
CREATE INDEX IF NOT EXISTS idx_meetings_soc ON meetings(society_id);
CREATE INDEX IF NOT EXISTS idx_resolutions_meet ON meeting_resolutions(meeting_id);
