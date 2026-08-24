-- =====================================================================
-- Run this in your Supabase project's SQL editor to add the v2 fields
-- (statistical number, special needs type, previous school, educational
-- stage/branch, structured address, notes) to an already-provisioned
-- database. Safe to re-run — every statement is idempotent.
-- =====================================================================

do $$ begin
  create type special_needs_type as enum (
    'physical', 'visual', 'hearing', 'intellectual', 'psychological', 'autism', 'slow_learner'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type educational_stage as enum ('primary', 'intermediate', 'preparatory');
exception when duplicate_object then null; end $$;

do $$ begin
  create type preparatory_branch as enum ('scientific', 'literary');
exception when duplicate_object then null; end $$;

create sequence if not exists public.students_statistical_number_seq start 1000;

alter table public.students add column if not exists
  statistical_number integer default nextval('public.students_statistical_number_seq');

-- Backfill any existing rows that don't have one yet, then enforce not-null + unique.
update public.students set statistical_number = nextval('public.students_statistical_number_seq')
where statistical_number is null;

alter table public.students alter column statistical_number set not null;
do $$ begin
  alter table public.students add constraint students_statistical_number_key unique (statistical_number);
exception when duplicate_object then null; end $$;

alter table public.students add column if not exists marital_status text;
alter table public.students add column if not exists special_needs_type special_needs_type;
alter table public.students add column if not exists previous_school text;
alter table public.students add column if not exists previous_educational_stage educational_stage;
alter table public.students add column if not exists previous_grade text;
alter table public.students add column if not exists current_educational_stage educational_stage;
alter table public.students add column if not exists current_preparatory_branch preparatory_branch;
alter table public.students add column if not exists governorate text;
alter table public.students add column if not exists district text;
alter table public.students add column if not exists sub_district text;
alter table public.students add column if not exists notes text;

create index if not exists idx_students_grade_section on public.students (current_grade, section);
create index if not exists idx_students_previous_school on public.students (previous_school);
create index if not exists idx_students_has_social_welfare on public.students (has_social_welfare);

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
