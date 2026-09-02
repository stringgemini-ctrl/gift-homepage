'use client'

import { useEffect, useState, useCallback } from 'react'
import { uploadAdminFile } from '@/features/admin/lib/upload'
import {
    getAllBooks, createBook, updateBook, deleteBook, type Book,
} from '@/app/admin/actions'

// 폼 기본값
const EMPTY_FORM = {
    title: '', author: '', translator: '', publisher: '',
    published_year: '', series: '', category: '',
    description: '',         // 짧은 소개
    long_description: '',    // 쳅 소개 (긴 글)
    table_of_contents: '',   // 목차
    author_bio: '',          // 저자/역자 소개
    buy_link: '',
    price: '', download_url: '',
    cover_url: '',
    journal_name: '', volume_issue: '',
    is_featured: false,
}

type FormState = typeof EMPTY_FORM

export default function BookManagement() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

    // 수정 모드: null이면 신규 등록, string이면 해당 id 수정 중
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    // 커버 이미지 업로드 상태
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    // PDF 업로드 상태 (저널 전용)
    const [isPdfUploading, setIsPdfUploading] = useState(false)
    const [pdfUploadStatus, setPdfUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    // Book / Journal 모드 토글
    // category에서 저널 여부를 파생 (itemType 별도 상태 불필요)

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchBooks = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getAllBooks()
        if (error) setFetchError(error)
        else if (data) setBooks(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchBooks() }, [fetchBooks])

    const setField = (key: keyof FormState, value: string | boolean) =>
        setForm(prev => ({ ...prev, [key]: value }))

    // 파일 선택 시 즉시 업로드 시작 → URL을 폼 cover_url에 자동 동기화
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            e.target.value = ''
            showToast('JPG, PNG, WebP 이미지만 업로드할 수 있습니다.', 'error')
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            e.target.value = ''
            showToast('이미지 크기는 10MB 이하여야 합니다.', 'error')
            return
        }

        if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
        const localPreview = URL.createObjectURL(file)
        setCoverPreview(localPreview)
        setUploadStatus('uploading')
        setIsUploading(true)
        try {
            const publicUrl = await uploadAdminFile('book-covers', file)
            // 폼 cover_url 상태에 바로 동기화 → 제운시 이 URL을 바로 사용
            setField('cover_url', publicUrl)
            URL.revokeObjectURL(localPreview)
            setCoverPreview(publicUrl)
            setUploadStatus('success')
            showToast('✅ 이미지 업로드 성공!')
        } catch (err) {
            setUploadStatus('error')
            showToast('이미지 업로드 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'), 'error')
        } finally {
            setIsUploading(false)
        }
    }

    // 수정 버튼 클릭 → 폼에 기존값 채워넣기
    const startEdit = (book: Book) => {
        if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
        setEditingId(book.id)
        setForm({
            title: book.title,
            author: book.author,
            translator: book.translator ?? '',
            publisher: book.publisher ?? '',
            published_year: book.published_year?.toString() ?? '',
            series: book.series ?? '',
            category: book.category ?? '',
            description: book.description ?? '',
            long_description: book.long_description ?? '',
            table_of_contents: book.table_of_contents ?? '',
            author_bio: book.author_bio ?? '',
            buy_link: book.buy_link ?? '',
            price: book.price?.toString() ?? '',
            download_url: book.download_url ?? '',
            cover_url: book.cover_url ?? '',
            journal_name: book.journal_name ?? '',
            volume_issue: book.volume_issue ?? '',
            is_featured: book.is_featured,
        })
        setCoverPreview(book.cover_url)
        setUploadStatus('idle')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
        setEditingId(null)
        setForm(EMPTY_FORM)
        setCoverPreview(null)
        setUploadStatus('idle')
        setPdfUploadStatus('idle')
    }

    // 폼 제운 시 이미 업로드된 cover_url 사용 (handleFileChange에서 자동 동기화)
    // 만약 이전 업로드 실패 또는 신규 파일 없으면 기존 URL 유지
    const resolveCoverUrl = (): string | null => {
        if (form.cover_url) return form.cover_url
        if (editingId) return books.find(b => b.id === editingId)?.cover_url ?? null
        return null
    }

    // journals 버킷 PDF 업로드: 파일명 난수화 후 download_url에 자동 동기화
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        // input 초기화 — 같은 파일 재선택 시에도 onChange가 재발화되도록
        e.target.value = ''

        // ── 1. 엄격한 유효성 검증 ──────────────────────────────
        if (!file) return

        // MIME 타입: application/pdf 만 허용 (includes('pdf') 보다 정확)
        if (file.type !== 'application/pdf') {
            showToast('❌ PDF 파일(.pdf)만 업로드 가능합니다.', 'error')
            return
        }

        // 파일 크기 제한: 50MB
        const MAX_SIZE_MB = 50
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            showToast(`❌ 파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`, 'error')
            return
        }

        // ── 2. Supabase Storage 업로드 ─────────────────────────
        setPdfUploadStatus('uploading')
        setIsPdfUploading(true)
        try {
            const publicUrl = await uploadAdminFile('journals', file)
            setField('download_url', publicUrl)
            setPdfUploadStatus('success')
            showToast('✅ PDF 업로드 성공! URL이 자동 입력되었습니다.')
        } catch (err) {
            console.error('[handlePdfUpload] 최종 에러:', err)
            setPdfUploadStatus('error')
            showToast('❌ PDF 업로드 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'), 'error')
        } finally {
            setIsPdfUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.author) return showToast('제목과 저자는 필수입니다.', 'error')
        setIsSubmitting(true)

        try {
            // 파일 선택 시 이미 업로드되었으므로
            // handleFileChange에서 form.cover_url에 자동⁠전파된 URL을 그대로 취함
            const coverUrl = resolveCoverUrl()

            const payload = {
                title: form.title,
                author: form.author,
                translator: form.translator || null,
                publisher: form.publisher || null,
                published_year: form.published_year ? parseInt(form.published_year) : null,
                series: form.series || null,
                category: form.category || null,
                description: form.description || null,
                long_description: form.long_description || null,
                table_of_contents: form.table_of_contents || null,
                author_bio: form.author_bio || null,
                cover_url: coverUrl,
                buy_link: form.buy_link || null,
                price: form.price ? parseInt(form.price) : null,
                download_url: form.download_url || null,
                journal_name: form.category === 'journal' ? (form.journal_name || null) : null,
                volume_issue: form.category === 'journal' ? (form.volume_issue || null) : null,
                is_featured: form.is_featured,
            }

            const { error } = editingId
                ? await updateBook(editingId, payload)
                : await createBook(payload)

            if (error) throw new Error(error)

            showToast(editingId ? '도서가 수정되었습니다.' : '도서가 등록되었습니다.')
            cancelEdit()
            await fetchBooks()
        } catch (err) {
            showToast(err instanceof Error ? err.message : '오류가 발생했습니다.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`"${title}" 도서를 삭제하시겠습니까?`)) return
        const { error } = await deleteBook(id)
        if (error) showToast('삭제 실패: ' + error, 'error')
        else {
            showToast('삭제되었습니다.')
            setBooks(prev => prev.filter(b => b.id !== id))
        }
    }

    return (
        <div className="space-y-10 relative">
            {/* Toast 알림 */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* 헤더 */}
            <div>
                <p className="text-[11px] font-black text-[#f68d2e] uppercase tracking-widest mb-1">Book Management</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">도서 관리</h2>
                <p className="mt-1.5 text-sm text-slate-500">출간 도서를 등록·수정하고 /publications 페이지에 노출합니다.</p>
            </div>

            {/* 등록 / 수정 폼 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8">
                <div className={`h-1 w-12 rounded-full mb-6 ${editingId ? 'bg-emerald-500' : 'bg-[#f68d2e]'}`} />
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-black text-slate-800">
                        {editingId ? '✏️ 도서 수정 중' : '신규 도서 등록'}
                    </h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-[12px] font-bold text-slate-400 hover:text-slate-700">
                            취소
                        </button>
                    )}
                </div>

                {/* 카테고리 선택 라디오 (신앙시리즈 / 신학시리즈 / 영문저널) */}
                <div className="mb-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">카테고리 선택</p>
                    <div
                        className="flex items-center gap-1 p-1 rounded-2xl"
                        style={{ background: 'rgba(0,0,0,0.04)', width: 'fit-content' }}
                    >
                        {([
                            { key: 'faith', emoji: '📗', ko: '신앙시리즈', en: 'Faith' },
                            { key: 'theology', emoji: '📘', ko: '신학시리즈', en: 'Theology' },
                            { key: 'journal', emoji: '📄', ko: '영문저널', en: 'Journal' },
                        ] as const).map(cat => {
                            const active = form.category === cat.key
                            const isJ = cat.key === 'journal'
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => {
                                        // category 직접 설정, itemType은 category에서 파생
                                        setField('category', cat.key)
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all duration-200"
                                    style={{
                                        background: active
                                            ? isJ ? 'linear-gradient(135deg, #065f46, #047857)' : '#f68d2e'
                                            : 'transparent',
                                        color: active ? 'white' : '#9ca3af',
                                        boxShadow: active ? '0 2px 10px rgba(0,0,0,0.14)' : 'none',
                                    }}
                                >
                                    <span>{cat.emoji}</span>
                                    <span className="whitespace-nowrap">{cat.ko}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 왼쪽: 텍스트 필드 */}
                    <div className="space-y-4">
                        {([['title', '제목 *'], ['author', '저자 *'], ['translator', '번역자'], ['publisher', '출판사'], ['series', '시리즈']] as [keyof FormState, string][]).map(([key, label]) => (
                            <div key={key}>
                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
                                <input
                                    value={form[key] as string}
                                    onChange={e => setField(key, e.target.value)}
                                    required={key === 'title' || key === 'author'}
                                    placeholder={label.replace(' *', '')}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">출판 연도</label>
                            <input
                                type="number" min={1900} max={2099}
                                value={form.published_year}
                                onChange={e => setField('published_year', e.target.value)}
                                placeholder="예: 2024"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">구매 링크</label>
                            <input
                                value={form.buy_link} onChange={e => setField('buy_link', e.target.value)} placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">정가 (원)</label>
                            <input
                                type="number" min={0}
                                value={form.price} onChange={e => setField('price', e.target.value)}
                                placeholder="예: 25000"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">카테고리</label>
                            <select
                                value={form.category} onChange={e => setField('category', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all bg-white"
                            >
                                <option value="">-- 카테고리 선택 --</option>
                                <option value="신학시리즈">📘 신학시리즈</option>
                                <option value="신앙시리즈">📗 신앙시리즈</option>
                                <option value="영문저널">📄 영문저널 (English Journal)</option>
                            </select>
                        </div>

                        {/*
                          영문저널 전용 섹션: category가 '영문저널'일 때만 표시
                          journal_name, volume_issue, PDF URL 입력
                        */}
                        {form.category === '영문저널' && (
                            <div
                                className="space-y-4 p-4 rounded-xl"
                                style={{
                                    background: 'rgba(16,185,129,0.04)',
                                    border: '1px solid rgba(16,185,129,0.20)',
                                    borderLeft: '4px solid #10b981',
                                }}
                            >
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                    📄 English Journal 전용 정보
                                </p>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">저널 이름</label>
                                    <input
                                        value={form.journal_name}
                                        onChange={e => setField('journal_name', e.target.value)}
                                        placeholder="예: GIFT Journal of Theology"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">권·호 (Volume / Issue)</label>
                                    <input
                                        value={form.volume_issue}
                                        onChange={e => setField('volume_issue', e.target.value)}
                                        placeholder="예: Vol.3, No.1 (2024)"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">PDF 다운로드 URL</label>
                                    <input
                                        value={form.download_url}
                                        onChange={e => setField('download_url', e.target.value)}
                                        placeholder="https://...pdf"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">소개글 (카드용 짧은 소개)</label>
                            <textarea
                                value={form.description} onChange={e => setField('description', e.target.value)}
                                placeholder="목록 카드에 표시되는 한줄 소개" rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] resize-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-emerald-600 mb-1.5 uppercase tracking-wider">📖 책 소개 (상세 페이지 본문)</label>
                            <textarea
                                value={form.long_description} onChange={e => setField('long_description', e.target.value)}
                                placeholder="상세 페이지에 표시되는 긴 소개글. 줄바꿈 그대로 렌더링됩니다." rows={7}
                                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-y transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-emerald-600 mb-1.5 uppercase tracking-wider">📋 목차 (Table of Contents)</label>
                            <textarea
                                value={form.table_of_contents} onChange={e => setField('table_of_contents', e.target.value)}
                                placeholder={"1장. 제목\n2장. 제목\n..."} rows={6}
                                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-y transition-all font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-emerald-600 mb-1.5 uppercase tracking-wider">✍️ 저자/역자 소개</label>
                            <textarea
                                value={form.author_bio} onChange={e => setField('author_bio', e.target.value)}
                                placeholder="저자 및 역자의 약력과 소개를 입력하세요." rows={5}
                                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 resize-y transition-all"
                            />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input type="checkbox" checked={form.is_featured} onChange={e => setField('is_featured', e.target.checked)} className="w-4 h-4 rounded accent-[#f68d2e]" />
                            <span className="text-[13px] font-semibold text-slate-600">추천 도서로 표시</span>
                        </label>

                    </div>

                    {/* 오른쪽: 표지 이미지 + URL 동기화 */}
                    <div className="flex flex-col gap-4">

                        {/* ── Journal 모드: PDF 업로드 섹션 ── */}
                        {form.category === 'journal' && (
                            <div
                                className="p-4 rounded-xl space-y-3"
                                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderLeft: '4px solid #10b981' }}
                            >
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">📄 PDF 파일 업로드</p>
                                <label
                                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer py-8 relative ${isPdfUploading ? 'border-amber-300 bg-amber-50/30' : pdfUploadStatus === 'success' ? 'border-emerald-300 bg-emerald-50/20' : 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/10'}`}
                                >
                                    {isPdfUploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-[11px] font-bold text-amber-600">업로드 중...</p>
                                        </div>
                                    ) : pdfUploadStatus === 'success' ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                            <p className="text-[11px] font-bold text-emerald-600">PDF 업로드 완료</p>
                                            <p className="text-[9px] text-emerald-500 truncate max-w-[180px]">{form.download_url}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                            <p className="text-[12px] font-semibold">PDF 파일 클릭하여 선택</p>
                                            <p className="text-[10px] text-slate-300">선택 즉시 journals 버킷에 업로드</p>
                                        </div>
                                    )}
                                    <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={isPdfUploading} />
                                </label>

                                {/* PDF URL 직접 입력 */}
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">PDF URL (직접 입력 가능)</label>
                                    <input
                                        value={form.download_url}
                                        onChange={e => setField('download_url', e.target.value)}
                                        placeholder="https://...pdf (업로드 시 자동 입력)"
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all text-slate-500"
                                    />
                                </div>
                            </div>
                        )}

                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">표지 이미지</label>

                        {/* 드래그 영역 */}
                        <label className={`flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[260px] overflow-hidden relative ${isUploading ? 'border-amber-300 bg-amber-50/20' :
                            uploadStatus === 'success' ? 'border-emerald-300 bg-emerald-50/10' :
                                uploadStatus === 'error' ? 'border-red-300 bg-red-50/10' :
                                    'border-slate-200 hover:border-[#f68d2e]/60 hover:bg-orange-50/20'
                            }`}>
                            {coverPreview ? (
                                <img src={coverPreview} alt="미리보기" className="w-full h-full object-contain max-h-72 rounded-xl" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-300">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="text-sm font-semibold text-slate-400">클릭하여 표지 선택</p>
                                    <p className="text-[11px] text-slate-300">선택 즉시 Supabase 업로드</p>
                                </div>
                            )}
                            {/* 업로드 중 오버레이 */}
                            {isUploading && (
                                <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-2">
                                    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-[12px] font-bold text-amber-600">업로드 중...</p>
                                </div>
                            )}
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" disabled={isUploading} />
                        </label>

                        {/* 업로드 상태 메시지 */}
                        {uploadStatus === 'success' && (
                            <p className="text-[11px] font-bold text-emerald-600">✅ 업로드 완료 — URL이 자동 적용되었습니다</p>
                        )}
                        {uploadStatus === 'error' && (
                            <p className="text-[11px] font-bold text-red-500">❌ 업로드 실패 — URL을 직접 입력하세요</p>
                        )}

                        {/* 이미지 URL 직접 입력 */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                                이미지 URL (직접 입력 가능)
                            </label>
                            <input
                                value={form.cover_url}
                                onChange={e => {
                                    setField('cover_url', e.target.value)
                                    if (e.target.value) setCoverPreview(e.target.value)
                                }}
                                placeholder="https://...jpg (파일 선택 시 자동 입력)"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all text-slate-500"
                            />
                        </div>

                        <button type="submit" disabled={isSubmitting || isUploading || isPdfUploading}
                            className={`w-full py-3.5 rounded-xl text-white font-bold text-[14px] transition-colors disabled:opacity-50 ${editingId ? 'bg-emerald-500 hover:bg-emerald-600' : form.category === 'journal' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#f68d2e] hover:bg-orange-600'}`}>
                            {isUploading || isPdfUploading ? '업로드 중...' : isSubmitting ? '처리 중...' : editingId ? '수정 완료' : form.category === 'journal' ? '저널 등록' : '도서 등록'}
                        </button>
                    </div>

                </form>
            </div>

            {/* 도서 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#f68d2e] to-emerald-400" />
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-slate-700">
                        등록된 도서 <span className="text-[#f68d2e] ml-1">{books.length}</span>권
                    </h3>
                    <button onClick={fetchBooks} className="text-[12px] font-bold text-slate-400 hover:text-slate-600">↻ 새로고침</button>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-sm">불러오는 중...</div>
                ) : fetchError ? (
                    <div className="py-20 text-center text-red-400 text-sm">{fetchError}</div>
                ) : books.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-sm">등록된 도서가 없습니다.</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {books.map(book => (
                            <div key={book.id} className={`flex items-center gap-5 px-6 py-4 transition-colors ${editingId === book.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                                <div className="w-10 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                    {book.cover_url
                                        ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-800 text-[14px] truncate">{book.title}</p>
                                    <p className="text-[12px] text-slate-400">{book.author}{book.translator ? ` / 역: ${book.translator}` : ''}</p>
                                    <div className="flex gap-2 mt-0.5">
                                        {book.series && <span className="text-[10px] font-bold text-slate-400">{book.series}</span>}
                                        {book.is_featured && <span className="text-[10px] font-black text-[#f68d2e]">★ 추천</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <button onClick={() => startEdit(book)} className="text-[12px] font-bold text-emerald-500 hover:text-emerald-700 transition-colors">수정</button>
                                    <button onClick={() => handleDelete(book.id, book.title)} className="text-[12px] font-bold text-slate-300 hover:text-red-400 transition-colors">삭제</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
