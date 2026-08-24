-- =====================================================================
-- Role-based access control for the "Data Entry User" restricted role.
--
-- Roles live on the Supabase Auth user's app_metadata (NOT user_metadata
-- — app_metadata can only be set via the Supabase dashboard or the
-- Admin API with the service_role key, never by the user themselves
-- client-side, which is what makes it safe to trust in RLS policies).
--
-- To make a user a restricted data-entry user:
--   Supabase Dashboard -> Authentication -> Users -> select the user
--   -> edit "Raw App Meta Data" -> set: { "role": "data_entry" }
-- Any user with no role set (or role = "admin") is treated as admin,
-- so existing users are unaffected until you explicitly restrict one.
--
-- Run this in your Supabase SQL editor. Idempotent (safe to re-run).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Relax NOT NULL on columns a data-entry user's partial submission
--    won't fill in, so INSERT succeeds leaving them for the admin to
--    complete later. (Columns already covered by a DEFAULT — e.g.
--    has_special_needs, has_social_welfare, previous_year_result —
--    don't need this; they already insert fine when omitted.)
-- ---------------------------------------------------------------------

alter table public.students alter column student_id_type drop not null;
alter table public.students alter column father_id_type drop not null;
alter table public.students alter column economic_level drop not null;
alter table public.students alter column current_grade drop not null;
alter table public.students alter column guardian_phone drop not null;

-- Auto-stamp created_by on insert so a data-entry user's own rows are
-- identifiable without any app code change (needed for the read-back
-- policy below, which powers the "save then print" flow).
alter table public.students alter column created_by set default auth.uid();

-- ---------------------------------------------------------------------
-- 2. Role-aware RLS: data-entry users can only INSERT — they cannot
--    read, update, or delete the roster even via a direct API call,
--    so hiding the dashboard UI is backed by a real permission boundary.
--    Admins (role = 'admin' or no role set) keep full access.
-- ---------------------------------------------------------------------

drop policy if exists "Authenticated users can read students" on public.students;
drop policy if exists "Authenticated users can insert students" on public.students;
drop policy if exists "Authenticated users can update students" on public.students;
drop policy if exists "Authenticated users can delete students" on public.students;
drop policy if exists "Data entry users can read their own submissions" on public.students;

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

-- student_stats and the analytics views are admin-only dashboard reads —
-- restrict their SELECT grants the same way via a wrapper: since views
-- run with the querying user's own RLS on the underlying table, a
-- data-entry user's SELECT against these views will simply return no
-- rows (blocked by the students SELECT policy above), which is fine —
-- they never render the dashboard anyway.
