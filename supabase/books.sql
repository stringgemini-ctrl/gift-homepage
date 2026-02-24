-- ================================================================
-- books 테이블 마이그레이션: 필드 추가
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

-- 1. 신규 컬럼 추가 (translator, publisher, published_year, series)
alter table public.books
  add column if not exists translator    text,
  add column if not exists publisher     text,
  add column if not exists published_year integer,
  add column if not exists series        text;

-- ================================================================
-- book-covers Storage 버킷 Policy 설정
-- Supabase SQL Editor에서 함께 실행하세요
-- ================================================================

-- INSERT: 로그인한 사용자(authenticated)만 업로드 가능
insert into storage.policies (name, bucket_id, operation, definition)
values
  (
    'Authenticated users can upload book covers',
    'book-covers',
    'INSERT',
    '(role() = ''authenticated'')'
  )
on conflict do nothing;

-- SELECT: 누구나 이미지 열람 가능 (공개 갤러리용)
insert into storage.policies (name, bucket_id, operation, definition)
values
  (
    'Anyone can view book covers',
    'book-covers',
    'SELECT',
    'true'
  )
on conflict do nothing;

-- ⚠️ 위 SQL이 안 되면 대시보드에서 수동 설정:
-- Storage → book-covers 버킷 → Policies 탭
-- Policy 1: INSERT, role = authenticated
-- Policy 2: SELECT, true (공개)
