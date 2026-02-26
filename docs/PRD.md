# GIFT Project Master Specification (PRD)
> 문서 최종 업데이트: 2026-02-26

## 1. 프로젝트 정체성 (Identity)
GIFT(Global Institute for Fourfold-gospel Theology, 글로벌사중복음연구소) 홈페이지.
기독교대한성결교회의 사중복음 신학을 연구하고 보존하며, 관련 출판물(신학/신앙 시리즈 및 영문 저널)과 갤러리 아카이브를 제공하는 학술적이고 프리미엄한 웹 플랫폼입니다.

---

## 2. 기술 스택 (Tech Stack)
- **Framework**: Next.js 14 (App Router `/app` 기반, Server Components 우선)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (vanilla utility classes only, No CSS-in-JS)
- **Database & Auth**: Supabase (`@supabase/ssr` 사용 권장)
- **Deployment**: Vercel

### 핵심 개발 원칙 (Core Principles)
1. **서버 컴포넌트(RSC) 우선**: SEO 최적화와 초기 로딩 속도 향상을 위해 데이터 페칭은 가급적 Server Component에서 수행(예: `[id]/page.tsx`의 `getBook`). 불가피한 상호작용(예: PDF 모달)에만 Client Component 사용.
2. **에러 핸들링**: DB 페칭 시 `try-catch` 및 에러 로깅 필수 적용.
3. **PDF 처리 원칙**: `download_url` 필드를 활용하며, `<object>` 및 `<embed type="application/pdf">`를 사용하여 브라우저에서 강제로 PDF 렌더링(Supabase Storage의 `contentType` 이슈 우회용).
4. **모듈화**: 기능별 로직은 `/features` 디렉터리에 도메인별(예: `publications`, `admin`, `main`)로 분리.
5. **디자인 시스템 훼손 금지**: 지정된 컬러 톤(Emerald)과 유리 질감(Glassmorphism)을 유지.

---

## 3. 디자인 시스템 (Design System)
학술적이고 진중하지만 너무 무겁지 않은 **'프리미엄 다크 차콜 서재'** 테마를 채택하고 있습니다.

### Colors & Tones
- **Base Background**: `#1e2533` (Premium Dark Charcoal - 깊이감 있고 묵직한 톤)
- **Card / Surface**: 
  - `rgba(255,255,255, 0.05 ~ 0.07)` (반투명 다크글라스)
  - 보더: `rgba(255,255,255, 0.07 ~ 0.10)`
  - 그림자: `box-shadow: 0 4px 20px rgba(0,0,0,0.30)` 혹은 `0 2px 8px rgba(0,0,0,0.25)`로 배경과의 입체감 분리.
- **Accents (에메랄드 포인트)**: 
  - 기본: `#059669` / `#10b981`
  - 다크 바탕 위 가독성용: `#34d399` / `#38bdf8` / `text-emerald-400`
- **Text (다크 모드 기준)**:
  - Heading: `#e2e8f0` (slate-200) 메인 타이틀
  - Body: `text-slate-200` ~ `text-slate-300` (읽기 편안한 회백색)
  - Muted: `text-slate-400` 혹은 `rgba(255,255,255,0.40)`

### UI Components
- **Top Navigation**: `rgba(30,37,51,0.90)` + `backdrop-blur(16px)`
- **Hero Particles / 빛무리**: `radial-gradient(ellipse ... rgba(16,185,129,0.20))` 형태의 신비로운 에메랄드 광원을 에셋으로 활용.
- **Pill Filters**: 알약 형태의 라운드 필터(`rounded-full`). 활성 상태 시 그라디언트(`#065f46` -> `#047857`)와 엠보스 쉐도우 적용.

---

## 4. 데이터베이스 구조 (Database Schema)
Supabase를 기반으로 구성되어 있으며 메인 테이블은 아래와 같습니다.

### 4.1. `books` (출판물 및 저널 테이블)
- `id` (uuid, PK)
- `title` (text)
- `author` (text)
- `translator` (text) - 번역자
- `publisher` (text) - 출판사
- `published_year` (integer) - 출판 연도
- `series` (text) - 속한 시리즈
- `category` (text) - (화이트리스트: 'faith', 'theology', 'journal', '신앙시리즈', '신학시리즈', '영문저널')
- `description` (text) - 짧은 설명
- `long_description` (text) - 상세 책 소개
- `table_of_contents` (text) - 목차
- `author_bio` (text) - 저자 및 역자 소개
- `cover_url` (text) - 표지 이미지 URL (Supabase Storage 'book-covers' 버킷)
- `download_url` (text) - PDF/본문 다운로드 링크 URL
- `buy_link` (text) - 구매 링크
- `price` (numeric) - 정가
- `is_featured` (boolean) - 추천 도서 여부
- `journal_name`, `volume_issue` (text)

### 4.2. `Activity` (메인 갤러리용 테이블)
- `id`, `title`, `image_url`, `created_at` 등 포함.

---

## 5. 향후 개발 로드맵 (Roadmap: Phase 1 ~ 3)

### [Phase 1] 1층 안내 데스크 & 갤러리
- **목표**: 연구소의 첫인상과 활동 내역을 시각적으로 전달.
- **주요 기능**:
  - 연구소 소개 및 이사회 명단 UI 구현.
  - 인스타그램 형상(Grid 형태)의 활동 갤러리 고도화 (`Activity` 테이블 활용).
  - 전체적인 진입점(Landing) 경험을 프리미엄 다크 브랜드 톤으로 일관성 있게 조율.

### [Phase 2] 2층 대형 아카이브 도서관
- **목표**: 연구소의 핵심 역량인 신학/신앙 서적과 저널 데이터의 확장성 있는 아카이빙.
- **주요 기능**:
  - `publications`(`books`) 테이블 데이터 및 카테고리 태그 체계 확장.
  - 기존의 이중 필터링 구조(Category + Year) 최적화 및 페이징/무한 스크롤 도입(필요 시).
  - Admin 패널의 단행본/저널 업로드 기능(PDF 안정성 등) 고도화.

### [Phase 3] 3층 목회자 소통 라운지 (신규)
- **목표**: 성결교회 목회자 및 신학자들 간의 자율적 소통 커뮤니티 공간 신설.
- **주요 기능**:
  - `lounge_posts` 신규 테이블 설계 (게시판/라운지 역할).
  - 오픈 라운지 형태의 깔끔하고 개방감 있는 UI 구성 (본관의 프리미엄 다크와는 별도의 공간감 부여 혹은 통일성 유지 방안 검토).
  - 댓글, 좋아요 기능 혹은 단순 의견 교환 기능 (추후 기획 세분화).
