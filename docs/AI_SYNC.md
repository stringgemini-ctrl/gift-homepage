# 🤖 AI_SYNC (Project Knowledge & Living Memory)

이 문서는 새롭게 투입되는 AI 에이전트(Gemini, Claude 등)를 위한 **Single Source of Truth (SSOT)** 입니다. 프로젝트의 핵심 맥락, 아키텍처 규칙, 현재 진행 상태 및 당면 과제를 포함하고 있어 불필요한 재학습을 방지합니다.

## 1. 프로젝트 개요 (Project Overview)
**GIFT Archive Migration 프로젝트**는 기존에 산발적으로 관리되던 PDF 논문 및 자료들을 최신 Next.js 및 Supabase 스택 기반으로 마이그레이션하여 체계적으로 저장, 관리, 서비스하는 웹 아카이브 구축 프로젝트입니다. 

## 2. Core Architecture & Strict Rules
*This section is strictly in English for AI precision.*

- **Framework**: Next.js (Strictly use App Router `/app` directory. Differentiate Server vs Client Components).
- **Frontend**: React (Functional Components & Hooks only).
- **Styling**: Tailwind CSS v4 ONLY. (Strictly NO CSS-in-JS).
- **Database/Auth**: Latest `@supabase/ssr` only. NO deprecated auth-helpers.
- **Strategy**: Prioritize Server Components & SSR for SEO. Avoid Client-side `useEffect` fetching.
- **Coding Standards**:
  - Prioritize "Readable Code" with intuitive naming.
  - Mandatory Comments: Explain "WHY" instead of "WHAT".
  - Modularization: Keep logic separated by feature in `/features` directory.
  - Error Handling: Always implement defensive coding for edge cases.

## 3. 현재 구현 완료된 상태 (Current Progress)
- **DB/Storage**: Supabase에 `archives` 테이블 구조가 확립되어 있습니다. 크롤러 스크립트는 `title`을 기준으로 중복 없는 `upsert` 처리를 수행하며, PDF 파일들 역시 명시적인 `application/pdf` Content-Type을 지정하여 성공적으로 업로드 및 스토리지에 저장되고 있습니다.
- **UI/UX**: 보관함(Archive) 전체 목록 페이지에 한 페이지당 9개의 항목을 노출하는 페이지네이션(Pagination)이 성공적으로 적용되었습니다. 상세 페이지의 경우 기존 렌더링이 불안정하던 Google Docs Viewer 우회 방식을 벗어나, 빠르고 안정적인 브라우저 네이티브 PDF 뷰어를 구현 완료했습니다. 또한 상세 페이지 전반에 걸쳐 글래스모피즘(Glassmorphism) 기반의 라이트 테마를 적용하여 쾌적한 가독성을 제공합니다.

## 4. 당면 과제 (Immediate Next Steps)
- **[Auth] 소셜 로그인(Google/Kakao) UI 및 로직 구현**: ✅ 완료
  - `features/auth/components/OAuthButtons.tsx` — 공유 컴포넌트 신규 생성 (브랜드 컬러 버튼, loading 상태, 에러 방어 처리)
  - `app/auth/callback/route.ts` — OAuth code → 세션 교환 콜백 라우트 신규 생성
  - `app/login/page.tsx`, `app/signup/page.tsx` — 소셜 버튼 삽입 및 구분선 UI 적용
  - **주의**: Supabase Dashboard > Authentication > URL Configuration 에서 `{YOUR_DOMAIN}/auth/callback` 을 Redirect URL로 등록해야 실제 동작함
- **[UI] 상세 페이지 개선 (Detail Page)**: ✅ 완료
  - `font-sans font-extrabold` 타이포그래피 적용 완료 (`app/archive/[id]/page.tsx` line 67)
  - 이모지(✍️, 📅, 📂) 제거 및 수직 바(`|`) 구분자로 대체 완료
- **[DB] 출판일 컬럼 추가**: ✅ 완료
  - Supabase `archives` 테이블에 `published_date` 컬럼 추가 완료
  - 상세 페이지(`app/archive/[id]/page.tsx`)와 목록 페이지(`app/archive/page.tsx`) 모두 `created_at` 대신 `published_date`로 교체 완료
  - 날짜 형식: `YYYY.MM.DD` (목록 카드에도 `저자 | 발행일` 형태로 표시)
