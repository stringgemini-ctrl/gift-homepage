"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface ArchiveFilterProps {
    // 전체 카테고리 목록을 부모(Server Component)에서 주입받음
    categories: string[]
    // 현재 활성화된 카테고리 (URL 쿼리파람 기반)
    activeCategory: string
}

export default function ArchiveFilter({ categories, activeCategory }: ArchiveFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // 카테고리 클릭 시 URL 쿼리 파라미터를 업데이트 (shallow routing)
    const handleFilter = useCallback(
        (category: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (category === "전체") {
                params.delete("category")
            } else {
                params.set("category", category)
            }
            router.push(`${pathname}?${params.toString()}`)
        },
        [router, pathname, searchParams]
    )

    const allCategories = ["전체", ...categories]

    return (
        <div className="flex flex-wrap gap-2">
            {allCategories.map((cat) => {
                const isActive =
                    cat === "전체" ? !activeCategory : cat === activeCategory

                return (
                    <button
                        key={cat}
                        onClick={() => handleFilter(cat)}
                        className={[
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                            isActive
                                ? "bg-gradient-to-r from-[#065f46] to-[#047857] text-white shadow-[0_4px_16px_rgba(4,120,87,0.4)]"
                                : "bg-[rgba(255,255,255,0.05)] text-slate-300 border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.10)] hover:text-white",
                        ].join(" ")}
                    >
                        {cat}
                    </button>
                )
            })}
        </div>
    )
}
