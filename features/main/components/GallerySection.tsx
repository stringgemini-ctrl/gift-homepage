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
        <section className="py-32 bg-slate-50 px-8 w-full text-left relative overflow-hidden">
            {/* 상단 섹션과의 연결을 위한 부드러운 그라디언트 */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none z-0"></div>
            {/* 에메랄드 혼합 밝은 글로우 (대폭 확장 동기화) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none scale-150"></div>

            <div className="mx-auto max-w-[1200px] relative z-10">
                <h2 className="text-4xl font-black text-slate-900 mb-16 tracking-tighter drop-shadow-sm">최근 활동 갤러리</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {activities.length > 0 ? (
                        activities.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => item.image_url && onImageClick(item.image_url)}
                                className="group rounded-3xl overflow-hidden bg-white/70 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.15)] hover:-translate-y-2 transition-all duration-500 cursor-pointer"
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
                                <div className="p-6">
                                    <p className="text-base font-bold text-slate-800 line-clamp-2 transition-colors duration-300 group-hover:text-emerald-700">{item.title || '제목 없음'}</p>
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
