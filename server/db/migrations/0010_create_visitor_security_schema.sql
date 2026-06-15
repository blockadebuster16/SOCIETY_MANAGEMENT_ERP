-- Migration to create visitor & security management schema for Milestone 11

-- 1. Alter check constraint on users role to add 'security'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('public', 'resident', 'tenant', 'shop_owner', 'committee_member', 'society_manager', 'super_admin', 'security'));

-- 2. Create gate_passes table (Pre-approvals)
CREATE TABLE gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    resident_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    pass_code VARCHAR(50) UNIQUE NOT NULL,
    visitor_name VARCHAR(200) NOT NULL,
    visitor_phone VARCHAR(20) NOT NULL,
    visitor_type VARCHAR(50) DEFAULT 'Guest' NOT NULL CHECK (visitor_type IN ('Guest', 'Delivery', 'Staff', 'Other')),
    purpose VARCHAR(255),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Used', 'Expired', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Create visitor_entries table (Physical entries/logs)
CREATE TABLE visitor_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    gate_pass_id UUID REFERENCES gate_passes(id) ON DELETE SET NULL,
    visitor_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(50),
    visitor_type VARCHAR(50) DEFAULT 'Guest' NOT NULL CHECK (visitor_type IN ('Guest', 'Delivery', 'Staff', 'Other')),
    purpose VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Checked-In' NOT NULL CHECK (status IN ('Checked-In', 'Checked-Out', 'Denied')),
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    checked_out_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES users(id) ON DELETE SET NULL,
    checked_out_by UUID REFERENCES users(id) ON DELETE SET NULL,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 4. Create security_logs table (Operational security notes)
CREATE TABLE security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    logged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    log_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General' NOT NULL CHECK (category IN ('General', 'Incident', 'Shift-Change', 'Gate-Status', 'Emergency')),
    severity VARCHAR(50) DEFAULT 'Info' NOT NULL CHECK (severity IN ('Info', 'Warning', 'Critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Create index optimizations
CREATE INDEX idx_gate_passes_property ON gate_passes(property_id);
CREATE INDEX idx_gate_passes_resident ON gate_passes(resident_id);
CREATE INDEX idx_gate_passes_code ON gate_passes(pass_code);
CREATE INDEX idx_visitor_entries_visitor ON visitor_entries(visitor_id);
CREATE INDEX idx_visitor_entries_property ON visitor_entries(property_id);
CREATE INDEX idx_visitor_entries_gate_pass ON visitor_entries(gate_pass_id);
CREATE INDEX idx_visitor_entries_checked_in_by ON visitor_entries(checked_in_by);
CREATE INDEX idx_visitor_entries_checked_out_by ON visitor_entries(checked_out_by);
CREATE INDEX idx_visitor_entries_status ON visitor_entries(status);
CREATE INDEX idx_security_logs_logged_by ON security_logs(logged_by);
CREATE INDEX idx_security_logs_category ON security_logs(category);

-- 6. Enable RLS
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- gate_passes
CREATE POLICY "Residents read own gate passes" ON gate_passes FOR SELECT
USING (resident_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Residents create own gate passes" ON gate_passes FOR INSERT
WITH CHECK (resident_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Residents update own gate passes" ON gate_passes FOR UPDATE
USING (resident_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()))
WITH CHECK (resident_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Admins/Security view all gate passes" ON gate_passes FOR SELECT
USING (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin', 'security'));

-- visitor_entries
CREATE POLICY "Admins/Security manage visitor entries" ON visitor_entries FOR ALL
USING (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin', 'security'))
WITH CHECK (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin', 'security'));

CREATE POLICY "Residents view visitor entries for own properties" ON visitor_entries FOR SELECT
USING (property_id IN (
    SELECT property_id FROM property_owners WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid())
    UNION
    SELECT property_id FROM tenants WHERE user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()) AND is_active = true
));

-- security_logs
CREATE POLICY "Admins/Security view security logs" ON security_logs FOR SELECT
USING (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin', 'security'));

CREATE POLICY "Security/Admins insert security logs" ON security_logs FOR INSERT
WITH CHECK (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin', 'security'));

-- 8. Seed visitor notification templates
INSERT INTO notification_templates (template_name, subject_template, body_template) VALUES
(
  'visitor_check_in',
  'Visitor Checked In: {{visitor_name}}',
  'Dear Resident, your visitor "{{visitor_name}}" ({{visitor_type}}) has checked in at the main gate at {{time}}. Vehicle: {{vehicle_number}}. Remarks: {{remarks}}'
),
(
  'visitor_check_out',
  'Visitor Checked Out: {{visitor_name}}',
  'Dear Resident, your visitor "{{visitor_name}}" has checked out from the society gate at {{time}}. Remarks: {{remarks}}'
);
