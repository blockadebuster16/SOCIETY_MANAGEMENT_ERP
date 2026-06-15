-- Migration: Update documents schema to support file metadata, status, version control, and updated_at
-- Target: PostgreSQL (Supabase Compatible)

ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Published' NOT NULL CHECK (status IN ('Draft', 'Published', 'Archived'));
ALTER TABLE documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;

-- Add updated_at trigger for documents
DROP TRIGGER IF EXISTS trigger_update_documents_timestamp ON documents;
CREATE TRIGGER trigger_update_documents_timestamp 
BEFORE UPDATE ON documents 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Seed Default Document Categories
INSERT INTO document_categories (name, description) VALUES
('AGM Minutes', 'Minutes of Annual General Meetings'),
('SGM Minutes', 'Minutes of Special General Meetings'),
('Audit Reports', 'Annual financial audit reports'),
('Financial Statements', 'Income, expenditure, and balance sheets'),
('Society By-Laws', 'Official housing society rules and by-laws'),
('Building Plans', 'Architectural layouts and structural plans'),
('Fire Safety Certificates', 'Compliance certificates and fire safety audits'),
('Vendor Contracts', 'Agreements with service providers and contractors'),
('Insurance Documents', 'Society building and asset insurance policies'),
('Legal Documents', 'Land conveyance deeds, registration certificates, and legal matters'),
('NOCs', 'No Objection Certificate templates and issues'),
('Maintenance Records', 'Logs and details of lift, water tanks, and building maintenance'),
('Other', 'Miscellaneous community files')
ON CONFLICT (name) DO NOTHING;
