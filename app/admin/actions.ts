'use server'

import { createClient } from '@supabase/supabase-js'

export type Profile = {
    id: string
    email: string | null
    role: string
    created_at: string
}

// Service Role Key를 사용하는 서버 전용 어드민 클라이언트
// 이 함수는 서버에서만 실행되므로 안전합니다.
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceKey) {
        throw new Error('[Server Action] Supabase 환경 변수가 누락되었습니다.')
    }

    return createClient(url, serviceKey, {
        auth: { persistSession: false },
    })
}

/**
 * 전체 회원 목록을 RLS 완전 우회(service_role)로 가져옵니다.
 * 클라이언트 컴포넌트에서 직접 DB를 조회하면 RLS에 의해 400 에러가 발생하므로,
 * 이 서버 액션을 통해 안전하게 데이터를 가져옵니다.
 */
export async function getAllProfiles(): Promise<{ data: Profile[] | null; error: string | null }> {
    try {
        const admin = getAdminClient()
        const { data, error } = await admin
            .from('profiles')
            .select('id, email, role, created_at')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('[Server Action] getAllProfiles error:', error.message)
            return { data: null, error: error.message }
        }

        return { data, error: null }
    } catch (e) {
        const msg = e instanceof Error ? e.message : '알 수 없는 오류'
        return { data: null, error: msg }
    }
}

/**
 * 특정 유저의 역할을 RLS 우회로 업데이트합니다.
 */
export async function updateUserRole(
    userId: string,
    newRole: string
): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId)

        if (error) {
            console.error('[Server Action] updateUserRole error:', error.message)
            return { error: error.message }
        }

        return { error: null }
    } catch (e) {
        const msg = e instanceof Error ? e.message : '알 수 없는 오류'
        return { error: msg }
    }
}
