import 'server-only'

import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient, type User } from '@supabase/supabase-js'

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '')

  if (!origin || !host) return false

  try {
    return new URL(origin).origin === `${protocol}://${host}`
  } catch {
    return false
  }
}

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) throw new Error('Supabase service 환경 변수가 없습니다.')

  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

export async function createCookieAuthClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Server Components cannot set cookies; Server Actions and Route Handlers can.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // Server Components cannot set cookies; Server Actions and Route Handlers can.
          }
        },
      },
    }
  )
}

export async function getCurrentUserAndRole(): Promise<{ user: User | null; role: string | null }> {
  const authClient = await createCookieAuthClient()
  const { data: { user } } = await authClient.auth.getUser()

  if (!user) return { user: null, role: null }

  const admin = createServiceClient()
  const { data } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    user,
    role: data?.role ?? user.user_metadata?.role ?? null,
  }
}

export async function requireAdmin(): Promise<User> {
  const { user, role } = await getCurrentUserAndRole()
  if (!user || role?.toLowerCase() !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.')
  }
  return user
}
