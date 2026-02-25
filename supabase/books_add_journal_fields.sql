-- ================================================================
-- books 테이블 마이그레이션: 영문 저널 전용 컬럼 추가
-- Supabase SQL Editor에서 실행하세요
-- ================================================================

ALTER TABLE public.books
  -- 저널 이름 (ex: "GIFT Journal")
  ADD COLUMN IF NOT EXISTS journal_name text,

  -- 권·호 정보 (ex: "Vol.3, No.1")
  ADD COLUMN IF NOT EXISTS volume_issue text;

-- ※ pdf_url은 기존 download_url 컬럼이 동일 역할을 하므로 별도 추가 불필요
-- ※ category 컬럼은 이전 마이그레이션에서 이미 추가됨 (ADD COLUMN IF NOT EXISTS 사용)

-- 기존 영문저널 데이터의 category가 null이라면 일괄 업데이트
-- UPDATE public.books SET category = '영문저널' WHERE download_url IS NOT NULL AND category IS NULL;

-- 확인
SELECT id, title, category, journal_name, volume_issue, download_url
FROM public.books
ORDER BY category, journal_name, volume_issue;
