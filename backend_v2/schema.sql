create table analysis_reports (
  id text primary key, -- Cambiado a text porque pasamos uuid como string desde python
  client_id text,
  status text,
  frontend_compatible_json jsonb,
  error_message text,

create table clients (
  id text primary key,
  nombre text,
  industry text,
  is_active boolean default true,
  created_at timestamptz default now()
);

