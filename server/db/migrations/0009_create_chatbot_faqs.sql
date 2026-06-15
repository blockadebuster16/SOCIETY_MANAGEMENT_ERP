-- Migration to create chatbot_faqs table for Milestone 10

CREATE TABLE chatbot_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT UNIQUE NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Seed default FAQ data
INSERT INTO chatbot_faqs (question, answer) VALUES
(
  'What are the visitor parking rules?',
  'Visitor parking is permitted only in designated visitor parking slots (V-01 to V-05) on the ground floor. Visitor vehicles are allowed for a maximum of 4 hours. Residents must register their visitors with security at the gate or file expected visitors in the portal.'
),
(
  'When are maintenance bills generated and due?',
  'Maintenance bills are generated on the 1st of every month. The due date is the 10th of the month. Overdue payments will attract a late payment interest fee of 15% per annum after a grace period of 5 days.'
),
(
  'How do I file a service complaint?',
  'You can file a complaint by logging into the Resident Portal, navigating to "Complaints", and clicking "File Ticket". Select the category (such as Plumbing, Electrical, or Security), enter the description, and upload optional photos. The committee will assign it and post status updates.'
),
(
  'How can I book the clubhouse or event space?',
  'Clubhouse bookings can be requested through the Events portal or by contacting the Society Committee Secretary. A booking fee of INR 2,000 per day and a refundable security deposit of INR 5,000 are required.'
),
(
  'What are the timings for water supply?',
  'Water supply is available daily from 6:00 AM to 9:00 AM and from 6:00 PM to 9:00 PM. For emergency water tank refills, please contact the society manager.'
),
(
  'What are the waste management and segregation guidelines?',
  'Dry and wet waste must be segregated before disposal. Door-to-door waste collection is scheduled daily at 9:00 AM. A penalty of INR 200 is levied by the municipal corporation for unsegregated waste disposal.'
);
