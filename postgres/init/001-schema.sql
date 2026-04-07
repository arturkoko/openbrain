-- OpenBrain Database Schema
-- All tables share common columns

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- Household Items
-- ============================================
CREATE TABLE household_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    value TEXT,
    location VARCHAR(255),
    brand VARCHAR(255),
    model VARCHAR(255),
    purchase_date DATE,
    warranty_until DATE,
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by VARCHAR(10) DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Maintenance Logs
-- ============================================
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_ref UUID REFERENCES household_items(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    performed_at DATE,
    next_due DATE,
    cost DECIMAL(10,2),
    provider VARCHAR(255),
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by VARCHAR(10) DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Contacts (CRM)
-- ============================================
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    company VARCHAR(255),
    role VARCHAR(255),
    email_private VARCHAR(255),
    email_business VARCHAR(255),
    phone_private VARCHAR(50),
    phone_business VARCHAR(50),
    linkedin VARCHAR(255),
    address TEXT,
    warmth INTEGER DEFAULT 50 CHECK (warmth BETWEEN 0 AND 100),
    last_contact DATE,
    birthday DATE,
    industry VARCHAR(255),
    is_vip BOOLEAN DEFAULT false,
    preferred_platform VARCHAR(50),
    relationship_type VARCHAR(50),
    how_met TEXT,
    projects TEXT[] DEFAULT '{}',
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by VARCHAR(10) DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Interactions (CRM Activity Log)
-- ============================================
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    summary TEXT NOT NULL,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Contact Relations
-- ============================================
CREATE TABLE contact_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_a UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    contact_b UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    relation_type VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(contact_a, contact_b, relation_type)
);

-- ============================================
-- Reminders
-- ============================================
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    recurring VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'snoozed', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    related_table VARCHAR(100),
    related_id UUID,
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by VARCHAR(10) DEFAULT 'human' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Memories (AI catch-all)
-- ============================================
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(100),
    key VARCHAR(255),
    value TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 1.00,
    source VARCHAR(255),
    vault_link TEXT,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    created_by VARCHAR(10) DEFAULT 'ai' CHECK (created_by IN ('human', 'ai')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- App Users (for webapp auth)
-- ============================================
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_household_category ON household_items(category);
CREATE INDEX idx_household_tags ON household_items USING GIN(tags);
CREATE INDEX idx_contacts_warmth ON contacts(warmth);
CREATE INDEX idx_contacts_last_contact ON contacts(last_contact);
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);
CREATE INDEX idx_interactions_contact ON interactions(contact_id);
CREATE INDEX idx_interactions_date ON interactions(date DESC);
CREATE INDEX idx_reminders_due ON reminders(due_date) WHERE status = 'pending';
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_memories_category ON memories(category);
CREATE INDEX idx_memories_key ON memories(key);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);

-- Trigram indexes for full-text search
CREATE INDEX idx_household_name_trgm ON household_items USING GIN(name gin_trgm_ops);
CREATE INDEX idx_contacts_name_trgm ON contacts USING GIN(first_name gin_trgm_ops);
CREATE INDEX idx_memories_value_trgm ON memories USING GIN(value gin_trgm_ops);

-- ============================================
-- Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_household_items_updated BEFORE UPDATE ON household_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_maintenance_logs_updated BEFORE UPDATE ON maintenance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reminders_updated BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_interactions_updated BEFORE UPDATE ON interactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_memories_updated BEFORE UPDATE ON memories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

