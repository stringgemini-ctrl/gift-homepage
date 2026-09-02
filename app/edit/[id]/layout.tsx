import { redirect } from 'next/navigation'
import { requireAdmin } from '@/features/auth/lib/server'

export default async function EditLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin()
  } catch {
    redirect('/unauthorized')
  }

  return children
}
