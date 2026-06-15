-- Initial Migration: Suyash Pride Housing Society Ltd. Portal Schema
-- Target: PostgreSQL (Supabase Compatible)

-- ============================================================================
-- 1. EXTENSIONS & CUSTOM FUNCTIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Support for chatbot embeddings

-- Trigger function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. TABLES DEFINITIONS
-- ============================================================================

-- 1. societies
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. wings
CREATE TABLE wings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    wing_name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_wing_per_society UNIQUE (society_id, wing_name)
);

-- 3. properties
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id UUID REFERENCES societies(id) ON DELETE CASCADE NOT NULL,
    wing_id UUID REFERENCES wings(id) ON DELETE SET NULL,
    unit_number VARCHAR(20) NOT NULL,
    unit_type VARCHAR(50) DEFAULT 'Residential' NOT NULL CHECK (unit_type IN ('Residential', 'Commercial', 'Office')),
    floor_number INTEGER NOT NULL,
    area_sqft NUMERIC(10, 2) NOT NULL CHECK (area_sqft > 0),
    ownership_status VARCHAR(50) DEFAULT 'Owner Occupied' NOT NULL CHECK (ownership_status IN ('Owner Occupied', 'Rented', 'Vacant')),
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Under Maintenance', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_unit_per_wing UNIQUE (wing_id, unit_number)
);

-- 4. users (Profiles extending Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Connects to Supabase auth.users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(550),
    role VARCHAR(50) DEFAULT 'resident' NOT NULL CHECK (role IN ('public', 'resident', 'tenant', 'shop_owner', 'committee_member', 'society_manager', 'super_admin')),
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Active', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. property_owners
CREATE TABLE property_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    ownership_percentage NUMERIC(5, 2) DEFAULT 100.00 NOT NULL CHECK (ownership_percentage BETWEEN 0 AND 100),
    is_primary_owner BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_owner_per_property UNIQUE (property_id, user_id)
);

-- 6. tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    lease_start DATE NOT NULL,
    lease_end DATE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT check_lease_dates CHECK (lease_end > lease_start)
);

-- 7. family_members
CREATE TABLE family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    relation VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. vehicles
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('Car', 'Bike', 'EV', 'Commercial')),
    parking_slot VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. parking_slots
CREATE TABLE parking_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_number VARCHAR(50) UNIQUE NOT NULL,
    slot_type VARCHAR(50) DEFAULT 'Car' NOT NULL CHECK (slot_type IN ('Car', 'Bike', 'EV Charging')),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Occupied' NOT NULL CHECK (status IN ('Available', 'Occupied', 'Reserved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. notices
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'General' NOT NULL CHECK (category IN ('General', 'Maintenance', 'Emergency', 'AGM', 'SGM', 'Festival', 'Security')),
    attachment_url VARCHAR(550),
    published_by UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Draft', 'Active', 'Archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. document_categories
CREATE TABLE document_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- 12. documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(550) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 13. events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    event_location VARCHAR(255) NOT NULL,
    cover_image VARCHAR(550),
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Postponed', 'Cancelled', 'Completed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 14. event_registrations
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_registration UNIQUE (event_id, user_id)
);

-- 15. complaints
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Open' NOT NULL CHECK (status IN ('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed')),
    priority VARCHAR(50) DEFAULT 'Medium' NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 16. complaint_comments
CREATE TABLE complaint_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 17. maintenance_bills
CREATE TABLE maintenance_bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    billing_month VARCHAR(20) NOT NULL,
    billing_year INTEGER NOT NULL CHECK (billing_year > 2000),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Unpaid' NOT NULL CHECK (status IN ('Unpaid', 'Paid', 'Partially Paid', 'Overdue')),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT unique_bill_cycle UNIQUE (property_id, billing_month, billing_year)
);

-- 18. maintenance_receipts
CREATE TABLE maintenance_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES maintenance_bills(id) ON DELETE CASCADE NOT NULL,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Online' NOT NULL CHECK (payment_method IN ('Online', 'Cash', 'Cheque', 'Bank Transfer'))
);

-- 19. payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    purpose VARCHAR(255) NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Success', 'Failed')),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 20. visitors
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    visitor_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_number VARCHAR(50),
    expected_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'Expected' NOT NULL CHECK (status IN ('Expected', 'Checked In', 'Checked Out', 'Denied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 21. staff
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    joining_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Terminated', 'Suspended'))
);

-- 22. vendors
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active' NOT NULL CHECK (status IN ('Active', 'Inactive'))
);

-- 23. gallery_albums
CREATE TABLE gallery_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 24. gallery_images
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE NOT NULL,
    image_url VARCHAR(550) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 25. chatbot_documents
CREATE TABLE chatbot_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    embedding_status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (embedding_status IN ('Pending', 'Indexed', 'Error')),
    last_indexed_at TIMESTAMP WITH TIME ZONE
);

-- 26. audit_logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- 3. INDEXING STRATEGY (PERFORMANCE OPTIMIZATIONS)
-- ============================================================================

-- B-Tree indexes on foreign keys for optimization
CREATE INDEX idx_wings_society ON wings(society_id);
CREATE INDEX idx_properties_society ON properties(society_id);
CREATE INDEX idx_properties_wing ON properties(wing_id);
CREATE INDEX idx_owners_property ON property_owners(property_id);
CREATE INDEX idx_owners_user ON property_owners(user_id);
CREATE INDEX idx_tenants_property ON tenants(property_id);
CREATE INDEX idx_tenants_user ON tenants(user_id);
CREATE INDEX idx_notices_published ON notices(published_by);
CREATE INDEX idx_documents_category ON documents(category_id);
CREATE INDEX idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX idx_event_reg_user ON event_registrations(user_id);
CREATE INDEX idx_complaints_property ON complaints(property_id);
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_bills_property ON maintenance_bills(property_id);
CREATE INDEX idx_receipts_bill ON maintenance_receipts(bill_id);
CREATE INDEX idx_payments_property ON payments(property_id);
CREATE INDEX idx_payments_user ON payments(user_id);

-- Partial Indexes for highly filtered states
CREATE INDEX idx_tenants_active ON tenants(property_id) WHERE is_active = true;
CREATE INDEX idx_bills_unpaid ON maintenance_bills(property_id) WHERE status = 'Unpaid';
CREATE INDEX idx_complaints_open ON complaints(status) WHERE status IN ('Open', 'Assigned', 'In Progress');

-- ============================================================================
-- 4. TIMESTAMPS TRIGGERS
-- ============================================================================
CREATE TRIGGER trigger_update_societies_timestamp BEFORE UPDATE ON societies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_update_complaints_timestamp BEFORE UPDATE ON complaints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all key tables
ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to resolve role of logged-in user profile
CREATE OR REPLACE FUNCTION get_user_role(auth_uid UUID)
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role FROM users WHERE auth_user_id = auth_uid;
    RETURN COALESCE(user_role, 'public');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Societies policies
CREATE POLICY "Public read societies" ON societies FOR SELECT USING (true);
CREATE POLICY "Admin update societies" ON societies FOR UPDATE 
WITH CHECK (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin'));

-- Properties policies
CREATE POLICY "Users read properties" ON properties FOR SELECT USING (true);
CREATE POLICY "Admin manage properties" ON properties FOR ALL 
WITH CHECK (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin'));

-- Notices policies
CREATE POLICY "Anyone read active notices" ON notices FOR SELECT USING (status = 'Active');
CREATE POLICY "Admin manage notices" ON notices FOR ALL 
WITH CHECK (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin'));

-- Complaints policies
CREATE POLICY "Users read own complaints" ON complaints FOR SELECT 
USING (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users create complaints" ON complaints FOR INSERT 
WITH CHECK (user_id = (SELECT id FROM users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admin view all complaints" ON complaints FOR SELECT 
USING (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin'));
CREATE POLICY "Admin manage complaints status" ON complaints FOR UPDATE 
WITH CHECK (get_user_role(auth.uid()) IN ('committee_member', 'society_manager', 'super_admin'));
