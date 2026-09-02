'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
    user: User | null
    session: Session | null
    role: string | null
    isLoading: boolean
}

type AuthStatus = {
    user: { id: string; email: string | null } | null
    role: string | null
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
})

const AUTH_REQUEST_TIMEOUT_MS = 8_000

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(
            () => reject(new Error('Authentication request timed out.')),
            timeoutMs
        )

        promise.then(
            (value) => {
                window.clearTimeout(timeout)
                resolve(value)
            },
            (error) => {
                window.clearTimeout(timeout)
                reject(error)
            }
        )
    })
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // DB에서 최신 profile role을 가져오는 헬퍼 함수
        // RLS나 네트워크 오류가 발생해도 null을 반환해 흐름이 끊기지 않게 처리
        const fetchRole = async (userId: string | undefined): Promise<string | null> => {
            if (!userId) return null
            try {
                const { data } = await withTimeout(
                    supabase.from('profiles').select('role').eq('id', userId).single(),
                    AUTH_REQUEST_TIMEOUT_MS
                )
                return data?.role ?? null
            } catch {
                console.error('[AuthProvider] fetchRole 실패')
                return null
            }
        }

        // 1. 초기 세션 및 유저 정보 가져오기
        // try/finally로 isLoading이 반드시 false가 되도록 보장
        const initAuth = async () => {
            try {
                const response = await withTimeout(
                    fetch('/api/auth/status', { cache: 'no-store' }),
                    AUTH_REQUEST_TIMEOUT_MS
                )
                if (!response.ok) throw new Error(`Authentication status failed: ${response.status}`)

                const data = await response.json() as AuthStatus
                setUser(data.user as User | null)
                setRole(data.role)
            } catch (e) {
                console.error('[AuthProvider] initAuth 실패:', e)
            } finally {
                // 어떤 상황에서도 로딩 상태를 해제
                setIsLoading(false)
            }
        }

        initAuth()

        // 2. 인증 상태 변화 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            try {
                setSession(currentSession)
                setUser(currentSession?.user ?? null)
                const fetchedRole = await fetchRole(currentSession?.user?.id)
                const finalRole = fetchedRole ?? currentSession?.user?.user_metadata?.role ?? null
                setRole(finalRole)
            } catch (e) {
                console.error('[AuthProvider] onAuthStateChange 실패:', e)
            } finally {
                setIsLoading(false)
            }
        })

        return () => { subscription.unsubscribe() }
    }, [])

    return (
        <AuthContext.Provider value={{ user, session, role, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
