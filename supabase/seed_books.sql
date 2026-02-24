-- ================================================================
-- books 테이블 시드 데이터 (5권)
-- Supabase SQL Editor에서 실행하세요
-- ON CONFLICT: title+author 조합이 같으면 스킵 (중복 방지)
-- ================================================================

insert into public.books (title, author, translator, publisher, published_year, series, description, is_featured, cover_url, buy_link)
values
  (
    '나카다 주지의 사중복음',
    '나카다 주지',
    '소기호, 정민임',
    '서울신학대학교출판부',
    2023,
    'GIFT 사중복음 신학 시리즈 8',
    '일본 홀리네스 교단의 창립자 나카다 주지의 사중복음 강의와 설교 원고를 집대성한 책입니다.',
    true,
    null,
    null
  ),
  (
    '존 웨슬리의 주일예배서',
    '글로벌사중복음연구소',
    '박창훈 외',
    '서울신학대학교출판부',
    2023,
    'GIFT 사중복음 신학 시리즈 9',
    '존 웨슬리가 직접 제작한 주일예배 기도문을 엮은 예배 지침서입니다.',
    false,
    null,
    null
  ),
  (
    'Radical Holiness Movement (English)',
    'Bundy, Park, Kang, Thompson',
    null,
    '서울신학대학교출판부',
    2023,
    'GIFT 사중복음 신학 시리즈 10',
    'The collected academic papers on the Radical Holiness Movement.',
    true,
    null,
    null
  ),
  (
    '데우스 호모(DEUS HOMO)',
    '최인식',
    null,
    'CLC',
    2021,
    'GIFT 사중복음 신학 시리즈 7',
    '미래의 신학 미래의 교회에 대한 통찰을 담은 기념비적 연구서입니다.',
    true,
    null,
    null
  ),
  (
    '사중복음과 21세기 영성',
    '글로벌사중복음연구소',
    null,
    '서울신학대학교출판부',
    2022,
    'GIFT 사중복음 신학 시리즈 6',
    '사중복음의 현대적 적용을 다각도로 조명한 논문집입니다.',
    false,
    null,
    null
  )
on conflict do nothing;

-- 삽입 확인
select id, title, author, series, is_featured from public.books order by series;
