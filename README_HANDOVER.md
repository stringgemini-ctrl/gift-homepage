# 프로젝트 인수인계 보고서

## 1. 프로젝트 개요
본 프로젝트는 **Next.js 16.1.6 (App Router)**와 **Supabase** 환경을 기반으로 개발 중인 글로벌사중복음연구소(GIFT) 웹사이트 및 자료실 플랫폼입니다.
기존의 파편화된 리소스(`components/`, `lib/` 등)를 도메인 주도 설계(Lite DDD) 개념에 따라 `/features` 디렉토리 아래로 기능별로 응집도 있게 재배치하는 작업을 모두 완료했습니다.

## 2. 새로운 폴더 구조 설명 (Lite DDD)
도메인별 책임을 명확하게 분리하여 유지보수성을 극대화하기 위해 폴더 구조를 재배치했습니다.

```text
my-second-brain/
├── app/                  # Next.js App 라우터 (페이지 및 전역 레이아웃 관리)
├── features/             # 도메인 기반 핵심 기능 (Business Logic & UI)
│   ├── auth/             # 인증 및 권한 관련 도메인
│   │   ├── components/   # 인증 관련 UI (NavAuth 등)
│   │   └── lib/          # 권한 분기 로직 (permissions.ts)
│   ├── core/             # 애플리케이션 전역 핵심 레이아웃 및 공통 컴포넌트
│   │   ├── components/   # 전역 UI 쉘 (Header, Navbar 등)
│   └── database/         # 데이터 스토리지 코어
│       └── lib/          # Supabase 클라이언트 세션 설정 (supabase.ts)
```
이 구조를 통해 인증 기능 수정 시 `features/auth/`만 확인하면 되며, 데이터베이스 설정 변경 시 `features/database/`만 관리할 수 있습니다.

## 3. 기술적 디테일
- **Framework**: Next.js (App Router, Tailwind CSS v4)
- **Database & Auth**: Supabase (@supabase/supabase-js v2.97.0)

### 주요 테이블 구조
| 테이블명 | 용도 및 설명 | 주요 컬럼 |
|----------|------|-----------|
| **archive** | 연구소 자료실의 단건 게시글 데이터 | `id`, `title`, `content`, `category`, `subtitle`, `created_at`, `user_id`, `author` |
| **Activity** | 갤러리/행사 사진 데이터 | `id`, `title`, `image_url`, `created_at` |
| **comments** | 게시물에 대한 사용자 댓글 | `user_id` (마이페이지에서 통계 카운트로 활용 중) |

### API 연동 방식 (Supabase)
이 앱은 Next.js 서버리스 API 라우트를 배제하고 클라이언트 사이드에서 **@supabase/supabase-js** 를 직접 호출하여 `select`, `insert`, `update`를 비동기로 수행합니다. 
(예: `app/archive/page.tsx`, `app/write/page.tsx` 등 참고)

## 4. TODO 리스트 (다음 작업자 과제)
- [ ] **Contact 라우트 404 해결**: `app/layout.tsx` 등에 문의 및 요청 링크(`/contact`)가 제공되나, `/app/contact/page.tsx`가 누락되어 있습니다. 해당 페이지 신규 구현이 필요합니다.
- [ ] **댓글 (comments) CRUD 구현**: 마이페이지에서 댓글 수를 가져오는 구조가 잡혀 있으나 실질적인 댓글 등록 및 조회 화면이 누락되어 있습니다.
- [ ] **Auth 상태 중앙화**: 현재 `Header.tsx`와 `NavAuth.tsx` 등에서 `supabase.auth.onAuthStateChange`를 각각 호출하고 있습니다. 이를 Context API나 Zustand를 활용해 상태 관리 전역 모듈로 통합하면 앱 최적화에 유리합니다.
- [ ] **Admin 페이지 권한 검증**: 현재 관리자와 일반 유저의 권한(`permissions.ts`)이 완벽하게 라우트에 차단 로직(Middleware 등)으로 구현되어 있지 않을 수 있으므로, 권한 탈취 방어 로직 강화가 필요합니다.
자 글