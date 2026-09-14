-- =====================================================================
-- EMIS (نظام إضافة التلاميذ) - Supabase Database Schema
-- Static-site edition: same schema as the Next.js version, standalone.
-- Replicates every field on the "استمارة إضافة التلاميذ لنظام EMIS" form.
--
-- This is now the SINGLE consolidated schema file — it folds in what
-- used to be four separate migration files (add-photo-migration.sql,
-- add-v2-fields-migration.sql, add-role-based-access-migration.sql,
-- restore-auth-migration.sql), which have been removed.
--
-- ** WARNING — this file is idempotent for a FRESH database, not safe
-- ** as a live migration against a database that already has data.
-- ** The `drop type ... cascade` statements below will silently DROP
-- ** every column built on that type (and its data) if the type
-- ** already exists and the table is already populated. Only run this
-- ** whole file against a new/empty Supabase project. If you have an
-- ** existing EMIS database with real student data, do not re-run this
-- ** file — apply targeted `alter table` statements by hand instead.
-- =====================================================================

create extension if not exists "pgcrypto";

drop type if exists id_type cascade;
drop type if exists economic_level cascade;
drop type if exists previous_year_result cascade;
drop type if exists yes_no cascade;
drop type if exists blood_type cascade;
drop type if exists special_needs_type cascade;
drop type if exists educational_stage cascade;
drop type if exists preparatory_branch cascade;

create type id_type as enum ('national_id', 'nationality');
create type economic_level as enum ('below_poverty', 'poor', 'middle', 'high');
create type previous_year_result as enum ('new_registration', 'passed', 'failed');
create type yes_no as enum ('yes', 'no');
create type blood_type as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');

create type special_needs_type as enum (
  'physical',       -- العوق الفيزيائي
  'visual',         -- العوق البصري
  'hearing',        -- العوق السمعي
  'intellectual',   -- العوق الذهني
  'psychological',  -- العوق النفسي
  'autism',         -- التوحد
  'slow_learner'    -- بطيء التعلم
);

create type educational_stage as enum ('primary', 'intermediate', 'preparatory'); -- ابتدائية / متوسطة / اعدادية
create type preparatory_branch as enum ('scientific', 'literary');                -- علمي / ادبي

create sequence if not exists public.students_statistical_number_seq start 1000;

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),

  -- اسم الطالب الرباعي واللقب
  student_first_name    text not null,
  student_second_name   text not null,
  student_third_name    text not null,
  student_fourth_name   text not null,
  student_surname       text not null,

  -- تاريخ تولد الطالب
  date_of_birth date not null,

  -- إسم الام الثلاثي
  mother_first_name  text not null,
  mother_second_name text not null,
  mother_third_name  text not null,

  -- نوع الهوية الطالب
  -- (nullable: a restricted "data entry" user's partial submission may
  -- omit this)
  student_id_type id_type,
  student_national_id_number text,
  student_civil_status_id_number text,
  student_nationality_cert_number text,
  student_record_number text,
  student_page_number text,
  student_issuing_authority text,

  -- نوع هوية الاب
  father_id_type id_type,
  father_national_id_number text,
  father_civil_status_id_number text,
  father_nationality_cert_number text,
  father_record_number text,
  father_page_number text,
  father_issuing_authority text,

  birthplace text,
  blood_type blood_type,
  has_special_needs yes_no not null default 'no',
  economic_level economic_level,
  has_social_welfare yes_no not null default 'no',

  previous_academic_year text,
  previous_year_result previous_year_result not null default 'new_registration',
  current_grade text,
  section text,

  neighborhood text,
  mahalla text,
  alley text,
  nearest_landmark text,

  guardian_phone text,

  photo_url text,                                   -- الصورة الشخصية (Supabase Storage public URL)

  -- الرقم الإحصائي / تسلسل الاستمارة (auto-incrementing, starts at 1000)
  statistical_number integer not null default nextval('public.students_statistical_number_seq') unique,

  -- المعلومات الشخصية
  marital_status text,
  special_needs_type special_needs_type,            -- only meaningful when has_special_needs = 'yes'

  -- المعلومات الدراسية
  previous_school text,
  previous_educational_stage educational_stage,
  previous_grade text,
  current_educational_stage educational_stage,
  current_preparatory_branch preparatory_branch,     -- only meaningful when current_educational_stage = 'preparatory'

  -- العنوان الدائم (إضافة إلى الحي/المحلة/الزقاق الحالية)
  governorate text,
  district text,
  sub_district text,

  -- ملاحظات
  notes text
);

comment on table public.students is 'Student registration records for EMIS (استمارة إضافة التلاميذ)';

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

create index if not exists idx_students_current_grade on public.students (current_grade);
create index if not exists idx_students_section on public.students (section);
create index if not exists idx_students_surname on public.students (student_surname);
create index if not exists idx_students_created_at on public.students (created_at desc);
create index if not exists idx_students_grade_section on public.students (current_grade, section);
create index if not exists idx_students_previous_school on public.students (previous_school);
create index if not exists idx_students_has_social_welfare on public.students (has_social_welfare);

-- ---------------------------------------------------------------------
-- Row Level Security
-- Static site uses the Supabase anon key directly in the browser, so
-- every read/write requires a signed-in Supabase Auth session (see
-- login.html + requireAuth() in js/supabase-client.js).
--
-- Role-aware: a user's role lives on Supabase Auth app_metadata — set
-- only via the Supabase dashboard (Authentication -> Users -> select
-- user -> edit "Raw App Meta Data" -> { "role": "data_entry" }), never
-- client-side, which is what makes it safe to trust here. A user with
-- role = 'data_entry' can only INSERT, plus SELECT the rows they
-- created themselves (needed for the "save then print" flow on
-- student.html right after submitting add-student.html). Everyone else
-- (role = 'admin' or no role set, for backward compatibility) has full
-- access. This is enforced here, not just hidden in the UI.
-- ---------------------------------------------------------------------

alter table public.students enable row level security;

drop policy if exists "Public can read students" on public.students;
drop policy if exists "Public can insert students" on public.students;
drop policy if exists "Public can update students" on public.students;
drop policy if exists "Public can delete students" on public.students;
drop policy if exists "Authenticated users can read students" on public.students;
drop policy if exists "Authenticated users can insert students" on public.students;
drop policy if exists "Authenticated users can update students" on public.students;
drop policy if exists "Authenticated users can delete students" on public.students;
drop policy if exists "Admins can read students" on public.students;
drop policy if exists "Data entry users can read their own submissions" on public.students;
drop policy if exists "All authenticated users can insert students" on public.students;
drop policy if exists "Admins can update students" on public.students;
drop policy if exists "Admins can delete students" on public.students;

create policy "Admins can read students"
  on public.students for select
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin');

-- Data-entry users can't browse the roster, but they can read back a
-- record they just created themselves, so the "save then print" flow
-- on student.html works right after they submit add-student.html.
create policy "Data entry users can read their own submissions"
  on public.students for select
  to authenticated
  using (
    coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'data_entry'
    and created_by = auth.uid()
  );

create policy "All authenticated users can insert students"
  on public.students for insert
  to authenticated
  with check (true);

create policy "Admins can update students"
  on public.students for update
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin');

create policy "Admins can delete students"
  on public.students for delete
  to authenticated
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'admin') = 'admin');

-- ---------------------------------------------------------------------
-- Dashboard statistics view
-- ---------------------------------------------------------------------

create or replace view public.student_stats as
select
  count(*) as total_students,
  count(*) filter (where created_at >= date_trunc('month', now())) as new_registrations_this_month,
  count(*) filter (where previous_year_result = 'passed') as passed_count,
  count(*) filter (where previous_year_result = 'failed') as failed_count,
  count(*) filter (where has_special_needs = 'yes') as special_needs_count,
  count(*) filter (where has_social_welfare = 'yes') as social_welfare_count
from public.students;

grant select on public.student_stats to authenticated;

-- ---------------------------------------------------------------------
-- Analytics views (الإحصائيات الشاملة)
-- ---------------------------------------------------------------------

create or replace view public.student_stats_by_grade_section as
select current_grade, section, count(*) as student_count
from public.students
group by current_grade, section
order by current_grade, section;

create or replace view public.student_stats_by_special_needs_type as
select special_needs_type, count(*) as student_count
from public.students
where has_special_needs = 'yes' and special_needs_type is not null
group by special_needs_type;

create or replace view public.student_stats_by_previous_school as
select previous_school, count(*) as student_count
from public.students
where previous_school is not null and previous_school <> ''
group by previous_school
order by student_count desc;

grant select on public.student_stats_by_grade_section to authenticated;
grant select on public.student_stats_by_special_needs_type to authenticated;
grant select on public.student_stats_by_previous_school to authenticated;

-- ---------------------------------------------------------------------
-- Storage bucket for student photos (public read, authenticated write)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('student-photos', 'student-photos', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload student photos" on storage.objects;
drop policy if exists "Authenticated users can update student photos" on storage.objects;
drop policy if exists "Authenticated users can delete student photos" on storage.objects;
drop policy if exists "Anyone can view student photos" on storage.objects;

create policy "Authenticated users can upload student photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'student-photos');

create policy "Authenticated users can update student photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'student-photos');

create policy "Authenticated users can delete student photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'student-photos');

create policy "Anyone can view student photos"
  on storage.objects for select
  to public
  using (bucket_id = 'student-photos');

-- =====================================================================
-- Teachers (تسجيل الأساتذة) — a public, no-login registration form.
-- Anyone can INSERT (anon key, no Supabase Auth session needed); only
-- an authenticated admin can read/update/delete, same pattern as the
-- students table's role-based policies.
-- =====================================================================

drop type if exists teacher_employment_type cascade;
drop type if exists teacher_employee_type cascade;
drop type if exists teacher_job_title cascade;

create type teacher_employment_type as enum ('permanent', 'contract', 'lecturer', 'daily_wage', 'other_assignment'); -- ملاك دائم / عقد / محاضر / أجير / تكليف آخر
create type teacher_employee_type as enum ('teaching', 'administrative', 'technical', 'service');                    -- تدريسي / إداري / فني / خدمي
create type teacher_job_title as enum (
  'first_teacher',            -- معلم اول
  'second_teacher',           -- معلم ثاني
  'third_teacher',            -- معلم ثالث
  'technical_manager',        -- مدير فني
  'senior_technical_manager', -- مدير فني اقدم
  'deputy_technical_manager', -- معاون مدير فني
  'manager'                   -- مدير
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- المعلومات الشخصية
  teacher_first_name  text not null,
  teacher_second_name text not null,
  teacher_third_name  text not null,
  teacher_fourth_name text not null,
  teacher_surname     text not null,
  mother_first_name   text not null,
  mother_second_name  text not null,
  mother_third_name   text not null,
  date_of_birth date not null,
  place_of_birth text,       -- محل الولادة

  -- وثيقة التعريف
  id_type text,
  issuing_country text,
  national_card_number text not null,
  employee_number text,
  family_number text,
  birthplace text,           -- مسقط الرأس
  marital_status text,
  blood_type blood_type,

  -- بيانات المعلم والعنوان
  employment_type teacher_employment_type not null,
  employee_type teacher_employee_type not null,
  job_title teacher_job_title not null,
  job_address text,
  current_position text,
  first_appointment_date date,

  -- التحصيل الدراسي
  college_name text,
  graduation_year text,
  specialization text,

  -- جهة الاتصال في حالة الطارئة
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,

  -- المكان (العنوان)
  city_village text,
  neighborhood text,
  mahalla text,
  alley text,
  address_line text,
  nearest_landmark text,

  -- الاتصال
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

-- Storage bucket for teacher photos — public read, and unlike student
-- photos, insert must also be open to the public (anon), since the
-- registration form has no login.

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
