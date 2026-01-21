-- Migration: Add Phase 1 Enriched Fields to strategy_nodes table
-- Date: 2026-01-20
-- Purpose: Support AI-generated strategic concepts with rationale, hooks, and execution guidelines

-- Add Phase 1 enriched columns to strategy_nodes table
ALTER TABLE strategy_nodes 
ADD COLUMN IF NOT EXISTS strategic_rationale text,
ADD COLUMN IF NOT EXISTS creative_hooks jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS execution_guidelines jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN strategy_nodes.strategic_rationale IS 'Why this concept is critical for the objective';
COMMENT ON COLUMN strategy_nodes.creative_hooks IS 'Array of 4-6 pre-validated specific hooks ready to use';
COMMENT ON COLUMN strategy_nodes.execution_guidelines IS 'Object with structure, key_elements, dos, donts for execution';

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'strategy_nodes'
AND column_name IN ('strategic_rationale', 'creative_hooks', 'execution_guidelines')
ORDER BY column_name;
