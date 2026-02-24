import { createBrowserClient } from '@supabase/ssr'

// createBrowserClient는 세션을 localStorage 대신 쿠키에 저장합니다.
// 이 방식이어야 Next.js 미들웨어(서버 측)에서도 동일한 세션을 읽을 수 있습니다.
// createClient(@supabase/supabase-js)를 사용하면 localStorage에만 저장되어
// 서버/미들웨어에서 세션을 읽을 수 없게 됩니다.
export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
