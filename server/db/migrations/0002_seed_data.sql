-- Seed Migration: Suyash Pride Housing Society Ltd. Database Seeds
-- Target: PostgreSQL (Supabase Compatible)

DO $$
DECLARE
    v_society_id UUID;
    v_wing_a_id UUID;
    v_wing_b_id UUID;
    v_wing_c_id UUID;
    v_wing_d_id UUID;
    
    -- Loop Variables
    v_wing_id UUID;
    v_wing_name VARCHAR(10);
    v_floor INT;
    v_unit INT;
    v_unit_no VARCHAR(20);
    
    -- User ID Variables
    v_user_parth_id UUID;
    v_user_rohan_id UUID;
    v_user_sec_id UUID;
    v_user_tres_id UUID;
    v_user_sa_id UUID;
    
    -- Property ID Variables
    v_prop_a102_id UUID;
    v_prop_b101_id UUID;
BEGIN
    -- 1. Insert Society Info (Suyash Pride Ulwe Raigad)
    INSERT INTO societies (name, registration_number, address, city, state, pincode, latitude, longitude, email, phone, website)
    VALUES (
        'Suyash Pride Housing Society Ltd.',
        'MHR/NAVI-MUM/HS/12345/2026',
        'Plot-1, Sector-5, Ulwe Node, Wahal, Raigad District',
        'Navi Mumbai',
        'Maharashtra',
        '410206',
        18.966900,
        73.020300,
        'management@suyashpride.in',
        '+91 22 2345 6789',
        'www.suyashpride.in'
    )
    RETURNING id INTO v_society_id;

    -- 2. Insert 4 Wings (A, B, C, D)
    INSERT INTO wings (society_id, wing_name, description) VALUES (v_society_id, 'Wing A', 'Residential Tower Wing A') RETURNING id INTO v_wing_a_id;
    INSERT INTO wings (society_id, wing_name, description) VALUES (v_society_id, 'Wing B', 'Residential Tower Wing B') RETURNING id INTO v_wing_b_id;
    INSERT INTO wings (society_id, wing_name, description) VALUES (v_society_id, 'Wing C', 'Residential Tower Wing C') RETURNING id INTO v_wing_c_id;
    INSERT INTO wings (society_id, wing_name, description) VALUES (v_society_id, 'Wing D', 'Residential/Commercial Tower Wing D') RETURNING id INTO v_wing_d_id;

    -- 3. Loop to generate 112 Residential Units (Floors 1 to 7, 4 flats per floor, across Wings A, B, C, D)
    -- Total = 4 Wings * 7 Floors * 4 Flats = 112 Flats
    FOR v_wing_name, v_wing_id IN 
        SELECT 'A', v_wing_a_id UNION ALL
        SELECT 'B', v_wing_b_id UNION ALL
        SELECT 'C', v_wing_c_id UNION ALL
        SELECT 'D', v_wing_d_id
    LOOP
        FOR v_floor IN 1..7 LOOP
            FOR v_unit IN 1..4 LOOP
                v_unit_no := v_wing_name || '-' || (v_floor * 100 + v_unit);
                INSERT INTO properties (society_id, wing_id, unit_number, unit_type, floor_number, area_sqft, ownership_status, status)
                VALUES (
                    v_society_id,
                    v_wing_id,
                    v_unit_no,
                    'Residential',
                    v_floor,
                    1050.00, -- Standard 2BHK area
                    'Owner Occupied',
                    'Active'
                );
            END LOOP;
        END LOOP;
    END LOOP;

    -- 4. Loop to generate 25 Commercial Units (Ground Floor, Floor 0, Wing D / General Ground floor)
    FOR v_unit IN 1..25 LOOP
        v_unit_no := 'S-' || LPAD(v_unit::text, 2, '0');
        INSERT INTO properties (society_id, wing_id, unit_number, unit_type, floor_number, area_sqft, ownership_status, status)
        VALUES (
            v_society_id,
            v_wing_d_id,
            v_unit_no,
            'Commercial',
            0,
            450.00, -- Standard commercial shop area
            'Owner Occupied',
            'Active'
        );
    END LOOP;

    -- 5. Seed Core Portal Profiles (Users Table)
    -- Sample Resident Parth Patel
    INSERT INTO users (auth_user_id, first_name, last_name, email, phone, role, status)
    VALUES ('a3f12b67-d9b8-4c91-9b56-f0a86001b3d1', 'Parth', 'Patel', 'parth@suyashpride.in', '+91 98765 43210', 'resident', 'Active')
    RETURNING id INTO v_user_parth_id;

    -- Sample Resident Rohan Sharma
    INSERT INTO users (auth_user_id, first_name, last_name, email, phone, role, status)
    VALUES ('b4e23c78-e0c9-5d92-0c67-a1b97002c4e2', 'Rohan', 'Sharma', 'rohan@suyashpride.in', '+91 91234 56780', 'resident', 'Active')
    RETURNING id INTO v_user_rohan_id;

    -- Sample Committee Secretary
    INSERT INTO users (auth_user_id, first_name, last_name, email, phone, role, status)
    VALUES ('c5f34d89-f1d0-6e03-1d78-b2c08003d5f3', 'Amit', 'Joshi', 'secretary@suyashpride.in', '+91 92223 34455', 'committee_member', 'Active')
    RETURNING id INTO v_user_sec_id;

    -- Sample Committee Treasurer
    INSERT INTO users (auth_user_id, first_name, last_name, email, phone, role, status)
    VALUES ('d6a45e90-02e1-7f14-2e89-c3d19004e6f4', 'Suresh', 'Mehta', 'treasurer@suyashpride.in', '+91 93334 45566', 'committee_member', 'Active')
    RETURNING id INTO v_user_tres_id;

    -- Sample System SuperAdmin
    INSERT INTO users (auth_user_id, first_name, last_name, email, phone, role, status)
    VALUES ('e7b56f01-13f2-8f25-3f90-d4e20005f7f5', 'Root', 'Developer', 'superadmin@suyashpride.in', '+91 94445 56677', 'super_admin', 'Active')
    RETURNING id INTO v_user_sa_id;

    -- 6. Link Owners to Units
    -- Retrieve property ID for Flat A-102
    SELECT id INTO v_prop_a102_id FROM properties WHERE unit_number = 'A-102';
    INSERT INTO property_owners (property_id, user_id, ownership_percentage, is_primary_owner)
    VALUES (v_prop_a102_id, v_user_parth_id, 100.00, true);

    -- Retrieve property ID for Flat B-101
    SELECT id INTO v_prop_b101_id FROM properties WHERE unit_number = 'B-101';
    INSERT INTO property_owners (property_id, user_id, ownership_percentage, is_primary_owner)
    VALUES (v_prop_b101_id, v_user_rohan_id, 100.00, true);

END $$;
