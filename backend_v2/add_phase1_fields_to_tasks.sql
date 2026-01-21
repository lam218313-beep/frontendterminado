-- Migration: Add Phase 1 Enriched Fields to tasks table
-- Date: 2026-01-20
-- Purpose: Support AI-generated strategic content with hooks, guidelines, and execution details

-- Add Phase 1 enriched columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS selected_hook text,
ADD COLUMN IF NOT EXISTS narrative_structure text,
ADD COLUMN IF NOT EXISTS key_elements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS dos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS donts jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS strategic_purpose text;

-- Add comment for documentation
COMMENT ON COLUMN tasks.selected_hook IS 'Specific creative hook selected from strategy concept';
COMMENT ON COLUMN tasks.narrative_structure IS 'Step-by-step narrative structure (e.g., Hook 5s → Problem 10s → Solution 20s)';
COMMENT ON COLUMN tasks.key_elements IS 'Array of mandatory elements for content creation';
COMMENT ON COLUMN tasks.dos IS 'Array of best practices to follow';
COMMENT ON COLUMN tasks.donts IS 'Array of common mistakes to avoid';
COMMENT ON COLUMN tasks.strategic_purpose IS 'Strategic rationale explaining why this content is important';

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
AND column_name IN ('selected_hook', 'narrative_structure', 'key_elements', 'dos', 'donts', 'strategic_purpose')
ORDER BY column_name;
