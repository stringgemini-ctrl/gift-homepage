'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// 서버 컴포넌트에서 환경 변수가 어떻게 보이는지 확인하는 서버 전용 컴포넌트
function ServerSideInfo() {
    // 이 값들은 서버에서 렌더링될 때 채워집니다
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const urlPreview = url
        ? `${url.slice(0, 12)}...${url.slice(-5)}`
        : '❌ UNDEFINED'

    const keyPreview = key
        ? `${key.slice(0, 5)}...${key.slice(-5)}`
        : '❌ UNDEFINED'

    return (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-gray-700 mb-2">📦 서버(Server) 환경 변수 상태</h2>
            <p className="font-mono text-sm">URL: <span className={url ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{urlPreview}</span></p>
            <p className="font-mono text-sm">ANON KEY: <span className={key ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{keyPreview}</span></p>
        </div>
    )
}

// 클라이언트 컴포넌트에서 실시간 Supabase 통신 테스트
function ClientSideTest() {
    const [result, setResult] = useState<string>('대기 중...')
    const [profileResult, setProfileResult] = useState<string>('대기 중...')
    const [envUrl, setEnvUrl] = useState<string>('')
    const [envKey, setEnvKey] = useState<string>('')

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        setEnvUrl(url ? `${url.slice(0, 12)}...${url.slice(-5)}` : '❌ UNDEFINED')
        setEnvKey(key ? `${key.slice(0, 5)}...${key.slice(-5)}` : '❌ UNDEFINED')
    }, [])

    const testSession = async () => {
        setResult('⏳ 세션 조회 중...')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

        if (!url || !key) {
            setResult('❌ 환경 변수가 undefined입니다! Supabase 클라이언트를 생성할 수 없습니다.')
            return
        }

        const client = createClient(url, key)
        const { data, error } = await client.auth.getUser()

        if (error) {
            setResult(`❌ getUser() 에러: ${error.message}`)
        } else if (data.user) {
            setResult(`✅ 유저 확인됨! User ID: ${data.user.id}, Email: ${data.user.email}`)
        } else {
            setResult(`⚠️ 유저 없음 (로그인 필요). URL/KEY 자체는 정상 동작합니다.`)
        }
    }

    const testProfiles = async () => {
        setProfileResult('⏳ profiles 테이블 조회 중...')
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        const client = createClient(url, key)

        const { data: { user } } = await client.auth.getUser()
        if (!user) {
            setProfileResult('⚠️ 로그아웃 상태입니다. 먼저 로그인하고 다시 시도하세요.')
            return
        }

        const userId = user.id
        const { data, error } = await client.from('profiles').select('role').eq('id', userId).single()

        if (error) {
            setProfileResult(`❌ profiles 조회 에러: ${error.message} (code: ${error.code})`)
        } else {
            setProfileResult(`✅ profiles 조회 성공! role: "${data?.role}"`)
        }
    }

    return (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h2 className="font-bold text-gray-700 mb-2">💻 클라이언트(Client) 환경 변수 상태</h2>
            <p className="font-mono text-sm">URL: <span className={envUrl.includes('❌') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{envUrl}</span></p>
            <p className="font-mono text-sm mb-4">ANON KEY: <span className={envKey.includes('❌') ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{envKey}</span></p>

            <div className="flex flex-col gap-3">
                <button
                    onClick={testSession}
                    className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                >
                    🔌 1. Supabase 연결 & 세션 테스트
                </button>
                <p className="font-mono text-sm bg-white p-3 rounded border">{result}</p>

                <button
                    onClick={testProfiles}
                    className="bg-emerald-600 text-white px-4 py-2 rounded font-bold hover:bg-emerald-700"
                >
                    👤 2. profiles 테이블 조회 테스트 (로그인 후 실행)
                </button>
                <p className="font-mono text-sm bg-white p-3 rounded border">{profileResult}</p>
            </div>
        </div>
    )
}

export default function TestConnectionPage() {
    return (
        <div className="min-h-screen bg-[#f5f5f7] pt-28 px-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-black text-slate-900 mb-2">🛠️ 연결 진단 페이지</h1>
                <p className="text-sm text-slate-500 mb-6">이 페이지는 디버깅 후 반드시 삭제하세요.</p>
                <ServerSideInfo />
                <ClientSideTest />
            </div>
        </div>
    )
}
