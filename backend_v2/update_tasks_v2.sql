
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS format text,
ADD COLUMN IF NOT EXISTS month_group text,
ADD COLUMN IF NOT EXISTS concept_id text,
ADD COLUMN IF NOT EXISTS execution_date date,
ADD COLUMN IF NOT EXISTS copy_suggestion text;
