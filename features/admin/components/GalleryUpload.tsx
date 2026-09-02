'use client'

import { useCallback, useEffect, useState } from 'react'
import {
    createActivity,
    deleteActivity,
    getAllActivities,
    updateActivity,
    type ActivityItem,
} from '@/app/admin/actions'
import { uploadAdminFile } from '@/features/admin/lib/upload'

export default function GalleryUpload() {
    const [items, setItems] = useState<ActivityItem[]>([])
    const [title, setTitle] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [listLoading, setListLoading] = useState(true)
    const [message, setMessage] = useState<string | null>(null)

    const loadItems = useCallback(async () => {
        setListLoading(true)
        const { data, error } = await getAllActivities()
        if (error) setMessage(error)
        else setItems(data ?? [])
        setListLoading(false)
    }, [])

    useEffect(() => { void loadItems() }, [loadItems])

    const clearForm = () => {
        if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
        setTitle('')
        setFile(null)
        setPreview(null)
        setEditingId(null)
    }

    const showMessage = (text: string) => {
        setMessage(text)
        window.setTimeout(() => setMessage(null), 3500)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null
        if (!selected) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(selected.type)) {
            event.target.value = ''
            return showMessage('JPG, PNG, WebP 이미지만 업로드할 수 있습니다.')
        }
        if (selected.size > 10 * 1024 * 1024) {
            event.target.value = ''
            return showMessage('이미지 크기는 10MB 이하여야 합니다.')
        }

        if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
        setFile(selected)
        setPreview(URL.createObjectURL(selected))
    }

    const uploadImage = async (selected: File): Promise<string> => {
        return uploadAdminFile('activity-images', selected)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!title.trim()) return showMessage('행사 제목을 입력해 주세요.')
        if (!editingId && !file) return showMessage('새 갤러리 항목에는 사진이 필요합니다.')

        setLoading(true)
        try {
            const imageUrl = file ? await uploadImage(file) : undefined
            const result = editingId
                ? await updateActivity(editingId, { title: title.trim(), imageUrl })
                : await createActivity(title.trim(), imageUrl!)
            if (result.error) throw new Error(result.error)

            const wasEditing = Boolean(editingId)
            clearForm()
            await loadItems()
            showMessage(wasEditing ? '갤러리 항목이 수정되었습니다.' : '갤러리에 등록되었습니다.')
        } catch (error) {
            showMessage(error instanceof Error ? error.message : '갤러리 저장에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const startEdit = (item: ActivityItem) => {
        if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
        setEditingId(item.id)
        setTitle(item.title ?? '')
        setFile(null)
        setPreview(item.image_url)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDelete = async (item: ActivityItem) => {
        if (!confirm(`"${item.title || '제목 없음'}" 갤러리 항목을 삭제하시겠습니까?`)) return

        setLoading(true)
        const { error } = await deleteActivity(item.id)
        setLoading(false)
        if (error) return showMessage(error)

        if (editingId === item.id) clearForm()
        setItems((current) => current.filter((entry) => entry.id !== item.id))
        showMessage('갤러리 항목이 삭제되었습니다.')
    }

    return (
        <div className="space-y-8">
            {message && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl">
                    {message}
                </div>
            )}

            <div>
                <p className="text-[11px] font-black text-[#f68d2e] uppercase tracking-widest mb-1">Gallery Management</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">활동 갤러리 관리</h2>
                <p className="mt-1.5 text-sm text-slate-500">사진과 제목을 등록, 수정, 삭제합니다.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/40">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[15px] font-black text-slate-800">{editingId ? '갤러리 항목 수정' : '새 갤러리 항목'}</h3>
                    {editingId && (
                        <button type="button" onClick={clearForm} className="text-[13px] font-bold text-slate-500 hover:text-slate-800">
                            수정 취소
                        </button>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-[13px] font-bold text-slate-600">행사 제목</label>
                    <input
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="행사 제목을 입력하세요"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] text-slate-900 outline-none transition-all focus:border-[#f68d2e] focus:ring-2 focus:ring-[#f68d2e]/30"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-[13px] font-bold text-slate-600">{editingId ? '사진 교체 (선택)' : '사진 업로드'}</label>
                    <label className="flex h-44 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 transition-all hover:border-[#f68d2e]/50 hover:bg-orange-50/30">
                        {preview ? (
                            <img src={preview} alt="갤러리 미리보기" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-sm font-semibold text-slate-400">사진을 선택하세요</span>
                        )}
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#f68d2e] py-3.5 text-[15px] font-bold text-white transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? '저장 중...' : editingId ? '수정 저장' : '갤러리에 등록'}
                </button>
            </form>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[15px] font-black text-slate-800">등록된 갤러리</h3>
                    <span className="text-[12px] font-bold text-slate-400">{items.length}건</span>
                </div>
                {listLoading ? (
                    <div className="py-12 text-center text-sm font-medium text-slate-400">갤러리를 불러오는 중입니다.</div>
                ) : items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm font-medium text-slate-400">등록된 사진이 없습니다.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                                <div className="aspect-[4/3] bg-slate-100">
                                    {item.image_url ? <img src={item.image_url} alt={item.title || '갤러리 사진'} className="h-full w-full object-cover" /> : null}
                                </div>
                                <div className="p-4">
                                    <p className="truncate text-sm font-bold text-slate-800">{item.title || '제목 없음'}</p>
                                    <div className="mt-4 flex gap-2">
                                        <button type="button" onClick={() => startEdit(item)} disabled={loading} className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">수정</button>
                                        <button type="button" onClick={() => handleDelete(item)} disabled={loading} className="flex-1 rounded-lg border border-red-200 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">삭제</button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
