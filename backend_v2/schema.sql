create table analysis_reports (
  id text primary key, -- Cambiado a text porque pasamos uuid como string desde python
  client_id text,
  status text,
  frontend_compatible_json jsonb,
  created_at timestamptz default now()
);

create table clients (
  id text primary key,
  nombre text,
  industry text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table users (
  id text primary key,
  email text unique not null,
  hashed_password text not null,
  full_name text,
  role text default 'analyst',
  created_at timestamptz default now()
);


