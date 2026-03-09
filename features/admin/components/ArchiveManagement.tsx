'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import {
    getAllArchives, createArchive, updateArchive, deleteArchive,
    type ArchiveItem, type ArchivePayload,
} from '@/app/admin/actions'

const CATEGORIES = ['사중복음 논문', '활천 기고문', '중생', '성결', '신유', '재림', '사중복음 교단발행물']

const EMPTY_FORM = {
    title: '',
    author: '',
    category: '',
    published_date: '',
    abstract_text: '',
    content: '',
    pdf_url: '',
    original_url: '',
}
type FormState = typeof EMPTY_FORM

export default function ArchiveManagement() {
    const [items, setItems] = useState<ArchiveItem[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState<FormState>(EMPTY_FORM)
    const [isPdfUploading, setIsPdfUploading] = useState(false)
    const [pdfUploadStatus, setPdfUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [search, setSearch] = useState('')

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchItems = useCallback(async () => {
        setLoading(true)
        const { data, error } = await getAllArchives()
        if (error) setFetchError(error)
        else if (data) setItems(data)
        setLoading(false)
    }, [])

    useEffect(() => { fetchItems() }, [fetchItems])

    const setField = (key: keyof FormState, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }))

    // PDF → archives 버킷 업로드
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        if (file.type !== 'application/pdf') {
            showToast('❌ PDF 파일(.pdf)만 업로드 가능합니다.', 'error')
            return
        }
        if (file.size > 50 * 1024 * 1024) {
            showToast('❌ 파일 크기는 50MB 이하여야 합니다.', 'error')
            return
        }
        setPdfUploadStatus('uploading')
        setIsPdfUploading(true)
        try {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`
            const { error: upErr } = await supabase.storage
                .from('archives')
                .upload(fileName, file, { upsert: false, contentType: 'application/pdf' })
            if (upErr) throw upErr
            const { data: urlData } = supabase.storage.from('archives').getPublicUrl(fileName)
            if (!urlData.publicUrl) throw new Error('Public URL 취득 실패')
            setField('pdf_url', urlData.publicUrl)
            setPdfUploadStatus('success')
            showToast('✅ PDF 업로드 성공! URL이 자동 입력되었습니다.')
        } catch (err) {
            setPdfUploadStatus('error')
            showToast('❌ PDF 업로드 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류'), 'error')
        } finally {
            setIsPdfUploading(false)
        }
    }

    const startEdit = (item: ArchiveItem) => {
        setEditingId(item.id)
        setForm({
            title: item.title ?? '',
            author: item.author ?? '',
            category: item.category ?? '',
            published_date: item.published_date?.slice(0, 10) ?? '',
            abstract_text: item.abstract_text ?? '',
            content: item.content ?? '',
            pdf_url: item.pdf_url ?? '',
            original_url: item.original_url ?? '',
        })
        setPdfUploadStatus('idle')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setForm(EMPTY_FORM)
        setPdfUploadStatus('idle')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title) return showToast('제목은 필수입니다.', 'error')
        setIsSubmitting(true)
        try {
            const payload: ArchivePayload = {
                title: form.title,
                author: form.author || null,
                category: form.category || null,
                published_date: form.published_date || null,
                abstract_text: form.abstract_text || null,
                content: form.content || null,
                pdf_url: form.pdf_url || null,
                original_url: form.original_url || null,
            }
            const { error } = editingId
                ? await updateArchive(editingId, payload)
                : await createArchive(payload)
            if (error) throw new Error(error)
            showToast(editingId ? '자료가 수정되었습니다.' : '자료가 등록되었습니다.')
            cancelEdit()
            await fetchItems()
        } catch (err) {
            showToast(err instanceof Error ? err.message : '오류가 발생했습니다.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`"${title}" 자료를 삭제하시겠습니까?`)) return
        const { error } = await deleteArchive(id)
        if (error) showToast('삭제 실패: ' + error, 'error')
        else {
            showToast('삭제되었습니다.')
            setItems(prev => prev.filter(i => i.id !== id))
        }
    }

    const filtered = items.filter(i =>
        !search ||
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.author?.toLowerCase().includes(search.toLowerCase()) ||
        i.category?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-10 relative">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.msg}
                </div>
            )}

            {/* 헤더 */}
            <div>
                <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Archive Management</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">자료실 관리</h2>
                <p className="mt-1.5 text-sm text-slate-500">사중복음 논문 및 교단발행물을 등록·수정·삭제합니다.</p>
            </div>

            {/* 등록 / 수정 폼 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-8">
                <div className={`h-1 w-12 rounded-full mb-6 ${editingId ? 'bg-emerald-500' : 'bg-emerald-700'}`} />
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-black text-slate-800">
                        {editingId ? '✏️ 자료 수정 중' : '신규 자료 등록'}
                    </h3>
                    {editingId && (
                        <button onClick={cancelEdit} className="text-[12px] font-bold text-slate-400 hover:text-slate-700">
                            취소
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 왼쪽: 메타 필드 */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">제목 *</label>
                            <input
                                value={form.title} onChange={e => setField('title', e.target.value)}
                                required placeholder="논문/자료 제목"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">저자</label>
                            <input
                                value={form.author} onChange={e => setField('author', e.target.value)}
                                placeholder="예: 홍길동"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">카테고리</label>
                            <select
                                value={form.category} onChange={e => setField('category', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all bg-white"
                            >
                                <option value="">-- 카테고리 선택 --</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">발행일</label>
                            <input
                                type="date" value={form.published_date} onChange={e => setField('published_date', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">원본 출처 URL</label>
                            <input
                                value={form.original_url} onChange={e => setField('original_url', e.target.value)}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">초록 (Abstract)</label>
                            <textarea
                                value={form.abstract_text} onChange={e => setField('abstract_text', e.target.value)}
                                placeholder="논문 초록 또는 요약문" rows={4}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 resize-y transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">본문 HTML (선택)</label>
                            <textarea
                                value={form.content} onChange={e => setField('content', e.target.value)}
                                placeholder="본문 HTML (비워두면 PDF만 표시)" rows={5}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 resize-y transition-all"
                            />
                        </div>
                    </div>

                    {/* 오른쪽: PDF 업로드 */}
                    <div className="flex flex-col gap-5">
                        <div
                            className="p-5 rounded-xl space-y-4"
                            style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.20)', borderLeft: '4px solid #059669' }}
                        >
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">📄 PDF 파일 업로드</p>
                            <label
                                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer py-10 transition-all ${isPdfUploading ? 'border-amber-300 bg-amber-50/30' : pdfUploadStatus === 'success' ? 'border-emerald-300 bg-emerald-50/20' : 'border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50/10'}`}
                            >
                                {isPdfUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-[11px] font-bold text-amber-600">업로드 중...</p>
                                    </div>
                                ) : pdfUploadStatus === 'success' ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                                        <p className="text-[11px] font-bold text-emerald-700">PDF 업로드 완료</p>
                                        <p className="text-[9px] text-emerald-600 truncate max-w-[200px]">{form.pdf_url}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        <p className="text-[12px] font-semibold">PDF 파일 클릭하여 선택</p>
                                        <p className="text-[10px] text-slate-300">archives 버킷에 즉시 업로드</p>
                                    </div>
                                )}
                                <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" disabled={isPdfUploading} />
                            </label>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">PDF URL (직접 입력 또는 자동 입력)</label>
                                <input
                                    value={form.pdf_url} onChange={e => setField('pdf_url', e.target.value)}
                                    placeholder="https://...pdf"
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all text-slate-500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || isPdfUploading}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-[14px] transition-colors disabled:opacity-50 bg-emerald-700 hover:bg-emerald-800"
                        >
                            {isSubmitting ? '처리 중...' : isPdfUploading ? '업로드 중...' : editingId ? '수정 완료' : '자료 등록'}
                        </button>
                    </div>
                </form>
            </div>

            {/* 자료 목록 */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
                <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-emerald-400" />
                <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between gap-4">
                    <h3 className="text-[14px] font-black text-slate-700 shrink-0">
                        등록된 자료 <span className="text-emerald-600 ml-1">{items.length}</span>건
                    </h3>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="제목·저자·카테고리 검색"
                        className="flex-1 max-w-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 transition-all"
                    />
                    <button onClick={fetchItems} className="text-[12px] font-bold text-slate-400 hover:text-slate-600 shrink-0">↻ 새로고침</button>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-slate-400 text-sm">불러오는 중...</div>
                ) : fetchError ? (
                    <div className="py-20 text-center text-red-400 text-sm">{fetchError}</div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 text-sm">자료가 없습니다.</div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map(item => (
                            <div
                                key={item.id}
                                className={`flex items-start gap-4 px-6 py-4 transition-colors ${editingId === item.id ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                            >
                                {/* 카테고리 뱃지 */}
                                <div className="shrink-0 pt-0.5">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                                        style={{
                                            background: item.category === '사중복음 논문' ? 'rgba(5,150,105,0.12)' : 'rgba(217,119,6,0.10)',
                                            color: item.category === '사중복음 논문' ? '#047857' : '#92400e',
                                        }}
                                    >
                                        {item.category?.slice(0, 4) || '기타'}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 text-[13px] line-clamp-2 leading-snug">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.author && <span className="text-[11px] text-emerald-700 font-semibold">{item.author}</span>}
                                        {item.published_date && (
                                            <span className="text-[11px] text-slate-400">{item.published_date.slice(0, 7)}</span>
                                        )}
                                        {item.pdf_url && (
                                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">PDF</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0 pt-0.5">
                                    <button
                                        onClick={() => startEdit(item)}
                                        className="text-[12px] font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id, item.title ?? '')}
                                        className="text-[12px] font-bold text-slate-300 hover:text-red-400 transition-colors"
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
