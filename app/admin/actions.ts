'use server'

import { createClient } from '@supabase/supabase-js'

// ─── 공통 타입 ───────────────────────────────────────────────────
export type Profile = {
    id: string
    email: string | null
    role: string
}

export type Book = {
    id: string
    title: string
    author: string
    translator: string | null
    publisher: string | null
    published_year: number | null
    series: string | null
    category: string | null
    description: string | null
    long_description: string | null  // 책 소개 (긴 글)
    table_of_contents: string | null // 목차
    author_bio: string | null        // 저자/역자 소개
    cover_url: string | null
    buy_link: string | null
    download_url: string | null
    price: number | null
    journal_name: string | null    // 저널 이름 (ex: "GIFT Journal")
    volume_issue: string | null    // 권호 (ex: "Vol.3, No.1")
    is_featured: boolean
    created_at: string
}

// ─── Admin 클라이언트 (RLS 완전 우회) ────────────────────────────
function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) throw new Error('[Server Action] Supabase 환경 변수 누락')
    return createClient(url, serviceKey, { auth: { persistSession: false } })
}

// ================================================================
// 👤 회원(profiles) 서버 액션
// ================================================================

export async function getAllProfiles(): Promise<{ data: Profile[] | null; error: string | null }> {
    try {
        const admin = getAdminClient()
        const { data, error } = await admin.from('profiles').select('id, email, role')
        if (error) return { data: null, error: error.message }
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function updateUserRole(userId: string, newRole: string): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('profiles').update({ role: newRole }).eq('id', userId)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

// ================================================================
// 📚 도서(books) 서버 액션
// ================================================================

export async function getAllBooks(): Promise<{ data: Book[] | null; error: string | null }> {
    try {
        const admin = getAdminClient()
        const { data, error } = await admin
            .from('books').select('*').order('created_at', { ascending: false })
        if (error) return { data: null, error: error.message }
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function createBook(
    payload: Omit<Book, 'id' | 'created_at'>
): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('books').insert([payload])
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function updateBook(
    id: string,
    payload: Partial<Omit<Book, 'id' | 'created_at'>>
): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('books').update(payload).eq('id', id)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function deleteBook(id: string): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('books').delete().eq('id', id)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

// ================================================================
// 📄 자료실(archive) 서버 액션
// ================================================================

export type ArchiveItem = {
    id: string
    title: string
    author: string | null
    category: string | null
    published_date: string | null
    abstract_text: string | null
    content: string | null
    pdf_url: string | null
    original_url: string | null
    created_at: string
}

export type ArchivePayload = Omit<ArchiveItem, 'id' | 'created_at'>

export async function getAllArchives(): Promise<{ data: ArchiveItem[] | null; error: string | null }> {
    try {
        const admin = getAdminClient()
        const { data, error } = await admin
            .from('archive')
            .select('id, title, author, category, published_date, abstract_text, content, pdf_url, original_url, created_at')
            .order('published_date', { ascending: false, nullsFirst: false })
        if (error) return { data: null, error: error.message }
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function createArchive(payload: ArchivePayload): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('archive').insert([payload])
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function updateArchive(
    id: string,
    payload: Partial<ArchivePayload>
): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('archive').update(payload).eq('id', id)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function deleteArchive(id: string): Promise<{ error: string | null }> {
    try {
        const admin = getAdminClient()
        const { error } = await admin.from('archive').delete().eq('id', id)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}
