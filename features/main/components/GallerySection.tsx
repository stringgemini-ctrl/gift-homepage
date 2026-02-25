'use client'

type Activity = {
    id: string
    title: string | null
    image_url: string | null
    created_at: string
}

interface Props {
    activities: Activity[]
    onImageClick: (url: string) => void
}

export default function GallerySection({ activities, onImageClick }: Props) {
    return (
        <section className="py-32 bg-white px-8 border-t border-slate-100 w-full text-left">
            <div className="mx-auto max-w-[1200px]">
                <h2 className="text-4xl font-black text-slate-900 mb-16 tracking-tighter">최근 활동 갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {activities.length > 0 ? (
                        activities.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => item.image_url && onImageClick(item.image_url)}
                                className="group rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.title || '활동 이미지'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <p className="text-base font-bold text-slate-800 line-clamp-2">{item.title || '제목 없음'}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center text-slate-400 font-medium">등록된 활동이 없습니다.</div>
                    )}
                </div>
            </div>
        </section>
    )
}
