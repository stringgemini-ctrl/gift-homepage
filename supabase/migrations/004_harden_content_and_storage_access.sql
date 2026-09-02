-- Harden direct Data API and Storage access without changing application data.
-- Apply only after the server-mediated reads/uploads in the matching app release are deployed.

begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(role) = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.archive enable row level security;
alter table public.archives enable row level security;
alter table public."Activity" enable row level security;
alter table public.books enable row level security;
alter table public.inquiries enable row level security;
alter table public.users enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'archive', 'archives', 'Activity', 'books', 'inquiries', 'users')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

create policy "Members can view own profile and admins can view all"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "Members can view permitted archives"
  on public.archive for select
  to authenticated
  using (coalesce(lower(min_role), 'user') <> 'admin' or public.is_admin());

-- Browser clients only need these two reads. Every mutation and all other table
-- access is performed by a server route/action after its own authorization check.
revoke all privileges on table
  public.profiles,
  public.archive,
  public.archives,
  public."Activity",
  public.books,
  public.inquiries,
  public.users
from anon, authenticated;

grant select on table public.profiles, public.archive to authenticated;

-- Remove broad policies that allowed any signed-in user to upload to arbitrary
-- buckets or replace book covers. Signed, single-use admin upload URLs replace them.
drop policy if exists "Allow public upload 179dn28_0" on storage.objects;
drop policy if exists "Allow public upload 179dn28_1" on storage.objects;
drop policy if exists "Allow public upload 179dn28_2" on storage.objects;
drop policy if exists "관리자만 사진 업로드 허용" on storage.objects;
drop policy if exists "누구나 사진 보기 허용" on storage.objects;

update storage.buckets
set public = false,
    file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf']::text[]
where id = 'archives';

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['application/pdf']::text[]
where id = 'journals';

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id in ('activity-images', 'book-covers');

commit;
