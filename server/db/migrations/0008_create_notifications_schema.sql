-- Migration to create tables for Milestone 9: Notification System

-- 1. Create notification_templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name VARCHAR(100) UNIQUE NOT NULL,
    subject_template VARCHAR(255),
    body_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create notifications table (In-App Notifications)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL, -- e.g. 'Notice', 'Complaint', 'Payment', 'Document', 'Event', 'Emergency'
    source_id UUID, -- Reference to target entity (notice ID, complaint ID, etc.)
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Create notification_logs table
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('Email', 'WhatsApp', 'SMS', 'In-App')),
    recipient VARCHAR(255) NOT NULL, -- Email address, phone number, or 'In-App'
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL CHECK (status IN ('Pending', 'Sent', 'Failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexing for performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_logs_user ON notification_logs(user_id);

-- 4. Seed notification templates
INSERT INTO notification_templates (template_name, subject_template, body_template) VALUES
(
  'new_notice',
  'New Notice Published: {{notice_title}}',
  'Dear Resident, a new society notice titled "{{notice_title}}" in category "{{notice_category}}" has been published. Please log in to read the full circular. Regards, Suyash Pride Committee.'
),
(
  'complaint_update',
  'Complaint Update: ticket #{{ticket_id}}',
  'Dear {{name}}, your complaint regarding "{{subject}}" has been updated to status: {{status}}. Notes: {{notes}}. Regards, Suyash Pride Helpdesk.'
),
(
  'payment_success',
  'Maintenance Payment Receipt: {{receipt_number}}',
  'Dear {{name}}, we have successfully received and verified your payment of INR {{amount}}. Receipt Reference: {{receipt_number}}. Thank you, Suyash Pride Committee.'
),
(
  'payment_reminder',
  'Payment Reminder: Maintenance Bills Due',
  'Dear Resident, this is a friendly reminder that your maintenance bill of INR {{amount}} for {{month}} is due by {{due_date}}. Please clear your dues to avoid interest penalties. Regards, Suyash Pride Committee.'
),
(
  'event_reminder',
  'Upcoming Event Reminder: {{event_title}}',
  'Dear Resident, this is a reminder for the upcoming society event "{{event_title}}" scheduled on {{event_date}} at {{event_location}}. We look forward to seeing you there! Regards, Cultural Committee.'
),
(
  'document_upload',
  'New Document Uploaded: {{doc_title}}',
  'Dear Resident, a new document "{{doc_title}}" has been uploaded under category "{{doc_category}}". You can view and download it under the Document Center. Regards, Suyash Pride Committee.'
),
(
  'emergency_alert',
  'EMERGENCY ALERT: {{alert_title}}',
  'CRITICAL ALERT: {{alert_message}} Please take all necessary precautions. Contact security if you need immediate assistance. Emergency Helpdesk.'
);
