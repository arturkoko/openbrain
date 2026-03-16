-- Migration 001: CRM Upgrade
-- Adds Personal CRM fields to contacts table and creates interactions table

-- New columns on contacts
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_platform TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS projects TEXT[] DEFAULT '{}';

-- Interactions table (for tracking contact history)
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date);

-- Additional indexes for new columns
CREATE INDEX IF NOT EXISTS idx_contacts_vip ON contacts(is_vip) WHERE is_vip = true;
CREATE INDEX IF NOT EXISTS idx_contacts_birthday ON contacts(birthday);
