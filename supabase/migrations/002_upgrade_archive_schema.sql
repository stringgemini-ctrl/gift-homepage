-- ============================================================
-- GIFT 연구소 archive 테이블 스키마 업그레이드
-- 목적: fourfoldgospel.org 데이터 이관을 위한 컬럼 확장
-- 실행 위치: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. archive 테이블 핵심 컬럼 추가 (IF NOT EXISTS로 멱등성 보장)
-- ------------------------------------------------------------

-- 제목
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS title TEXT;

-- 저자
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS author TEXT;

-- 발행일 (YYYY-MM-DD 또는 YYYY 형식 모두 허용)
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS published_date DATE;

-- 카테고리 (예: '사중복음 논문', '연구소 간행물' 등)
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS category TEXT;

-- 요약문 (abstract)
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS abstract_text TEXT;

-- 본문 HTML (원본 사이트 게시글 HTML)
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS content TEXT;

-- 첨부 PDF 영구 URL (Supabase Storage 업로드 후 발급된 URL)
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- 원본 출처 URL (fourfoldgospel.org 원본 게시글 주소)
ALTER TABLE public.archive
  ADD COLUMN IF NOT EXISTS original_url TEXT UNIQUE;

-- ------------------------------------------------------------
-- 2. 중복 방지 인덱스 (title 기반 upsert 충돌 방지)
-- ------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS archive_title_unique_idx
  ON public.archive (title);

-- ------------------------------------------------------------
-- 3. 컬럼 코멘트 (Supabase Studio에서 가독성 향상)
-- ------------------------------------------------------------
COMMENT ON COLUMN public.archive.title          IS '논문/게시물 제목';
COMMENT ON COLUMN public.archive.author         IS '저자 (원본 제목 "[저자] 제목" 패턴에서 파싱)';
COMMENT ON COLUMN public.archive.published_date IS '발행일 (YYYY-MM-DD). 원본 정보 없으면 NULL';
COMMENT ON COLUMN public.archive.category       IS '분류: 사중복음 논문 | 연구소 간행물 | 도서 시리즈 등';
COMMENT ON COLUMN public.archive.abstract_text  IS '요약문 (abstract). 원본에 없으면 빈 문자열';
COMMENT ON COLUMN public.archive.content        IS '본문 HTML (이미지 경로는 절대 URL로 치환됨)';
COMMENT ON COLUMN public.archive.pdf_url        IS 'Supabase Storage 업로드 후 영구 공개 URL';
COMMENT ON COLUMN public.archive.original_url   IS '원본 출처 URL (fourfoldgospel.org). UNIQUE 제약';
