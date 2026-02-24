'use client'

import { useState } from 'react'
import { supabase } from '@/features/database/lib/supabase'
import { useRouter } from 'next/navigation'

export default function GalleryUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null
        setFile(selected)
        if (selected) {
            setPreview(URL.createObjectURL(selected))
        } else {
            setPreview(null)
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !title) return alert('사진과 제목을 모두 입력해주세요!')

        setLoading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`

            const { error: storageError } = await supabase.storage
                .from('activity-images')
                .upload(fileName, file)

            if (storageError) throw storageError

            const { data: { publicUrl } } = supabase.storage
                .from('activity-images')
                .getPublicUrl(fileName)

            const { error: dbError } = await supabase
                .from('Activity')
                .insert([{ title, image_url: publicUrl }])

            if (dbError) throw dbError

            alert('갤러리에 업로드되었습니다!')
            setTitle('')
            setFile(null)
            setPreview(null)
            router.refresh()
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : '알 수 없는 오류'
            alert('오류 발생: ' + msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="mb-6">
                <p className="text-[11px] font-black text-[#f68d2e] uppercase tracking-widest mb-1">Gallery Upload</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter">활동 갤러리 업로드</h2>
                <p className="mt-1.5 text-sm text-slate-500">행사 사진을 업로드하면 메인 활동 갤러리에 표시됩니다.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/40 p-8">
                <div className="h-1 w-12 rounded-full bg-[#f68d2e] mb-8" />
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">행사 제목</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="행사 제목을 입력하세요"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-[15px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#f68d2e]/30 focus:border-[#f68d2e] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-bold text-slate-600 mb-2">사진 업로드</label>
                        <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#f68d2e]/50 hover:bg-orange-50/30 transition-all group">
                            {preview ? (
                                <img src={preview} alt="미리보기" className="h-full w-full object-cover rounded-xl" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-[#f68d2e] transition-colors">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-sm font-semibold">클릭하여 사진 선택</p>
                                    <p className="text-xs">JPG, PNG, WEBP 지원</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-[#f68d2e] text-white text-[15px] font-bold hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? '업로드 중...' : '갤러리에 올리기'}
                    </button>
                </form>
            </div>
        </div>
    )
}
