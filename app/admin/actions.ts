'use server'

import { createServiceClient, requireAdmin } from '@/features/auth/lib/server'
import { z } from 'zod'

const uuidSchema = z.string().uuid()
const activityIdSchema = z.coerce.number().int().positive()
const roleSchema = z.enum(['user', 'admin'])
const nullableText = (max: number) => z.string().trim().max(max).nullable()
const nullableUrl = z.string().trim().max(2048).url().refine((value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
}, 'HTTP 또는 HTTPS 주소만 사용할 수 있습니다.').nullable()

const bookPayloadSchema = z.object({
    title: z.string().trim().min(1).max(200),
    author: z.string().trim().min(1).max(200),
    translator: nullableText(200),
    publisher: nullableText(200),
    published_year: z.number().int().min(1000).max(3000).nullable(),
    series: nullableText(200),
    category: nullableText(100),
    description: nullableText(2_000),
    long_description: nullableText(100_000),
    table_of_contents: nullableText(100_000),
    author_bio: nullableText(100_000),
    cover_url: nullableUrl,
    buy_link: nullableUrl,
    download_url: nullableUrl,
    price: z.number().int().nonnegative().nullable(),
    journal_name: nullableText(200),
    volume_issue: nullableText(100),
    is_featured: z.boolean(),
}).strict()

const archivePayloadSchema = z.object({
    title: z.string().trim().min(1).max(300),
    author: nullableText(200),
    category: nullableText(100),
    published_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    abstract_text: nullableText(20_000),
    content: nullableText(1_000_000),
    pdf_url: nullableUrl,
    original_url: nullableUrl,
}).strict()

const activityTitleSchema = z.string().trim().min(1).max(200)
const activityImageUrlSchema = nullableUrl.unwrap()

function validationError(error: z.ZodError) {
    return error.issues[0]?.message || '입력값을 확인해 주세요.'
}

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
async function getVerifiedAdminClient() {
    await requireAdmin()
    return createServiceClient()
}

// ================================================================
// 👤 회원(profiles) 서버 액션
// ================================================================

export async function getAllProfiles(): Promise<{ data: Profile[] | null; error: string | null }> {
    try {
        const admin = await getVerifiedAdminClient()
        const { data, error } = await admin.from('profiles').select('id, email, role')
        if (error) return { data: null, error: error.message }
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function updateUserRole(userId: string, newRole: string): Promise<{ error: string | null }> {
    try {
        const parsedId = uuidSchema.safeParse(userId)
        const parsedRole = roleSchema.safeParse(newRole.toLowerCase())
        if (!parsedId.success || !parsedRole.success) return { error: '회원 또는 권한 값이 올바르지 않습니다.' }

        const currentAdmin = await requireAdmin()
        const admin = createServiceClient()

        if (parsedRole.data === 'user') {
            if (currentAdmin.id === parsedId.data) {
                return { error: '현재 로그인한 관리자 자신의 권한은 해제할 수 없습니다.' }
            }

            const { data: target, error: targetError } = await admin
                .from('profiles')
                .select('role')
                .eq('id', parsedId.data)
                .maybeSingle()
            if (targetError) return { error: targetError.message }

            if (target?.role?.toLowerCase() === 'admin') {
                const { count, error: countError } = await admin
                    .from('profiles')
                    .select('id', { count: 'exact', head: true })
                    .ilike('role', 'admin')
                if (countError) return { error: countError.message }
                if ((count ?? 0) <= 1) return { error: '마지막 관리자 계정의 권한은 해제할 수 없습니다.' }
            }
        }

        const { error } = await admin.from('profiles').update({ role: parsedRole.data }).eq('id', parsedId.data)
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
        const admin = await getVerifiedAdminClient()
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
        const parsed = bookPayloadSchema.safeParse(payload)
        if (!parsed.success) return { error: validationError(parsed.error) }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('books').insert([parsed.data])
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
        const parsedId = uuidSchema.safeParse(id)
        const parsed = bookPayloadSchema.partial().safeParse(payload)
        if (!parsedId.success || !parsed.success || Object.keys(parsed.data).length === 0) {
            return { error: '도서 수정값을 확인해 주세요.' }
        }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('books').update(parsed.data).eq('id', parsedId.data)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function deleteBook(id: string): Promise<{ error: string | null }> {
    try {
        const parsedId = uuidSchema.safeParse(id)
        if (!parsedId.success) return { error: '도서 식별값이 올바르지 않습니다.' }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('books').delete().eq('id', parsedId.data)
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

export async function getArchiveById(id: string): Promise<{ data: ArchiveItem | null; error: string | null }> {
    try {
        const parsedId = uuidSchema.safeParse(id)
        if (!parsedId.success) return { data: null, error: '자료 식별값이 올바르지 않습니다.' }
        const admin = await getVerifiedAdminClient()
        const { data, error } = await admin
            .from('archive')
            .select('id, title, author, category, published_date, abstract_text, content, pdf_url, original_url, created_at')
            .eq('id', parsedId.data)
            .single()
        if (error) return { data: null, error: error.message }
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function getAllArchives(): Promise<{ data: ArchiveItem[] | null; error: string | null }> {
    try {
        const admin = await getVerifiedAdminClient()
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
        const parsed = archivePayloadSchema.safeParse(payload)
        if (!parsed.success) return { error: validationError(parsed.error) }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('archive').insert([parsed.data])
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
        const parsedId = uuidSchema.safeParse(id)
        const parsed = archivePayloadSchema.partial().safeParse(payload)
        if (!parsedId.success || !parsed.success || Object.keys(parsed.data).length === 0) {
            return { error: '자료 수정값을 확인해 주세요.' }
        }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('archive').update(parsed.data).eq('id', parsedId.data)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function deleteArchive(id: string): Promise<{ error: string | null }> {
    try {
        const parsedId = uuidSchema.safeParse(id)
        if (!parsedId.success) return { error: '자료 식별값이 올바르지 않습니다.' }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('archive').delete().eq('id', parsedId.data)
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

// ================================================================
// 🖼️ 활동 갤러리(Activity) 서버 액션
// ================================================================

export type ActivityItem = {
    id: number
    title: string | null
    image_url: string | null
    created_at: string
}

function getActivityImagePath(imageUrl: string | null): string | null {
    if (!imageUrl) return null

    try {
        const url = new URL(imageUrl)
        const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!)
        const prefix = '/storage/v1/object/public/activity-images/'
        if (url.origin !== supabaseUrl.origin || !url.pathname.startsWith(prefix)) return null
        return decodeURIComponent(url.pathname.slice(prefix.length))
    } catch {
        return null
    }
}

export async function getAllActivities(): Promise<{ data: ActivityItem[] | null; error: string | null }> {
    try {
        const admin = await getVerifiedAdminClient()
        const { data, error } = await admin
            .from('Activity')
            .select('id, title, image_url, created_at')
            .order('created_at', { ascending: false })
        if (error) return { data: null, error: error.message }
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function createActivity(title: string, imageUrl: string): Promise<{ error: string | null }> {
    try {
        const parsedTitle = activityTitleSchema.safeParse(title)
        const parsedUrl = activityImageUrlSchema.safeParse(imageUrl)
        if (!parsedTitle.success || !parsedUrl.success) return { error: '갤러리 제목 또는 이미지 주소를 확인해 주세요.' }
        const admin = await getVerifiedAdminClient()
        const { error } = await admin.from('Activity').insert([{ title: parsedTitle.data, image_url: parsedUrl.data }])
        if (error) return { error: error.message }
        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function updateActivity(
    id: number,
    payload: { title: string; imageUrl?: string }
): Promise<{ error: string | null }> {
    try {
        const parsedId = activityIdSchema.safeParse(id)
        const parsedTitle = activityTitleSchema.safeParse(payload.title)
        const parsedUrl = payload.imageUrl === undefined
            ? { success: true as const, data: undefined }
            : activityImageUrlSchema.safeParse(payload.imageUrl)
        if (!parsedId.success || !parsedTitle.success || !parsedUrl.success) {
            return { error: '갤러리 수정값을 확인해 주세요.' }
        }
        const admin = await getVerifiedAdminClient()
        const { data: current, error: findError } = await admin
            .from('Activity')
            .select('image_url')
            .eq('id', parsedId.data)
            .single()
        if (findError || !current) return { error: '갤러리 항목을 찾을 수 없습니다.' }

        const updates: { title: string; image_url?: string } = { title: parsedTitle.data }
        if (parsedUrl.data) updates.image_url = parsedUrl.data

        const { error } = await admin.from('Activity').update(updates).eq('id', parsedId.data)
        if (error) return { error: error.message }

        const oldImagePath = payload.imageUrl ? getActivityImagePath(current.image_url) : null
        if (oldImagePath) await admin.storage.from('activity-images').remove([oldImagePath])

        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}

export async function deleteActivity(id: number): Promise<{ error: string | null }> {
    try {
        const parsedId = activityIdSchema.safeParse(id)
        if (!parsedId.success) return { error: '갤러리 식별값이 올바르지 않습니다.' }
        const admin = await getVerifiedAdminClient()
        const { data: current, error: findError } = await admin
            .from('Activity')
            .select('image_url')
            .eq('id', parsedId.data)
            .single()
        if (findError || !current) return { error: '갤러리 항목을 찾을 수 없습니다.' }

        const { error } = await admin.from('Activity').delete().eq('id', parsedId.data)
        if (error) return { error: error.message }

        const imagePath = getActivityImagePath(current.image_url)
        if (imagePath) await admin.storage.from('activity-images').remove([imagePath])

        return { error: null }
    } catch (e) {
        return { error: e instanceof Error ? e.message : '알 수 없는 오류' }
    }
}
