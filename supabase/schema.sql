-- =====================================================================
-- EMIS (نظام إضافة التلاميذ) - Supabase Database Schema
-- Replicates every field on the "استمارة إضافة التلاميذ لنظام EMIS" form
-- =====================================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enum types (mirror the checkbox groups on the paper form)
-- ---------------------------------------------------------------------

create type id_type as enum ('national_id', 'nationality');          -- بطاقة وطنية / جنسية
create type economic_level as enum ('below_poverty', 'poor', 'middle', 'high'); -- تحت خط الفقر / فقيرة / وسطى / عليا
create type previous_year_result as enum ('new_registration', 'passed', 'failed'); -- تسجيل جديد / ناجح / راسب
create type yes_no as enum ('yes', 'no');                            -- نعم / كلا
create type blood_type as enum ('A+','A-','B+','B-','AB+','AB-','O+','O-');

-- ---------------------------------------------------------------------
-- students table
-- ---------------------------------------------------------------------

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id),

  -- === اسم الطالب الرباعي واللقب / Student 4-part name + surname ===
  student_first_name    text not null,   -- الاسم الأول
  student_second_name   text not null,   -- الاسم الثاني
  student_third_name    text not null,   -- الاسم الثالث
  student_fourth_name   text not null,   -- الاسم الرابع
  student_surname       text not null,   -- اللقب

  -- === تاريخ تولد الطالب (يوم/شهر/سنة) ===
  date_of_birth date not null,

  -- === إسم الام الثلاثي / Mother's 3-part name ===
  mother_first_name  text not null,
  mother_second_name text not null,
  mother_third_name  text not null,

  -- === نوع الهوية الطالب / Student ID type ===
  student_id_type id_type not null,               -- بطاقة وطنية | جنسية
  student_national_id_number text,                 -- رقم البطاقة الوطنية
  student_civil_status_id_number text,             -- رقم هوية الأحوال المدنية
  student_nationality_cert_number text,             -- رقم شهادة الجنسية
  student_record_number text,                       -- رقم السجل
  student_page_number text,                         -- رقم الصحيفة
  student_issuing_authority text,                   -- جهة الإصدار

  -- === نوع هوية الاب / Father ID type ===
  father_id_type id_type not null,                 -- بطاقة وطنية | جنسية
  father_national_id_number text,                   -- رقم البطاقة الوطنية للأب
  father_civil_status_id_number text,               -- رقم هوية الأحوال للأب
  father_nationality_cert_number text,               -- رقم شهادة الجنسية للأب
  father_record_number text,                         -- رقم السجل
  father_page_number text,                           -- رقم الصحيفة
  father_issuing_authority text,                     -- جهة الإصدار

  -- === Misc student info ===
  birthplace text,                                  -- مسقط الرأس للطالب
  blood_type blood_type,                            -- فئة دم الطالب
  has_special_needs yes_no not null default 'no',   -- هل الطالب من ذوي الاحتياجات الخاصة
  economic_level economic_level not null,           -- المستوى الاقتصادي للطالب
  has_social_welfare yes_no not null default 'no',  -- هل مشمول بمنحة الرعاية الاجتماعية

  -- === Academic info ===
  previous_academic_year text,                      -- العام الدراسي السابق (e.g. 2024/2025)
  previous_year_result previous_year_result not null default 'new_registration', -- نتيجة العام الدراسي السابق
  current_grade text not null,                      -- الصف الدراسي الحالي
  section text,                                      -- الشعبة

  -- === Address ===
  neighborhood text,                                 -- الحي
  mahalla text,                                       -- المحلة
  alley text,                                          -- الزقاق
  nearest_landmark text,                              -- اقرب نقطة دالة

  -- === Guardian contact ===
  guardian_phone text not null                        -- رقم هاتف ولي الامر
);

comment on table public.students is 'Student registration records for EMIS (استمارة إضافة التلاميذ)';

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------

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

-- ---------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------

create index if not exists idx_students_current_grade on public.students (current_grade);
create index if not exists idx_students_section on public.students (section);
create index if not exists idx_students_surname on public.students (student_surname);
create index if not exists idx_students_created_at on public.students (created_at desc);

-- ---------------------------------------------------------------------
-- Row Level Security
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
-- Convenience view for dashboard statistics
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
