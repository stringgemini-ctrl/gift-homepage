-- ================================================================
-- books 테이블 생성 스크립트
-- 연구소 출간 도서 관리용
-- ================================================================

-- 1. 테이블 생성
create table if not exists public.books (
  id          uuid default gen_random_uuid() primary key,
  title       text not null,
  author      text not null,
  description text,
  cover_url   text,           -- Supabase Storage의 공개 URL
  buy_link    text,           -- 구매 링크 (교보문고, 예스24 등)
  is_featured boolean default false, -- 메인 페이지 추천 노출 여부
  created_at  timestamptz default now() not null
);

-- 2. RLS 활성화
alter table public.books enable row level security;

-- 3. 정책: 누구나 조회 가능 (공개 도서 목록)
drop policy if exists "Anyone can view books" on public.books;
create policy "Anyone can view books"
  on public.books
  for select
  using (true);

-- 4. 정책: ADMIN만 삽입/수정/삭제 가능
drop policy if exists "Admins can manage books" on public.books;
create policy "Admins can manage books"
  on public.books
  for all
  using (public.get_user_role() = 'ADMIN')
  with check (public.get_user_role() = 'ADMIN');

-- 5. Storage 버킷: book-covers
-- Supabase 대시보드 > Storage > New Bucket 에서 'book-covers' 를 Public 버킷으로 생성하세요.
-- (SQL로는 버킷 생성이 제한적이므로 대시보드에서 수동 생성 권장)
