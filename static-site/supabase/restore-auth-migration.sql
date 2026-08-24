-- =====================================================================
-- Run this in your Supabase project's SQL editor to restore the
-- "login required" policies on a database that currently has the
-- public `anon` policies applied (schema.sql alone won't retroactively
-- change existing policies on a live database).
--
-- Also make sure you have at least one Supabase Auth user created
-- (Authentication → Users → Add user) since login.html signs in with
-- email + password against Supabase Auth, not a custom table.
-- =====================================================================

drop policy if exists "Public can read students" on public.students;
drop policy if exists "Public can insert students" on public.students;
drop policy if exists "Public can update students" on public.students;
drop policy if exists "Public can delete students" on public.students;

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

grant select on public.student_stats to authenticated;
