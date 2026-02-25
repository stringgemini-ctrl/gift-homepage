-- ================================================================
-- 도서 상세 페이지용 컬럼 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS long_description text,      -- 책 소개 (긴 글)
  ADD COLUMN IF NOT EXISTS table_of_contents  text,   -- 목차
  ADD COLUMN IF NOT EXISTS author_bio         text;   -- 저자/역자 소개

-- 확인
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'books'
  AND column_name IN ('long_description', 'table_of_contents', 'author_bio');
