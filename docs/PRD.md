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

## 5. 현재 구현 상태 (Current Status: 2026-02-28 기준)

### 5.1. 아키텍처 및 폴더 구조 (FSD 기반 모듈화)
- 기존 `/components` 및 `/lib`의 파편화된 파일들을 도메인 주도 설계(FSD) 방식에 따라 `/features` 디렉터리로 전면 개편 완료.
- **주요 도메인 분리**: `admin`, `auth`, `core`, `database`, `main`, `publications`
- 라우팅은 Next.js App Router(`/app`)를 유지하며 비즈니스 로직과 UI 컴포넌트는 `/features` 내 위임.

### 5.2. 핵심 기능 구현 완료 내역
- **메인 페이지 (Main & Gallery)**:
  - 프리미엄 다크 테마(Dark Charcoal) 및 에메랄드 오로라 파티클(`HeroParticles`) 적용 완료.
  - Supabase `Activity` 테이블 수동 연동을 통한 `GallerySection` 및 `ResourceSection` 구현 완료.
- **출판물 및 저널 시스템 (Publications)**:
  - `BookCard` 및 `JournalCard` 컴포넌트를 분리하고, 강렬한 3D 글래스모피즘(두꺼운 반투명 유리, 그림자, 호버 리프트) UI 완벽 적용.
  - 도서/저널 필터링 로직 구현 (`CategoryFilter`).
  - 브라우저 내장(In-app) PDF 뷰어 탑재 (`PdfModal`, `<object>` 태그 기반 렌더링).
- **관리자 패널 및 데이터 조작 (Admin & Auth)**:
  - `BookManagement`: 단행본 및 영문 저널 객체의 메타데이터 수정 및 파일(표지 이미지, PDF 파일) Supabase Storage 다이렉트 업로드 기능 구현.
  - `GalleryUpload`: 갤러리 이미지 업로드 및 관리 컨트롤 패널 연동.
  - 권한 처리(`permissions.ts`) 로직 확립 및 인증(Auth) 세션 기반 접근 제어.

### 5.3. 향후 과제 (Next Steps)
- **Phase 3 (커뮤니티 라운지)**: 목회자 소통 공간 (`lounge_posts` 기반) 백엔드 스키마 설계 및 UI 착수 대기 중.
- 성능 최적화: 렌더링 속도 향상을 위한 Suspense 및 Next.js 14 Image placeholder 고도화.
- 다이내믹 SEO 메타태그(Open Graph 등) 적용.
