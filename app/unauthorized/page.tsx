import Link from 'next/link'

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f5f5f7]">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>
                <h1 className="mb-2 text-2xl font-black text-slate-900">접근 권한이 없습니다</h1>
                <p className="mb-8 text-slate-500">
                    해당 페이지(관리자 전용)를 열람할 수 있는 권한이 없습니다.<br />
                    권한이 필요한 경우 관리자에게 문의해 주세요.
                </p>
                <div className="flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="w-full bg-[#0098a6] text-white py-3 font-bold rounded-lg hover:bg-[#007c88] transition-colors"
                    >
                        로그인 페이지로 가기
                    </Link>
                    <Link
                        href="/"
                        className="w-full bg-slate-100 text-slate-600 py-3 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        메인으로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    )
}
