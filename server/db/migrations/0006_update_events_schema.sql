-- Migration to update events schema matching Milestone 7 requirements

-- 1. Alter events table
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'Draft';
ALTER TABLE events ADD CONSTRAINT events_status_check CHECK (status IN ('Draft', 'Published', 'Cancelled', 'Completed'));

-- Rename event_location to location
ALTER TABLE events RENAME COLUMN event_location TO location;

-- Alter event_date type to DATE
ALTER TABLE events ALTER COLUMN event_date TYPE DATE;

-- Add event_type with check constraints
ALTER TABLE events ADD COLUMN event_type VARCHAR(100) DEFAULT 'Other' NOT NULL CONSTRAINT events_event_type_check CHECK (event_type IN ('AGM', 'SGM', 'Festival', 'Sports', 'Cultural', 'Maintenance', 'Emergency Meeting', 'Vendor Meeting', 'Workshop', 'Other'));

-- Add start_time and end_time
ALTER TABLE events ADD COLUMN start_time TIME DEFAULT '00:00:00' NOT NULL;
ALTER TABLE events ADD COLUMN end_time TIME DEFAULT '23:59:59' NOT NULL;

-- Add max_attendees limit and updated_at tracking
ALTER TABLE events ADD COLUMN max_attendees INTEGER CHECK (max_attendees > 0);
ALTER TABLE events ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Attach updated_at trigger to events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


-- 2. Alter event_registrations table
ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS unique_registration;

-- Rename user_id to resident_id
ALTER TABLE event_registrations RENAME COLUMN user_id TO resident_id;

-- Add updated unique constraint
ALTER TABLE event_registrations ADD CONSTRAINT unique_registration UNIQUE (event_id, resident_id);

-- Add registration_status with checks
ALTER TABLE event_registrations ADD COLUMN registration_status VARCHAR(50) DEFAULT 'Registered' NOT NULL CHECK (registration_status IN ('Registered', 'Cancelled', 'Attended'));


-- 3. Create event_gallery table
CREATE TABLE event_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    image_url VARCHAR(550) NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
