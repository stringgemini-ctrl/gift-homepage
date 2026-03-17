import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import Link from "next/link"

export default async function ArchiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdfcf9" }}>
        <div className="max-w-md w-full mx-4 text-center">
          {/* 아이콘 */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(5,150,105,0.10)" }}
          >
            <svg
              width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1
            className="text-2xl font-black tracking-tight mb-3"
            style={{ color: "#1c1917" }}
          >
            로그인이 필요한 페이지입니다
          </h1>
          <p className="text-sm mb-8" style={{ color: "#78716c" }}>
            자료실은 로그인한 회원만 열람할 수 있습니다.<br />
            로그인 후 이용해 주세요.
          </p>

          <Link
            href="/login?redirectTo=/archive"
            className="inline-flex items-center justify-center px-8 py-3 rounded-xl text-sm font-bold transition-colors"
            style={{ background: "#059669", color: "#ffffff" }}
          >
            로그인하기
          </Link>

          <div className="mt-4">
            <Link
              href="/"
              className="text-sm font-semibold transition-colors"
              style={{ color: "#a8a29e" }}
            >
              메인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
