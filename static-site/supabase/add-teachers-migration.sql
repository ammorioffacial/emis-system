-- =====================================================================
-- Adds teacher registration (تسجيل الأساتذة) to an already-live EMIS
-- database. Purely additive — creates a new table/types/bucket only,
-- never touches the existing students table or its data. Safe to
-- re-run (every statement is idempotent).
--
-- Run this in your Supabase project's SQL editor.
-- =====================================================================

do $$ begin
  create type teacher_employment_type as enum ('permanent', 'contract', 'lecturer', 'daily_wage', 'other_assignment');
exception when duplicate_object then null; end $$;

do $$ begin
  create type teacher_employee_type as enum ('teaching', 'administrative', 'technical', 'service');
exception when duplicate_object then null; end $$;

do $$ begin
  create type teacher_job_title as enum (
    'first_teacher', 'second_teacher', 'third_teacher',
    'technical_manager', 'senior_technical_manager', 'deputy_technical_manager', 'manager'
  );
exception when duplicate_object then null; end $$;

-- blood_type already exists from the students table setup; reused as-is.

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  teacher_first_name  text not null,
  teacher_second_name text not null,
  teacher_third_name  text not null,
  teacher_fourth_name text not null,
  teacher_surname     text not null,
  mother_first_name   text not null,
  mother_second_name  text not null,
  mother_third_name   text not null,
  date_of_birth date not null,
  place_of_birth text,

  id_type text,
  issuing_country text,
  national_card_number text not null,
  employee_number text,
  family_number text,
  birthplace text,
  marital_status text,
  blood_type blood_type,

  employment_type teacher_employment_type not null,
  employee_type teacher_employee_type not null,
  job_title teacher_job_title not null,
  job_address text,
  current_position text,
  first_appointment_date date,

  college_name text,
  graduation_year text,
  specialization text,

  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,

  city_village text,
  neighborhood text,
  mahalla text,
  alley text,
  address_line text,
  nearest_landmark text,

  email text not null,
  phone text not null,

  photo_url text
);

comment on table public.teachers is 'Public teacher registration records for EMIS (تسجيل الأساتذة)';

drop trigger if exists trg_teachers_updated_at on public.teachers;
create trigger trg_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

create index if not exists idx_teachers_created_at on public.teachers (created_at desc);
create index if not exists idx_teachers_surname on public.teachers (teacher_surname);

alter table public.teachers enable row level security;

drop policy if exists "Anyone can register as a teacher" on public.teachers;
drop policy if exists "Admins can read teachers" on public.teachers;
drop policy if exists "Admins can update teachers" on public.teachers;
drop policy if exists "Admins can delete teachers" on public.teachers;

create policy "Anyone can register as a teacher"
  on public.teachers for insert
  to anon, authenticated
  with check (true);

create policy "Admins can read teachers"
  on public.teachers for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin');

create policy "Admins can update teachers"
  on public.teachers for update
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin');

create policy "Admins can delete teachers"
  on public.teachers for delete
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin');

create or replace view public.teacher_stats as
select
  count(*) as total_teachers,
  count(*) filter (where created_at >= date_trunc('month', now())) as new_registrations_this_month,
  count(*) filter (where employee_type = 'teaching') as teaching_count,
  count(*) filter (where employment_type = 'permanent') as permanent_count
from public.teachers;

grant select on public.teacher_stats to authenticated;

insert into storage.buckets (id, name, public)
values ('teacher-photos', 'teacher-photos', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can upload teacher photos" on storage.objects;
drop policy if exists "Authenticated users can update teacher photos" on storage.objects;
drop policy if exists "Authenticated users can delete teacher photos" on storage.objects;
drop policy if exists "Anyone can view teacher photos" on storage.objects;

create policy "Anyone can upload teacher photos"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'teacher-photos');

create policy "Authenticated users can update teacher photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'teacher-photos');

create policy "Authenticated users can delete teacher photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'teacher-photos');

create policy "Anyone can view teacher photos"
  on storage.objects for select
  to public
  using (bucket_id = 'teacher-photos');
