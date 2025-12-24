-- Crear tabla projects
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  thumbnail text,
  status text check (status in ('In Script', 'Editing', 'Rendering', 'Post-Prod', 'Review', 'Draft', 'Finished')),
  "lastEdited" timestamptz default now(),
  progress numeric,
  type text,
  duration text,
  data jsonb
);

-- Crear tabla reminders
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  text text not null,
  priority text check (priority in ('High', 'Normal', 'Low')),
  date timestamptz,
  completed boolean default false
);

-- Habilitar seguridad (RLS)
alter table public.projects enable row level security;
alter table public.reminders enable row level security;

-- Crear políticas de acceso (permite todo a todos - ÚTIL PARA DESARROLLO)
-- Si las políticas ya existen, esto podría dar error, así que mejor borrarlas antes si estás iterando
drop policy if exists "Public access projects" on public.projects;
create policy "Public access projects" on public.projects for all using (true) with check (true);

drop policy if exists "Public access reminders" on public.reminders;
create policy "Public access reminders" on public.reminders for all using (true) with check (true);
