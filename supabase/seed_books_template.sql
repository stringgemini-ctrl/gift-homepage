-- ================================================================
-- books 테이블 마이그레이션: category, download_url 컬럼 추가
-- (사용자가 직접 실행 예정)
-- ================================================================
-- ALTER TABLE public.books
--   ADD COLUMN IF NOT EXISTS category text,
--   ADD COLUMN IF NOT EXISTS download_url text;

-- ================================================================
-- INSERT 템플릿: 신학 시리즈 11권 (예시 – 실제 데이터로 교체)
-- ================================================================
INSERT INTO public.books
  (title, author, translator, publisher, published_year, series, category, description, cover_url, buy_link, price, is_featured)
VALUES
-- 1~8번: 기등록 데이터가 있으면 스킵
  ('나카다 주지의 사중복음', '나카다 주지', '소기호, 정민임', '서울신학대학교출판부', 2023,
   'GIFT 사중복음 신학 시리즈 8', '신학시리즈', '일본 홀리네스 교단의 창립자 나카다 주지의 사중복음 강의와 설교 원고를 집대성한 책입니다.',
   NULL, NULL, NULL, true),
  ('존 웨슬리의 주일예배서', '글로벌사중복음연구소', '박창훈 외', '서울신학대학교출판부', 2023,
   'GIFT 사중복음 신학 시리즈 9', '신학시리즈', '존 웨슬리가 직접 제작한 주일예배 기도문을 엮은 예배 지침서입니다.',
   NULL, NULL, NULL, false),
  ('홀리 점퍼스', 'William Kostlevy', '김상기, 오주영, 장혜선', '도서출판 선인', 2025,
   'GIFT 사중복음 신학 시리즈 11', '신학시리즈', '19세기 미국 성결 운동의 역사를 다룬 선구적인 연구서입니다.',
   NULL, NULL, 28000, true),
  -- ↓ 나머지 8권 데이터를 아래에 추가하세요
  -- ('제목', '저자', '번역자', '출판사', 연도, '시리즈명', '신학시리즈', '소개글', NULL, NULL, 가격, false),
  ('Radical Holiness Movement (English)', 'Bundy, Park, Kang, Thompson', NULL, '서울신학대학교출판부', 2023,
   'GIFT 사중복음 신학 시리즈 10', '신학시리즈', 'The collected academic papers on the Radical Holiness Movement.',
   NULL, NULL, NULL, true),
  ('데우스 호모(DEUS HOMO)', '최인식', NULL, 'CLC', 2021,
   'GIFT 사중복음 신학 시리즈 7', '신학시리즈', '미래의 신학 미래의 교회에 대한 통찰을 담은 기념비적 연구서입니다.',
   NULL, NULL, NULL, true),
  ('사중복음과 21세기 영성', '글로벌사중복음연구소', NULL, '서울신학대학교출판부', 2022,
   'GIFT 사중복음 신학 시리즈 6', '신학시리즈', '사중복음의 현대적 적용을 다각도로 조명한 논문집입니다.',
   NULL, NULL, NULL, false)
ON CONFLICT DO NOTHING;

-- ================================================================
-- INSERT 템플릿: 신앙 시리즈 3권 (실제 데이터로 교체)
-- ================================================================
INSERT INTO public.books
  (title, author, translator, publisher, published_year, series, category, description, cover_url, buy_link, price, is_featured)
VALUES
  ('신앙시리즈 도서 1', '저자명', NULL, '출판사명', 2024, '시리즈명', '신앙시리즈', '도서 소개', NULL, NULL, NULL, false),
  ('신앙시리즈 도서 2', '저자명', NULL, '출판사명', 2024, '시리즈명', '신앙시리즈', '도서 소개', NULL, NULL, NULL, false),
  ('신앙시리즈 도서 3', '저자명', NULL, '출판사명', 2024, '시리즈명', '신앙시리즈', '도서 소개', NULL, NULL, NULL, false)
ON CONFLICT DO NOTHING;

-- ================================================================
-- INSERT 템플릿: 영문 저널 Vol.1 ~ Vol.10
-- download_url 필드에 PDF 링크를 직접 입력하세요
-- ================================================================
INSERT INTO public.books
  (title, author, translator, publisher, published_year, series, category, description, cover_url, buy_link, price, download_url, is_featured)
VALUES
  ('GIFT Journal Vol.1', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2015, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 1.', NULL, NULL, NULL, 'https://example.com/journal/vol1.pdf', false),
  ('GIFT Journal Vol.2', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2016, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 2.', NULL, NULL, NULL, 'https://example.com/journal/vol2.pdf', false),
  ('GIFT Journal Vol.3', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2017, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 3.', NULL, NULL, NULL, 'https://example.com/journal/vol3.pdf', false),
  ('GIFT Journal Vol.4', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2018, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 4.', NULL, NULL, NULL, 'https://example.com/journal/vol4.pdf', false),
  ('GIFT Journal Vol.5', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2019, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 5.', NULL, NULL, NULL, 'https://example.com/journal/vol5.pdf', false),
  ('GIFT Journal Vol.6', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2020, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 6.', NULL, NULL, NULL, 'https://example.com/journal/vol6.pdf', false),
  ('GIFT Journal Vol.7', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2021, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 7.', NULL, NULL, NULL, 'https://example.com/journal/vol7.pdf', false),
  ('GIFT Journal Vol.8', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2022, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 8.', NULL, NULL, NULL, 'https://example.com/journal/vol8.pdf', false),
  ('GIFT Journal Vol.9', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2023, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 9.', NULL, NULL, NULL, 'https://example.com/journal/vol9.pdf', false),
  ('GIFT Journal Vol.10', '글로벌사중복음연구소', NULL, '글로벌사중복음연구소', 2024, 'GIFT 영문저널', '영문저널', 'Academic journal on Fourfold Gospel theology - Volume 10.', NULL, NULL, NULL, 'https://example.com/journal/vol10.pdf', true)
ON CONFLICT DO NOTHING;

-- 삽입 확인
SELECT id, title, category, download_url IS NOT NULL AS has_download FROM public.books ORDER BY category, series;
