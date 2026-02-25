-- ================================================================
-- 기존 books 데이터 Category Backfill SQL
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

-- 1. journal_name / volume_issue 컬럼 추가 (없으면 추가)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS journal_name text,
  ADD COLUMN IF NOT EXISTS volume_issue text;

-- 2. 기존 영문저널 레코드의 category를 'journal'로 통일
--    (기존에 '영문저널'로 입력된 경우 포함, download_url이 있는 경우 힌트)
UPDATE public.books
  SET category = 'journal'
  WHERE category = '영문저널';

-- 3. category가 NULL인 기존 도서 → 일반 도서로 분류 (안전한 기본값)
--    저널이 아닌 모든 기존 데이터 보호
UPDATE public.books
  SET category = 'book'
  WHERE category IS NULL OR category = '';

-- 4. 현재 상태 확인
SELECT category, COUNT(*) as count
FROM public.books
GROUP BY category
ORDER BY category;
