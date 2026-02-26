# GIFT_PROJECT_MASTER_SPEC.md
# 글로벌사중복음연구소 (GIFT) 공식 홈페이지 — 마스터 아키텍처 스펙

> 이 문서는 새로운 AI가 GIFT 프로젝트의 코드 컨텍스트를 처음부터 100% 파악할 수 있도록
> 작성된 '살아있는 스펙 문서'입니다. 작업 이전에 반드시 전체를 정독하십시오.

---

## 1. Project Identity

### 1.1 기관 소개
- **기관명**: 글로벌사중복음연구소 (GIFT · Global Institute for the Fourfold-Gospel Theology)
- **모기관**: 기독교대한성결교회 (Korea Evangelical Holiness Church)
- **소장**: 이용호
- **주소**: 경기도 부천시 소사구 호현로 489번길 52, 서울신학대학교 100주년기념관 306호
- **전화**: 032-340-9271
- **GitHub Repository**: `stringgemini-ctrl/gift-homepage`
- **배포 플랫폼**: Vercel (main 브랜치 자동 배포)

### 1.2 서비스 정체성
이 홈페이지는 단순 아카이브 사이트가 아닌, **기독교대한성결교회의 신학적 정체성 — 사중복음(중생·성결·신유·재림)**을 학문적·출판적으로 연구하고 공유하는 **공식 기관 홈페이지**입니다.

- 출간 도서 소개 및 PDF 저널 열람
- 학술 자료실 (archive)
- 활동 갤러리
- 관리자 도서 등록/수정/삭제
- 회원 인증 및 역할 기반 접근 제어

---

## 2. Tech Stack & Infrastructure

### 2.1 핵심 프레임워크
| 항목 | 선택 | 버전/비고 |
|---|---|---|
| Framework | **Next.js App Router** | `/app` 디렉터리 전용. Pages Router 사용 금지 |
| Language | **TypeScript** | strict 모드 |
| Styling | **Tailwind CSS v4** | CSS-in-JS(styled-components 등) 전면 금지 |
| Database/Auth | **Supabase** | 최신 `@supabase/ssr` 패키지 전용 (deprecated `auth-helpers` 사용 금지) |
| Animation | **Framer Motion** | 일부 컴포넌트에서 사용 |

### 2.2 Supabase 클라이언트 패턴
```typescript
// ✅ 서버 컴포넌트 / Server Action용 (RLS 우회 필요 시)
import { createClient } from '@supabase/supabase-js'
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ✅ 클라이언트 컴포넌트용
// features/database/lib/supabase.ts 에서 import
import { supabase } from '@/features/database/lib/supabase'
```

### 2.3 환경 변수 (필수)
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...          # 서버 전용, 클라이언트 노출 금지
```

### 2.4 배포
- `git push origin main` → Vercel 자동 빌드/배포
- 로컬 개발: `npm run dev` (포트 3000)

---

## 3. Database Schema & Storage

### 3.1 `books` 테이블 — 최신 완전 스키마

```sql
-- 기관의 출간 도서 및 영문 저널을 통합 관리하는 핵심 테이블
CREATE TABLE public.books (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now(),

  -- ── 기본 정보 ─────────────────────────────────────────────
  title            text NOT NULL,
  author           text NOT NULL,
  translator       text,            -- 번역자 (없으면 null)
  publisher        text,
  published_year   integer,
  series           text,            -- 예: "신학시리즈", "신앙시리즈"

  -- ── 카테고리 ──────────────────────────────────────────────
  -- 유효값 whitelist: 'theology' | '신학시리즈' | 'faith' | '신앙시리즈' | 'journal' | '영문저널'
  category         text,

  -- ── 소개 텍스트 (3단계) ───────────────────────────────────
  description      text,            -- 짧은 소개 (목록 카드용)
  long_description text,            -- 긴 소개 (상세 페이지 "책 소개" 탭)
  table_of_contents text,           -- 목차 (상세 페이지 "목차" 탭, 줄바꿈 보존)
  author_bio       text,            -- 저자/역자 약력 (상세 페이지 "저자 소개" 탭)

  -- ── 미디어 & 구매 ─────────────────────────────────────────
  cover_url        text,            -- Supabase Storage book-covers 버킷 publicUrl
  buy_link         text,            -- 외부 구매 링크 (예스24, 교보 등)
  download_url     text,            -- PDF URL (journal용) — pdf_url과 동일 역할, 별도 컬럼 없음
  price            integer,         -- 단위: 원(₩)

  -- ── 영문 저널 전용 ────────────────────────────────────────
  journal_name     text,            -- 예: "GIFT Journal"
  volume_issue     text,            -- 예: "Vol.3, No.1"

  -- ── 메타 ──────────────────────────────────────────────────
  is_featured      boolean DEFAULT false  -- 추천 도서 / LATEST 저널 표시 여부
);
```

> **⚠️ 중요**: `pdf_url`이라는 별도 컬럼은 존재하지 않습니다. `download_url`이 PDF 역할을 합니다.
> 모든 코드에서 `download_url`을 PDF URL로 사용하십시오.

### 3.2 마이그레이션 파일 목록 (실행 순서)
```
supabase/books.sql                    # translator, publisher, published_year, series 추가
supabase/books_add_price.sql          # price 컬럼 추가
supabase/books_add_journal_fields.sql # journal_name, volume_issue 추가
supabase/books_add_detail_fields.sql  # long_description, table_of_contents, author_bio 추가
supabase/migrations/001_profiles_and_archive_min_role.sql  # profiles, archive, role 설정
```

> **⚠️ `books_add_detail_fields.sql`은 아직 Supabase에서 실행하지 않았을 수 있습니다.**
> 관리자 폼에서 책 소개/목차/저자 소개 필드가 저장되지 않는다면 이 파일을 실행하십시오.

### 3.3 `profiles` 테이블
```sql
CREATE TABLE public.profiles (
  id    uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  role  text DEFAULT 'user'  -- 'admin' | 'user'
);
```
- role = `'admin'` → 관리자 기능 접근 허용
- 미들웨어에서 `SUPABASE_SERVICE_ROLE_KEY`로 role 확인

### 3.4 `archive` 테이블 (자료실)
```sql
-- 학술 논문, 연구소 간행물 등 열람/다운로드 자료
CREATE TABLE public.archive (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  title      text NOT NULL,
  category   text,             -- 예: "논문", "간행물"
  content    text,
  file_url   text
);
```

### 3.5 Supabase Storage 버킷 구조

| 버킷 이름 | 공개 여부 | 용도 |
|---|---|---|
| `book-covers` | Public | 도서 표지 이미지 (.jpg, .png, .webp) |
| `journals` | Public | 영문 저널 PDF 파일 (.pdf) |

#### 업로드 플로우 (관리자 폼 — `BookManagement.tsx`)

```
[표지 이미지 업로드]
1. 관리자가 파일 선택 (handleFileChange)
2. Date.now() + Math.random().toString(36) 로 난수 파일명 생성
3. supabase.storage.from('book-covers').upload(fileName, file)
4. getPublicUrl(fileName) → form.cover_url에 자동 동기화
5. 폼 제출 시 cover_url이 DB에 저장됨

[PDF 업로드 - journal 전용]
1. category === 'journal' 선택 시 PDF 업로드 섹션 노출
2. 관리자가 PDF 파일 선택 (handlePdfUpload)
3. 동일한 난수 파일명으로 supabase.storage.from('journals').upload()
4. getPublicUrl() → form.download_url에 자동 동기화
5. 폼 제출 시 download_url이 DB에 저장됨
```

---

## 4. Architecture & Defense Logic

### 4.1 디렉터리 구조

```
my-second-brain/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 전역 레이아웃 (Navbar 포함)
│   ├── page.tsx                   # 메인 홈 페이지 (Client Component)
│   ├── publications/
│   │   ├── page.tsx               # 출간 도서 목록 (Server Component)
│   │   └── [id]/page.tsx          # 도서/저널 상세 (Server Component)
│   ├── archive/
│   │   ├── page.tsx               # 자료실 목록
│   │   └── [id]/page.tsx          # 자료 상세
│   ├── admin/
│   │   ├── page.tsx               # 관리자 대시보드
│   │   ├── users/page.tsx         # 회원 관리
│   │   └── actions.ts             # Server Actions (getAllBooks, createBook, updateBook, deleteBook)
│   └── login/page.tsx             # 로그인
│
├── features/                      # 도메인별 로직 분리
│   ├── auth/
│   │   ├── components/AuthProvider.tsx
│   │   ├── components/NavAuth.tsx
│   │   └── lib/permissions.ts
│   ├── core/
│   │   ├── components/Header.tsx
│   │   └── components/Navbar.tsx
│   ├── database/
│   │   └── lib/supabase.ts        # 클라이언트용 Supabase 인스턴스
│   ├── main/
│   │   └── components/
│   │       ├── GallerySection.tsx  # 활동 갤러리 (모듈화 — 유실 방지)
│   │       └── ResourceSection.tsx # 자료실 섹션 (모듈화 — 유실 방지)
│   ├── admin/
│   │   └── components/
│   │       ├── BookManagement.tsx  # 도서 CRUD 폼 (핵심 관리자 UI)
│   │       ├── MemberManagement.tsx
│   │       └── GalleryUpload.tsx
│   └── publications/
│       └── components/
│           ├── BookCard.tsx        # 도서 카드 (3D 책등 효과)
│           ├── BookTabs.tsx        # 상세 페이지 탭 (책 소개/목차/저자 소개) — Client
│           ├── CategoryFilter.tsx  # 카테고리 필터 + 도서 그리드
│           ├── HeroParticles.tsx   # 출간 도서 페이지 히어로 파티클
│           ├── JournalCard.tsx     # 영문 저널 카드 (클릭 → PdfModal)
│           ├── JournalPdfButton.tsx # 상세 페이지 PDF 뷰어 버튼 — Client
│           └── PdfModal.tsx        # 인앱 PDF iframe 뷰어 — Client
│
└── supabase/                      # DB 마이그레이션 SQL 파일들
```

### 4.2 Server vs Client Component 원칙

| 컴포넌트 | 타입 | 이유 |
|---|---|---|
| `app/publications/page.tsx` | **Server** | SEO, Supabase 서버 페칭 |
| `app/publications/[id]/page.tsx` | **Server** | SEO, `SUPABASE_SERVICE_ROLE_KEY` 사용 |
| `app/page.tsx` | **Client** | `useState`, `useEffect`, 이미지 클릭 상태 필요 |
| `features/publications/components/BookTabs.tsx` | **Client** | 탭 전환 상태 (`useState`) 필요 |
| `features/publications/components/JournalPdfButton.tsx` | **Client** | PDF Modal 열기/닫기 상태 필요 |
| `features/publications/components/PdfModal.tsx` | **Client** | ESC 키 이벤트, body overflow 제어 |
| `features/admin/components/BookManagement.tsx` | **Client** | 파일 업로드, 폼 상태 관리 |

> **규칙**: 서버 컴포넌트 안에서 `onClick` 등 이벤트 핸들러가 필요하면 반드시 별도 Client 컴포넌트(`'use client'`)로 분리하십시오.

### 4.3 메인 페이지 모듈화 (유실 방지 구조)

`app/page.tsx` 수정 시 갤러리/자료실 섹션이 실수로 삭제되는 것을 영구 방지하기 위해 분리:

```tsx
// app/page.tsx
import GallerySection from '@/features/main/components/GallerySection'
import ResourceSection from '@/features/main/components/ResourceSection'

// ...
<GallerySection activities={activities} onImageClick={setSelectedImage} />
<ResourceSection posts={posts} />
```

**규칙**: 앞으로 `app/page.tsx`의 사중복음 섹션, 히어로 섹션 등을 수정할 때 위 두 컴포넌트 임포트를 절대 제거하지 마십시오.

### 4.4 데이터 페칭 에러 방어

```typescript
// ✅ 올바른 패턴 — try-catch + console.error fallback
const fetchLatestPosts = async () => {
  try {
    const { data, error } = await supabase.from('archive').select('*')...
    if (error) { console.error('[fetchLatestPosts]', error.message); return }
    if (data) setPosts(data)
  } catch (e) {
    console.error('[fetchLatestPosts] 예기치 못한 에러:', e)
  }
}

// ❌ 금지 패턴 — 에러 시 화면 중단 위험
const { data } = await supabase.from('archive').select('*')
if (data) setPosts(data)
```

### 4.5 카테고리 유효성 Whitelist

```typescript
// CategoryFilter.tsx 에서 사용
const VALID_CATEGORIES = ['theology', '신학시리즈', 'faith', '신앙시리즈', 'journal', '영문저널']
const validBooks = books.filter(b => b.category && VALID_CATEGORIES.includes(b.category))
```

카테고리가 이 whitelist에 없는 도서(잘못 입력된 데이터 등)는 탭 카운트와 그리드에서 자동 제외됩니다.

### 4.6 PdfModal iframe 빈 src 버그 방지

```tsx
// PdfModal.tsx — URL 없을 때 homepage(/) 로드하는 버그 방지
{pdfUrl && pdfUrl.startsWith('http') ? (
  <iframe src={pdfUrl} className="w-full h-full border-none" title={title} allowFullScreen />
) : (
  <div>등록된 PDF가 없습니다</div>
)}
```

---

## 5. Design System — Modern Editorial

### 5.1 핵심 철학

- **배제**: IT 스타트업 템플릿, 네온 글로우(neon glow), Lucide 같은 기본 웹 아이콘
- **추구**: 현대 국립 박물관 또는 최고급 신학 저널 수준의 디자인
- **키워드**: 여백(Negative Space), 타이포그래피 대비, 소재감, 고전적 무게감

### 5.2 타이포그래피 규칙

| 용도 | 클래스 | 설명 |
|---|---|---|
| 핵심 키워드/제목 | `font-serif` | 명조체 — 고전 문헌의 무게감, 역사성 부여 |
| 본문/설명 텍스트 | `font-sans` | 고딕/산세리프 — 가독성, 현대적 대비 |
| 목차 렌더링 | `font-mono whitespace-pre-wrap` | 들여쓰기/줄바꿈 보존 |

**극적 대비 원칙**: 제목(`font-serif`, 크고 묵직하게) + 본문(`font-sans`, 작고 깔끔하게)의 조합이 에디토리얼 디자인의 핵심입니다. 두 가지를 같은 폰트로 쓰지 마십시오.

### 5.3 사중복음 4색 테마 (Theological Colors)

| 항목 | 한글 | 영문 | 색상 규정 | HEX |
|---|---|---|---|---|
| 01 | 중생 | Regeneration | **Crimson** (rose-800) | `#9f1239` |
| 02 | 성결 | Sanctification | **Pure Gold** (amber-700) | `#b45309` |
| 03 | 신유 | Divine Healing | **Sage Green** (teal-700) | `#0f766e` |
| 04 | 재림 | Second Coming | **Slate Blue** (blue-800) | `#1e40af` |

각 색상은 다음 3가지 역할에 일관되게 사용됩니다:
1. 카드 상단 `borderTop` 악센트 (3px)
2. 아이콘/서브타이틀 텍스트 컬러
3. 호버 시 퍼지는 glow (`glowColor`)

### 5.4 사중복음 카드 워터마크 기법

```tsx
/* 카드 배경 우측 하단에 영문 첫 글자를 거대하게 깔기 */
<span
  className="pointer-events-none absolute bottom-[-0.15em] right-[-0.05em] font-serif font-bold select-none"
  style={{
    fontSize: 'clamp(160px, 18vw, 220px)',
    color: item.iconColor,
    opacity: 0.04,   // ← 3~5% 투명도 유지 필수. 더 진하면 촌스러움
  }}
>
  {item.subtitle.charAt(0)}  {/* R, S, D, S */}
</span>
```

### 5.5 3D 책 표지 효과 (핵심 UI 특징)

책의 두께(책등)를 CSS `box-shadow`로 표현하는 독창적 기법:

```tsx
<div style={{
  transform: 'rotate(2deg)',
  transformOrigin: 'bottom left',
  boxShadow: `
    1px 0 0 #f9f9f9, 2px 0 0 #d0d0d0, 3px 0 0 #f5f5f5,
    4px 0 0 #ececec, 5px 0 0 #c8c8c8, 6px 0 0 #f2f2f2,
    7px 0 0 #e8e8e8, 8px 0 0 #c0c0c0, 9px 0 0 #eeeeee,
    10px 0 0 #e5e5e5, 11px 0 0 #bebebe, 12px 0 0 #ebebeb,
    13px 0 0 #e2e2e2, 14px 0 0 #b8b8b8, 15px 0 0 #e8e8e8,
    8px 8px 40px rgba(0,0,0,0.50), 20px 20px 60px rgba(0,0,0,0.30)
  `,
  marginRight: '15px',  // 책등 두께만큼 우측 여백
}}>
```

책 하단 그림자(바닥 접지감):
```tsx
<div style={{
  height: '28px', width: '85%',
  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.60) 0%, transparent 75%)',
  filter: 'blur(8px)',
  transform: 'rotate(2deg)',
}} />
```

### 5.6 에메랄드 다크 테마 (상세 페이지 / 저널)

상세 페이지 배경은 `#040c09` (짙은 흑녹색):

```tsx
<div style={{ background: '#040c09' }}>
  {/* 에메랄드 광원 레이어 1 */}
  <div style={{ background: 'radial-gradient(ellipse 120% 80% at 30% 50%, rgba(16,185,129,0.22) 0%, transparent 65%)' }} />
  {/* 에메랄드 광원 레이어 2 */}
  <div style={{ background: 'radial-gradient(ellipse 60% 100% at 10% 50%, rgba(6,78,59,0.30) 0%, transparent 70%)' }} />
</div>
```

주요 컬러 토큰:
- 강조 텍스트: `#34d399` (emerald-400)
- 버튼 bg: `linear-gradient(135deg, #065f46, #059669)`
- 반투명 카드 bg: `rgba(255,255,255,0.05)`
- 구분선: `rgba(255,255,255,0.08)`

### 5.7 저자/번역자 표기 규칙

```tsx
<p className="text-[10px] break-words leading-snug">
  {/* 저자: 에메랄드 + bold — 주인공 */}
  <span className="font-bold" style={{ color: '#047857' }}>{book.author}</span>
  {/* 번역자: 흐린 회색 — 보조 정보 */}
  {book.translator && (
    <span className="text-zinc-300 font-normal ml-1 text-[9px]">
      | {book.translator} 역
    </span>
  )}
</p>
```

### 5.8 사중복음 섹션 기둥형(Pillar) 카드 레이아웃

```tsx
// 수직 기둥 카드: 아이콘 없음, 워터마크 첫 글자, 넓은 여백
<div style={{ minHeight: '460px', borderTop: `3px solid ${item.iconColor}` }}>
  {/* 우측 상단: 에디토리얼 카드 번호 01~04 */}
  <div className="absolute top-6 right-7 text-[10px] font-black tracking-[0.3em] uppercase">
    0{idx + 1}
  </div>
  {/* 본문: 좌측 상단 정렬, px-10 py-14 여백 */}
  <div className="px-10 py-14">
    <h3 className="font-serif font-bold" style={{ fontSize: 'clamp(40px, 4vw, 52px)' }}>
      {item.title}
    </h3>
    <p className="font-sans text-stone-600">{item.desc}</p>
    {/* 성구: 이탤릭 명조체 */}
    <p className="font-serif italic text-[12px]">{item.scripture}</p>
  </div>
</div>
```

---

## 6. Implemented Features & Next Steps

### 6.1 완료된 기능 목록

#### 출간 도서 (Publications) 시스템
- [x] **카테고리 3탭 필터**: `신학시리즈` / `신앙시리즈` / `영문 저널` — whitelist 기반 엄격한 필터링
- [x] **BookCard 3D 효과**: 15단계 책등 box-shadow + 2도 기울기 + 호버 리프트
- [x] **BookCard 저자/번역자 표기**: `저자명 | 번역자 역` 형식, 에메랄드 저자 + 회색 번역자
- [x] **도서 상세 페이지**: 에메랄드 다크 히어로, 3D 표지 + 바닥 그림자, 메타 그리드, BookTabs(3탭)
- [x] **BookTabs**: 책 소개 / 목차(monospace) / 저자 소개 — 데이터 있는 탭만 표시
- [x] **영문 저널 JournalCard**: 클릭 → PdfModal 인앱 뷰어
- [x] **JournalPdfButton**: 상세 페이지에서 Journal 카테고리 감지 → PDF 뷰어 에메랄드 버튼
- [x] **PdfModal**: `iframe src` 빈 값 방지 로직 (`pdfUrl.startsWith('http')` 검증)
- [x] **출간도서 히어로 통계**: 총 도서 / 신학시리즈 / 신앙시리즈 / 영문저널 — 하드코딩 (动的 추천 제거)

#### 관리자 (Admin) 시스템
- [x] **도서 CRUD**: `app/admin/actions.ts` Server Actions — `getAllBooks`, `createBook`, `updateBook`, `deleteBook`
- [x] **관리자 폼 필드**: title, author, translator, publisher, published_year, series, category, description, **long_description**, **table_of_contents**, **author_bio**, buy_link, price, cover_url, download_url, journal_name, volume_issue, is_featured
- [x] **표지 이미지 업로드**: `book-covers` Supabase Storage → `cover_url` 자동 동기화
- [x] **Journal PDF 업로드**: `journals` Supabase Storage → `download_url` 자동 동기화
- [x] **역할 기반 접근**: `profiles.role = 'admin'` 확인, middleware에서 서비스 롤키로 검증

#### 메인 페이지
- [x] **히어로 섹션**: 에메랄드 그라디언트 배경, 역사적 인물 슬라이드쇼 (7초 자동 전환)
- [x] **사중복음 에디토리얼 섹션**: 필러 카드, 워터마크 알파벳, serif/sans 대비, 4색 테마, 성구
- [x] **GallerySection 컴포넌트화**: `features/main/components/GallerySection.tsx` (유실 방지)
- [x] **ResourceSection 컴포넌트화**: `features/main/components/ResourceSection.tsx` (유실 방지)
- [x] **try-catch 에러 방어**: `fetchLatestPosts`, `fetchActivities` 양쪽 적용

#### 인증 시스템
- [x] 로그인/회원가입/로그아웃
- [x] `@supabase/ssr` 기반 SSR 세션 관리
- [x] `middleware.ts`에서 관리자 라우트 보호

### 6.2 다음 과제 (Priority 1)

#### P1-A: 메인 페이지 전체 톤앤매너 고도화
- 히어로 섹션을 현재 에메랄드 그라디언트에서 **웜 아이보리/스톤 계열**로 전환 또는 고도화
- 홀리 점퍼스(책 섹션)의 다크 슬레이트 배경 → 에디토리얼 테마와 일치하도록 조정
- 전체 페이지의 섹션 간 색상 흐름(Color Flow) 정리

#### P1-B: 상세 페이지 관리자 DB 데이터 입력
- `books_add_detail_fields.sql` 실행 확인
- 관리자 폼에서 14권 각각의 `long_description`, `table_of_contents`, `author_bio` 입력
- 저널 PDF를 `journals` 버킷에 업로드

#### P1-C: 자료실(Archive) UI 고도화
- 현재 단순 리스트 → 카드 그리드 또는 에디토리얼 레이아웃으로 개선

---

## 7. 작업 규칙 & 금기 사항

### 7.1 코딩 규칙
1. **Server/Client 구분 필수**: 이벤트 핸들러가 필요한 모든 컴포넌트는 반드시 `'use client'` 선언
2. **Tailwind CSS v4만 사용**: styled-components, emotion 등 CSS-in-JS 금지
3. **`@supabase/ssr` 전용**: deprecated `auth-helpers` 임포트 금지
4. **try-catch 필수**: 모든 비동기 데이터 페칭에 에러 처리 적용

### 7.2 절대 하지 말아야 할 것
- `app/page.tsx` 수정 시 `GallerySection`, `ResourceSection` 임포트 제거 금지
- `PdfModal`에 빈 `src=""` iframe 렌더링 금지 (반드시 URL 검증 후 렌더링)
- `pdf_url`이라는 컬럼명 사용 금지 (실제 컬럼명은 `download_url`)
- 사중복음 카드에 일반 웹 아이콘(Lucide 등) 재도입 금지 — 워터마크 기법 유지
- 카테고리 필터에서 `'추천'` 또는 whitelist 외 카테고리 집계 금지

### 7.3 macOS 알림 워크플로우 (`.agents/workflows/notify-on-complete.md`)
```bash
# 파일 수정만 한 경우 (Accept All 승인 대기)
osascript -e 'tell app "System Events" to display dialog "GIFT AI: 파일 수정 완료 — 승인해주세요 (Accept All)" buttons {"확인"} default button 1 with title "GIFT AI 승인 대기"'

# 빌드/배포까지 완료한 경우
osascript -e 'tell app "System Events" to display dialog "GIFT AI: 빌드 및 배포가 완료되었습니다." buttons {"확인"} default button 1 with title "GIFT AI 작업 완료"'
```

---

*최종 업데이트: 2026-02-25 | 배포 브랜치: main | 호스팅: Vercel*
