-- 1. profiles 테이블 생성
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS(Row Level Security) 활성화
alter table public.profiles enable row level security;

-- 3. 무한 루프(Infinite Recursion) 방지를 위한 헬퍼 함수 생성
-- RLS 정책 내에서 profiles 테이블을 다시 조회하면 무한 루프에 빠지므로, 권한을 우회(security definer)하여 조회하는 함수를 만듭니다.
create or replace function public.get_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 4. 정책(Policies) 설정 (기존 충돌 방지를 위해 먼저 삭제)
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can update roles" on public.profiles;
drop policy if exists "Internal trigger can insert" on public.profiles;

-- 전체 목록 조회는 admin만 가능
create policy "Admins can view all profiles"
  on public.profiles for select
  using ( public.get_user_role() = 'admin' );

-- 자신의 프로필은 누구나 조회 가능
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- 프로필 권한(role) 수정은 admin만 가능
create policy "Admins can update roles"
  on public.profiles for update
  using ( public.get_user_role() = 'admin' );

-- 프로필 삽입(Insert)은 내부 트리거로만 실행되도록 허용
create policy "Internal trigger can insert"
  on public.profiles for insert
  with check ( auth.uid() = id );


-- 4. 자동으로 profiles 테이블에 유저 정보 넣기 위한 함수 및 트리거 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'user'));
  return new;
end;
$$ language plpgsql security definer;

-- 7. 기존 가입자 정보 동기화 (기존 유저들도 profiles 테이블에 생성)
insert into public.profiles (id, email, role)
select id, email, coalesce(raw_user_meta_data->>'role', 'user')
from auth.users
on conflict (id) do nothing;
