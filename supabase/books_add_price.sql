-- ================================================================
-- books 테이블 마이그레이션: price 컬럼 추가
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

alter table public.books
  add column if not exists price integer; -- 단위: 원(₩), nullable
