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

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    role: null,
    isLoading: true,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // 1. 초기 세션 및 유저 정보 가져오기
        const initAuth = async () => {
            const { data: { session: initialSession } } = await supabase.auth.getSession()

            setSession(initialSession)
            setUser(initialSession?.user ?? null)
            setRole(initialSession?.user?.user_metadata?.role ?? null)
            setIsLoading(false)
        }

        initAuth()

        // 2. 인증 상태 변화 구독
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
            setSession(currentSession)
            setUser(currentSession?.user ?? null)
            setRole(currentSession?.user?.user_metadata?.role ?? null)
            setIsLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
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
