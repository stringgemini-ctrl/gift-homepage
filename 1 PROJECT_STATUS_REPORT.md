# my-second-brain 프로젝트 전체 상태 보고서

> 웹 제미나이(ChatGPT) 협업용 프로젝트 컨텍스트 문서  
> 작성일: 2026-02-21

---

## 1. 전체 폴더 구조 (27개 파일)

```
my-second-brain/
├── .gitignore
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── about/page.tsx
│   ├── archive/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── write/page.tsx
│   ├── edit/
│   │   └── [id]/page.tsx
│   ├── admin/page.tsx
│   ├── mypage/page.tsx
│   └── legal/page.tsx
├── components/
│   ├── Header.tsx
│   └── Navbar.tsx
├── lib/
│   └── supabase.ts
└── public/
    ├── vercel.svg
    ├── window.svg
    └── file.svg
```

---

## 2. 핵심 파일 전체 코드

### 2.1 `lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### 2.2 `app/page.tsx` (메인 홈페이지)

```tsx
'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Icons = {
  Regeneration: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Sanctification: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(71,85,105,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M3 12h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  DivineHealing: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(202,138,4,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    </svg>
  ),
  SecondComing: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v6m0 0l-2-2m2 2l2-2" />
    </svg>
  ),
};

const fourfoldGospel = [
  { id: 1, icon: Icons.Regeneration, title: '중생', bg: 'bg-red-50', text: 'text-red-700', desc: '죄인이 예수를 믿어 영적으로 새로운 생명을 얻는 변화 (예 = 요 3:3)' },
  { id: 2, icon: Icons.Sanctification, title: '성결', bg: 'bg-slate-100', text: 'text-slate-700', desc: '그리스도의 보혈로 마음이 정결케 되고 성령의 세례를 받는 은혜 (예 = 살전 5:23)' },
  { id: 3, icon: Icons.DivineHealing, title: '신유', bg: 'bg-yellow-50', text: 'text-yellow-700', desc: '하나님의 능력이 믿음을 통해 병든 몸을 고치시는 육체적 구원 (예 = 약 5:15)' },
  { id: 4, icon: Icons.SecondComing, title: '재림', bg: 'bg-blue-50', text: 'text-blue-700', desc: '부활하신 예수께서 다시 오셔서 세상을 심판하시는 소망의 완성 (예 = 행 1:11)' },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const leftFigures = [
    { name: '이명직 목사', title: '성결교회의 사부', img: '/leemyungjikleft.png' },
    { name: '이성봉 목사', title: '부흥의 사도', img: '/leesungbongleft.png' }
  ];

  const rightFigures = [
    { name: '마틴 냅 목사', title: '성결의 불꽃', img: '/knappright.png' },
    { name: '찰스 카우만 선교사 부부', title: '동양선교회 창립자', img: '/lettiecowmanright.png' }
  ];

  useEffect(() => { 
    setIsLoaded(true); 
    fetchLatestPosts();
    fetchActivities();
    const timer = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % leftFigures.length);
      setRightIndex((prev) => (prev + 1) % rightFigures.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchLatestPosts = async () => {
    const { data } = await supabase.from('archive').select('*').order('created_at', { ascending: false }).limit(8);
    if (data) setPosts(data);
  };

  const fetchActivities = async () => {
    const { data } = await supabase.from('Activity').select('*').order('created_at', { ascending: false }).limit(8);
    if (data) setActivities(data);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pt-20">
      {/* 히어로 섹션, 북 섹션, 사중복음, 활동 갤러리, 자료실, 푸터 등 전체 UI */}
      {/* (전체 JSX 생략 - 위 구조 참고) */}
    </div>
  )
}
```

---

### 2.3 `app/login/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('로그인 실패: ' + error.message)
    else {
      alert('로그인되었습니다.')
      router.push('/archive')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">로그인</h1>
        <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-4 p-3 border rounded-lg" required />
        <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-6 p-3 border rounded-lg" required />
        <button type="submit" className="w-full bg-[#0098a6] text-white py-3 font-bold rounded-lg">로그인</button>
      </form>
    </div>
  )
}
```

---

### 2.4 `app/layout.tsx`

```tsx
import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'GIFT - 글로벌사중복음연구소',
  description: 'Seoul Theological University',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="w-full px-10 h-20 flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="GIFT Logo" className="h-10 w-auto" />
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 leading-none">글로벌사중복음연구소</span>
                  <span className="text-[10px] font-bold text-emerald-600 tracking-tighter uppercase mt-1">Seoul Theological University</span>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-10">
              <Link href="/about">연구소 소개</Link>
              <Link href="/archive">자료실</Link>
              <Link href="/contact">문의 및 요청</Link>
              <Link href="/admin">관리자 아이콘</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

---

### 2.5 `app/archive/page.tsx`

```tsx
'use client'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ArchivePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data } = await supabase.from('archive').select('*').order('created_at', { ascending: false })
    if (data) setPosts(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 py-20 px-6">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">연구소 자료실</h1>
        {posts.map((post) => (
          <Link href={`/archive/${post.id}`} key={post.id}>
            <span>{post.category}</span>
            <h3>{post.title}</h3>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

---

### 2.6 `app/archive/[id]/page.tsx` (상세 페이지)

- `archive` 테이블에서 `id`로 단건 조회
- `title`, `content`, `category`, `subtitle`, `created_at` 사용
- 이전글/다음글 네비게이션 (`created_at` 기준)

---

### 2.7 `app/write/page.tsx`

- 로그인 필수
- `archive` 테이블에 `insert`: `{ title, content, category, user_id, author }`

---

### 2.8 `app/edit/[id]/page.tsx`

- `archive` 테이블 `update`: `{ title, content }` where `id`

---

### 2.9 `app/admin/page.tsx`

- `activity-images` 스토리지에 이미지 업로드
- `Activity` 테이블에 `insert`: `{ title, image_url }`

---

### 2.10 `app/mypage/page.tsx`

- 로그인 필수
- `archive` 테이블에서 `user_id`로 게시글 수 조회
- `comments` 테이블에서 `user_id`로 댓글 수 조회 (테이블 존재 여부 확인 필요)

---

### 2.11 `app/signup/page.tsx`

- `supabase.auth.signUp({ email, password })`로 회원가입

---

### 2.12 `app/about/page.tsx`

- 정적 데이터: 소장 인사말, 사명선언문, 정관, 가족 소개, 연혁
- 탭 UI로 전환

---

### 2.13 `app/legal/page.tsx`

- 개인정보 처리방침, 이용 약관, 법적 고지 탭

---

## 3. DB 연동 상태 (Supabase)

### 3.1 연결 정보

- **환경 변수**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **클라이언트**: `@supabase/supabase-js` v2.97.0

---

### 3.2 테이블 요약

| 테이블명 | 용도 | 주요 컬럼 (코드 기준) |
|----------|------|------------------------|
| **archive** | 연구소 자료실 게시글 | `id`, `title`, `content`, `category`, `subtitle`, `created_at`, `user_id`, `author` |
| **Activity** | 활동 갤러리 (행사 사진) | `id`, `title`, `image_url`, `created_at` |
| **comments** | 댓글 (마이페이지에서 참조) | `user_id` (마이페이지에서 count만 사용) |

---

### 3.3 스토리지 버킷

| 버킷명 | 용도 |
|--------|------|
| **activity-images** | Activity 갤러리 이미지 업로드 |

---

### 3.4 GIFT 관련

- **GIFT**는 테이블명이 아니라 연구소 이름: **Global Institute for the Fourfold-gospel Theology**
- 별도 `GIFT` 테이블은 코드에 없음

---

### 3.5 주의사항

1. **archive**: `user_id`, `author` 컬럼이 write 시 사용됨. DB에 `user_id` 컬럼이 있어야 마이페이지 게시글 수 정상 동작.
2. **comments**: 마이페이지에서 참조하나, 댓글 CRUD 페이지는 없음. 테이블이 없으면 에러 가능.
3. **contact** 페이지: 라우트는 있으나 `/app/contact/page.tsx` 파일 없음 (404 가능).

---

## 4. 기술 스택

- **Next.js** 16.1.6 (App Router)
- **React** 19.2.3
- **Supabase** (Auth + DB + Storage)
- **Tailwind CSS** v4
- **TypeScript** 5.x

---

## 5. 라우트 구조

| 경로 | 설명 |
|------|------|
| `/` | 메인 홈 |
| `/about` | 연구소 소개 |
| `/archive` | 자료실 목록 |
| `/archive/[id]` | 자료 상세 |
| `/write` | 새 자료 등록 (로그인 필요) |
| `/edit/[id]` | 자료 수정 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/admin` | 활동 갤러리 관리자 |
| `/mypage` | 마이페이지 (로그인 필요) |
| `/legal` | 법적 고지 및 약관 |
| `/contact` | 문의 및 요청 (페이지 미구현 가능) |

---

*이 문서는 my-second-brain 프로젝트의 현재 상태를 웹 제미나이와 협업하기 위해 정리한 것입니다.*
