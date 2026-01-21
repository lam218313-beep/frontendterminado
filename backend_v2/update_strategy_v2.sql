ALTER TABLE strategy_nodes 
ADD COLUMN IF NOT EXISTS suggested_format text,
ADD COLUMN IF NOT EXISTS suggested_frequency text,
ADD COLUMN IF NOT EXISTS tags text[]; -- Using text[] for array of strings

-- Update comment or check constraint if needed for 'type' column to allow 'concept'
-- Supabase/Postgres text columns don't strictly enforce enums unless defined as such.
-- Assuming 'type' is text.
