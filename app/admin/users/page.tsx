import MemberManagement from '@/features/admin/components/MemberManagement'

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <MemberManagement />
      </div>
    </div>
  )
}
