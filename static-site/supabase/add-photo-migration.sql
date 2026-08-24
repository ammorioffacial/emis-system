-- =====================================================================
-- Run this in your Supabase project's SQL editor to add student-photo
-- support to an already-provisioned database.
-- =====================================================================

alter table public.students add column if not exists photo_url text;

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
