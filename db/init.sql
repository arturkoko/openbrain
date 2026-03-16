-- OpenBrain Database Schema
-- All tables share common columns for tracking and cross-referencing

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. Household Items
-- ============================================================
CREATE TABLE household_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,        -- e.g. 'paint', 'wifi', 'appliance', 'clothing'
    name TEXT NOT NULL,            -- e.g. 'Living Room Paint'
    value TEXT NOT NULL,           -- e.g. 'Hail Navy by Benjamin Moore'
    location TEXT,                 -- e.g. 'Living Room', 'Kitchen'
    warranty_expires DATE,
    vault_link TEXT,               -- optional wikilink to Obsidian note
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by TEXT DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. Maintenance Logs
-- ============================================================
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item TEXT NOT NULL,            -- e.g. 'Boiler', 'Car (Skoda)'
    action TEXT NOT NULL,          -- e.g. 'Annual service', 'Oil change'
    date_performed DATE NOT NULL,
    next_due DATE,
    cost NUMERIC(10, 2),
    provider TEXT,                 -- e.g. 'Heizung Schmidt GmbH'
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by TEXT DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. Contacts (Professional CRM)
-- ============================================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    company TEXT,
    role TEXT,
    relationship_type TEXT,       -- e.g. 'colleague', 'kol', 'mentor', 'friend', 'family', 'school', 'network', 'service'
    last_contact DATE,
    warmth_score INTEGER DEFAULT 5 CHECK (warmth_score BETWEEN 1 AND 10),
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    birthday DATE,
    industry TEXT,
    location TEXT,
    is_vip BOOLEAN DEFAULT false,
    preferred_platform TEXT,      -- e.g. 'whatsapp', 'email', 'linkedin', 'phone', 'other'
    projects TEXT[] DEFAULT '{}', -- free-text project tags
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by TEXT DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. Contact Relations
-- ============================================================
CREATE TABLE contact_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_a_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    contact_b_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL,   -- e.g. 'colleague', 'manager', 'introduced-by', 'reports-to'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT no_self_relation CHECK (contact_a_id != contact_b_id),
    CONSTRAINT unique_relation UNIQUE (contact_a_id, contact_b_id, relation_type)
);

-- ============================================================
-- 5. Interactions (Contact History)
-- ============================================================
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. Reminders
-- ============================================================
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT,             -- e.g. 'contact', 'maintenance', 'general'
    entity_id UUID,               -- optional FK to the related row
    due_date DATE NOT NULL,
    message TEXT NOT NULL,
    repeat_interval TEXT,         -- e.g. 'weekly', 'monthly', 'quarterly', NULL for one-time
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by TEXT DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. Memories (General AI Memory Catch-All)
-- ============================================================
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,       -- e.g. 'preference', 'fact', 'decision', 'experience'
    key TEXT NOT NULL,            -- short label, e.g. 'favorite-restaurant'
    value TEXT NOT NULL,          -- the actual memory content
    context TEXT,                 -- when/where this was learned
    importance INTEGER DEFAULT 5 CHECK (importance BETWEEN 1 AND 10),
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by TEXT DEFAULT 'ai' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes for common queries
-- ============================================================
CREATE INDEX idx_household_category ON household_items(category);
CREATE INDEX idx_maintenance_next_due ON maintenance_logs(next_due);
CREATE INDEX idx_contacts_warmth ON contacts(warmth_score);
CREATE INDEX idx_contacts_last_contact ON contacts(last_contact);
CREATE INDEX idx_contacts_vip ON contacts(is_vip) WHERE is_vip = true;
CREATE INDEX idx_contacts_birthday ON contacts(birthday);
CREATE INDEX idx_interactions_contact ON interactions(contact_id);
CREATE INDEX idx_interactions_date ON interactions(date);
CREATE INDEX idx_reminders_due ON reminders(due_date) WHERE NOT completed;
CREATE INDEX idx_memories_category ON memories(category);
CREATE INDEX idx_memories_key ON memories(key);

-- ============================================================
-- Auto-update updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_household_items_updated BEFORE UPDATE ON household_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_maintenance_logs_updated BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reminders_updated BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_memories_updated BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
