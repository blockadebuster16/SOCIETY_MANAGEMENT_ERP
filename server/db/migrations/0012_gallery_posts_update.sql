-- Update gallery_albums to support scheduling and statuses (acting as posts)
ALTER TABLE gallery_albums
ADD COLUMN status VARCHAR(50) DEFAULT 'Deployed' NOT NULL CHECK (status IN ('Draft', 'Scheduled', 'Deployed')),
ADD COLUMN publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Add a trigger to update updated_at for gallery_albums
CREATE TRIGGER trigger_update_gallery_albums_timestamp 
BEFORE UPDATE ON gallery_albums 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
