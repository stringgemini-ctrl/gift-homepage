'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import {
    getAllBooks, createBook, updateBook, deleteBook, type Book,
} from '@/app/admin/actions'

// 폼 기본값
const EMPTY_FORM = {
    title: '', author: '', translator: '', publisher: '',
    published_year: '', series: '', description: '', buy_link: '',
    price: '', category: '', download_url: '',
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
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setCoverFile(file)
        setCoverPreview(file ? URL.createObjectURL(file) : null)
    }

    // 수정 버튼 클릭 → 폼에 기존값 채워넣기
    const startEdit = (book: Book) => {
        setEditingId(book.id)
        setForm({
            title: book.title,
            author: book.author,
            translator: book.translator ?? '',
            publisher: book.publisher ?? '',
            published_year: book.published_year?.toString() ?? '',
            series: book.series ?? '',
            description: book.description ?? '',
            buy_link: book.buy_link ?? '',
            price: book.price?.toString() ?? '',
            category: book.category ?? '',
            download_url: book.download_url ?? '',
            is_featured: book.is_featured,
        })
        setCoverPreview(book.cover_url)
        setCoverFile(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setCoverFile(null)
        setCoverPreview(null)
    }

    // 커버 이미지 업로드 → URL 반환
    const uploadCover = async (): Promise<string | null> => {
        if (!coverFile) return null
        const ext = coverFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from('book-covers').upload(fileName, coverFile)
        if (error) throw new Error('커버 이미지 업로드 실패: ' + error.message)
        return supabase.storage.from('book-covers').getPublicUrl(fileName).data.publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title || !form.author) return showToast('제목과 저자는 필수입니다.', 'error')
        setIsSubmitting(true)

        try {
            // 커버 이미지 업로드 시도 (선택 사항)
            let coverUrl: string | null = null
            if (coverFile) {
                coverUrl = await uploadCover()
            } else if (editingId) {
                // 수정 모드이면서 새 파일 없으면 기존 URL 유지
                coverUrl = books.find(b => b.id === editingId)?.cover_url ?? null
            }

            const payload = {
                title: form.title,
                author: form.author,
                translator: form.translator || null,
                publisher: form.publisher || null,
                published_year: form.published_year ? parseInt(form.published_year) : null,
                series: form.series || null,
                description: form.description || null,
                cover_url: coverUrl,
                buy_link: form.buy_link || null,
                price: form.price ? parseInt(form.price) : null,
                category: form.category || null,
                download_url: form.download_url || null,
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
                                <option value="신학시리즈">신학시리즈</option>
                                <option value="신앙시리즈">신앙시리즈</option>
                                <option value="영문저널">영문저널</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">PDF 다운로드 URL (영문저널)</label>
                            <input
                                value={form.download_url} onChange={e => setField('download_url', e.target.value)}
                                placeholder="https://...pdf"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">소개글</label>
                            <textarea
                                value={form.description} onChange={e => setField('description', e.target.value)}
                                placeholder="간단한 도서 소개" rows={4}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] resize-none transition-all"
                            />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input type="checkbox" checked={form.is_featured} onChange={e => setField('is_featured', e.target.checked)} className="w-4 h-4 rounded accent-[#f68d2e]" />
                            <span className="text-[13px] font-semibold text-slate-600">추천 도서로 표시</span>
                        </label>
                    </div>

                    {/* 오른쪽: 커버 이미지 */}
                    <div className="flex flex-col gap-4">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">표지 이미지</label>
                        <label className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 hover:border-[#f68d2e]/60 hover:bg-orange-50/20 transition-all cursor-pointer min-h-[260px] overflow-hidden">
                            {coverPreview ? (
                                <img src={coverPreview} alt="미리보기" className="w-full h-full object-contain max-h-72 rounded-xl" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-300">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="text-sm font-semibold text-slate-400">클릭하여 표지 선택</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <button type="submit" disabled={isSubmitting}
                            className={`w-full py-3.5 rounded-xl text-white font-bold text-[14px] transition-colors disabled:opacity-50 ${editingId ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[#f68d2e] hover:bg-orange-600'
                                }`}>
                            {isSubmitting ? '처리 중...' : editingId ? '수정 완료' : '도서 등록'}
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
