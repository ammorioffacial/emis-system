-- =====================================================================
-- EMIS (نظام إضافة التلاميذ) - Supabase Database Schema
-- Static-site edition: same schema as the Next.js version, standalone.
-- Replicates every field on the "استمارة إضافة التلاميذ لنظام EMIS" form.
-- =====================================================================

create extension if not exists "pgcrypto";

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
  created_by uuid references auth.users(id),

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
  student_id_type id_type not null,
  student_national_id_number text,
  student_civil_status_id_number text,
  student_nationality_cert_number text,
  student_record_number text,
  student_page_number text,
  student_issuing_authority text,

  -- نوع هوية الاب
  father_id_type id_type not null,
  father_national_id_number text,
  father_civil_status_id_number text,
  father_nationality_cert_number text,
  father_record_number text,
  father_page_number text,
  father_issuing_authority text,

  birthplace text,
  blood_type blood_type,
  has_special_needs yes_no not null default 'no',
  economic_level economic_level not null,
  has_social_welfare yes_no not null default 'no',

  previous_academic_year text,
  previous_year_result previous_year_result not null default 'new_registration',
  current_grade text not null,
  section text,

  neighborhood text,
  mahalla text,
  alley text,
  nearest_landmark text,

  guardian_phone text not null,

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
-- ---------------------------------------------------------------------

alter table public.students enable row level security;

create policy "Authenticated users can read students"
  on public.students for select
  to authenticated
  using (true);

create policy "Authenticated users can insert students"
  on public.students for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update students"
  on public.students for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can delete students"
  on public.students for delete
  to authenticated
  using (true);

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
