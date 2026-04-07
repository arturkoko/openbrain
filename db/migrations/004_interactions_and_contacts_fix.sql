-- Migration 004: Create interactions table + fix contacts schema
-- Run: sudo docker exec openbrain-db psql -U openbrain -d openbrain -f /docker-entrypoint-initdb.d/004_interactions_and_contacts_fix.sql
-- Or paste into psql manually.

-- ============================================
-- 1. Create interactions table (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_contact ON interactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON interactions(date DESC);

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_interactions_updated ON interactions;
CREATE TRIGGER trg_interactions_updated
    BEFORE UPDATE ON interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. Fix contacts schema — add missing columns
-- ============================================
-- Split email into private/business
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_private VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_business VARCHAR(255);

-- Migrate data from old 'email' column if it exists and new columns are empty
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'email') THEN
        UPDATE contacts SET email_private = email WHERE email_private IS NULL AND email IS NOT NULL;
    END IF;
END $$;

-- Split phone into private/business
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone_private VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone_business VARCHAR(50);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'phone') THEN
        UPDATE contacts SET phone_private = phone WHERE phone_private IS NULL AND phone IS NOT NULL;
    END IF;
END $$;

-- Replace city/country with address
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'city') THEN
        UPDATE contacts SET address = CONCAT_WS(', ', city, country)
        WHERE address IS NULL AND (city IS NOT NULL OR country IS NOT NULL);
    END IF;
END $$;

-- Additional CRM fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_platform VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS projects TEXT[] DEFAULT '{}';

-- Ensure linkedin exists (should already be there from init schema)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255);
