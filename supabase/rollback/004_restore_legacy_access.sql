-- Emergency rollback for 004_harden_content_and_storage_access.sql.
-- This restores the policy/RLS/bucket snapshot captured immediately before 004.

begin;

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

grant all privileges on table
  public.profiles,
  public.archive,
  public.archives,
  public."Activity",
  public.books,
  public.inquiries,
  public.users
to anon, authenticated;

create policy "관리자만 활동 내역 등록 허용"
  on public."Activity" for insert
  with check (auth.role() = 'authenticated');
create policy "누구나 활동 내역 보기 허용"
  on public."Activity" for select
  using (true);
alter table public."Activity" disable row level security;

create policy "Enable delete for users based on user_id"
  on public.archive for delete using ((select auth.uid()) = user_id);
create policy "삭제_본인만"
  on public.archive for delete using (auth.uid() = user_id);
create policy "Enable insert for authenticated users only"
  on public.archive for insert to authenticated with check (true);
create policy "쓰기_본인만"
  on public.archive for insert with check (auth.uid() = user_id);
create policy "Enable read access for all users"
  on public.archive for select using (true);
create policy "읽기_누구나"
  on public.archive for select using (true);
create policy "Enable update for users based on user_id"
  on public.archive for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "수정_본인만"
  on public.archive for update using (auth.uid() = user_id);

create policy "누구나 자료실 조회 가능"
  on public.archives for select using (true);

create policy "Admins can manage books"
  on public.books for all
  using (get_user_role() = 'ADMIN') with check (get_user_role() = 'ADMIN');
create policy "Anyone can view books"
  on public.books for select using (true);
alter table public.books disable row level security;

create policy "Users can delete own inquiries"
  on public.inquiries for delete to authenticated using (auth.uid() = user_id);
create policy "Users can insert own inquiries"
  on public.inquiries for insert to authenticated with check (auth.uid() = user_id);
create policy "Authenticated users can view inquiries"
  on public.inquiries for select to authenticated using (true);
create policy "Users can update own inquiries"
  on public.inquiries for update to authenticated using (auth.uid() = user_id);

create policy "Internal trigger can insert"
  on public.profiles for insert with check (auth.uid() = id);
create policy "Admins can view all profiles"
  on public.profiles for select using (get_user_role() = 'ADMIN');
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Admins can update roles"
  on public.profiles for update using (get_user_role() = 'ADMIN');

create policy "Admins can do everything"
  on public.users for all using (get_my_role() = 'admin');

create policy "Allow public upload 179dn28_0"
  on storage.objects for select to anon, authenticated using (true);
create policy "Allow public upload 179dn28_1"
  on storage.objects for insert to authenticated with check (true);
create policy "Allow public upload 179dn28_2"
  on storage.objects for update to anon, authenticated using (bucket_id = 'book-covers');
create policy "관리자만 사진 업로드 허용"
  on storage.objects for insert
  with check (bucket_id = 'activity-images' and auth.role() = 'authenticated');
create policy "누구나 사진 보기 허용"
  on storage.objects for select using (bucket_id = 'activity-images');

update storage.buckets
set public = true,
    file_size_limit = null,
    allowed_mime_types = null
where id in ('archives', 'journals', 'activity-images', 'book-covers');

drop function if exists public.is_admin();

commit;
