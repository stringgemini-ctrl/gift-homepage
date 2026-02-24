'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { getAllBooks, createBook, deleteBook, type Book } from '@/app/admin/actions'

export default function BookManagement() {
    const [books, setBooks] = useState<Book[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // 폼 상태
    const [title, setTitle] = useState('')
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('')
    const [buyLink, setBuyLink] = useState('')
    const [isFeatured, setIsFeatured] = useState(false)
    const [coverFile, setCoverFile] = useState<File | null>(null)
    const [coverPreview, setCoverPreview] = useState<string | null>(null)

    const fetchBooks = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getAllBooks()
        if (error) setFetchError(error)
        else if (data) setBooks(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchBooks() }, [fetchBooks])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null
        setCoverFile(file)
        setCoverPreview(file ? URL.createObjectURL(file) : null)
    }

    const resetForm = () => {
        setTitle(''); setAuthor(''); setDescription(''); setBuyLink('')
        setIsFeatured(false); setCoverFile(null); setCoverPreview(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !author) return alert('제목과 저자는 필수입니다.')
        setIsSubmitting(true)

        let coverUrl: string | null = null

        // 1. 커버 이미지 업로드 (선택)
        if (coverFile) {
            const ext = coverFile.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${ext}`
            const { error: storageErr } = await supabase.storage
                .from('book-covers')
                .upload(fileName, coverFile)

            if (storageErr) {
                alert('커버 이미지 업로드 실패: ' + storageErr.message)
                setIsSubmitting(false)
                return
            }
            const { data: { publicUrl } } = supabase.storage.from('book-covers').getPublicUrl(fileName)
            coverUrl = publicUrl
        }

        // 2. DB에 도서 저장 (서버 액션)
        const { error } = await createBook({
            title, author,
            description: description || null,
            cover_url: coverUrl,
            buy_link: buyLink || null,
            is_featured: isFeatured,
        })

        if (error) {
            alert('도서 등록 실패: ' + error)
        } else {
            alert('도서가 등록되었습니다.')
            resetForm()
            await fetchBooks()
        }
        setIsSubmitting(false)
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`"${title}" 도서를 삭제하시겠습니까?`)) return
        const { error } = await deleteBook(id)
        if (error) alert('삭제 실패: ' + error)
        else setBooks(prev => prev.filter(b => b.id !== id))
    }

    return (
        <div className="space-y-10">
            {/* 헤더 */}
            <div>
                <p className="text-[11px] font-black text-[#f68d2e] uppercase tracking-widest mb-1">Book Management</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">도서 관리</h2>
                <p className="mt-1.5 text-sm text-slate-500">출간 도서를 등록하고 공개 페이지에 노출합니다.</p>
            </div>

            {/* 도서 등록 폼 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8">
                <div className="h-1 w-12 rounded-full bg-[#f68d2e] mb-6" />
                <h3 className="text-[15px] font-black text-slate-800 mb-5">신규 도서 등록</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">제목 *</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="도서 제목"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e]" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">저자 *</label>
                            <input value={author} onChange={e => setAuthor(e.target.value)} required placeholder="저자명"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e]" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">구매 링크</label>
                            <input value={buyLink} onChange={e => setBuyLink(e.target.value)} placeholder="https://..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e]" />
                        </div>
                        <div>
                            <label className="block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">소개글</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="간단한 도서 소개" rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] resize-none" />
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)}
                                className="w-4 h-4 rounded accent-[#f68d2e]" />
                            <span className="text-[13px] font-semibold text-slate-600">추천 도서로 표시</span>
                        </label>
                    </div>

                    {/* 커버 이미지 업로드 */}
                    <div className="flex flex-col gap-4">
                        <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wider">표지 이미지</label>
                        <label className="flex-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 hover:border-[#f68d2e]/60 hover:bg-orange-50/20 transition-all cursor-pointer min-h-[240px]">
                            {coverPreview ? (
                                <img src={coverPreview} alt="미리보기" className="w-full h-full object-contain rounded-xl max-h-64" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <p className="text-sm font-semibold">클릭하여 표지 선택</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                        <button type="submit" disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-[#f68d2e] text-white font-bold text-[14px] hover:bg-orange-600 transition-colors disabled:opacity-50">
                            {isSubmitting ? '등록 중...' : '도서 등록'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 등록된 도서 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-[#f68d2e] to-emerald-400" />
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-slate-700">
                        등록된 도서 <span className="text-[#f68d2e] ml-1">{books.length}</span>권
                    </h3>
                    <button onClick={fetchBooks} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                        ↻ 새로고침
                    </button>
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
                            <div key={book.id} className="flex items-center gap-5 px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="w-10 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                                    {book.cover_url
                                        ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-slate-800 text-[14px] truncate">{book.title}</p>
                                    <p className="text-[12px] text-slate-400 font-medium">{book.author}</p>
                                    {book.is_featured && <span className="text-[10px] font-black text-[#f68d2e]">★ 추천</span>}
                                </div>
                                <button onClick={() => handleDelete(book.id, book.title)}
                                    className="text-[12px] font-bold text-slate-300 hover:text-red-400 transition-colors shrink-0">
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
