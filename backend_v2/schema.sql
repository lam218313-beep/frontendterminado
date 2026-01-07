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

create table tasks (
  id text primary key,
  client_id text references clients(id),
  title text not null,
  description text,
  status text default 'PENDIENTE', -- PENDIENTE, EN_CURSO, REVISADO, HECHO
  priority text default 'Media', -- Alta, Media, Baja
  urbency text default 'media', -- alta, media, baja (frontend constraint)
  week integer default 1,
  area_estrategica text,
  score_impacto integer,
  score_esfuerzo integer,
  created_at timestamptz default now(),
  completed_at timestamptz
);


