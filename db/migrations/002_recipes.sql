-- Migration 002: Recipes
-- Adds recipes table for storing and managing cooking recipes

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]',
    instructions TEXT NOT NULL,
    servings VARCHAR(50),
    prep_time VARCHAR(50),
    cook_time VARCHAR(50),
    category VARCHAR(100),
    language VARCHAR(10) DEFAULT 'de',
    source_url TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_by VARCHAR(50) DEFAULT 'human' CHECK (created_by IN ('human','ai')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON recipes USING GIN(title public.gin_trgm_ops);

-- Auto-update updated_at
CREATE TRIGGER trg_recipes_updated BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
