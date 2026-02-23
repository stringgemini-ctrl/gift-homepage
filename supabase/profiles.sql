-- 1. profiles 테이블 생성
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'user' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. RLS(Row Level Security) 활성화
alter table public.profiles enable row level security;

-- 3. 정책(Policies) 설정
-- 전체 목록 조회는 admin만 가능
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

-- 자신의 프로필은 누구나 조회 가능
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- 프로필 권한(role) 수정은 admin만 가능
create policy "Admins can update roles"
  on public.profiles for update
  using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );

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

-- 트리거 설정
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
