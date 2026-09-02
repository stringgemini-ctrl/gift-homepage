import { NextResponse } from 'next/server'
import { getCurrentUserAndRole } from '@/features/auth/lib/server'

export const dynamic = 'force-dynamic'

const AUTH_TIMEOUT_MS = 7_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Authentication request timed out.')), timeoutMs)

    promise.then(
      (value) => {
        clearTimeout(timeout)
        resolve(value)
      },
      (error) => {
        clearTimeout(timeout)
        reject(error)
      }
    )
  })
}

export async function GET() {
  try {
    const { user, role } = await withTimeout(getCurrentUserAndRole(), AUTH_TIMEOUT_MS)

    return NextResponse.json(
      {
        user: user ? { id: user.id, email: user.email } : null,
        role,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch {
    return NextResponse.json(
      { user: null, role: null },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
