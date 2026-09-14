-- Run this if teacher-register.html still shows "new row violates row-level
-- security policy for table teachers" after running add-teachers-migration.sql.
-- Safe to re-run.

drop policy if exists "Anyone can register as a teacher" on public.teachers;

create policy "Anyone can register as a teacher"
  on public.teachers for insert
  to anon, authenticated
  with check (true);

-- Verify: this should return one row showing role "{anon,authenticated}"
select policyname, cmd, roles from pg_policies where tablename = 'teachers' and cmd = 'INSERT';
