"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface ArchiveFilterProps {
    categories: string[]
    activeCategory: string
}

export default function ArchiveFilter({ categories, activeCategory }: ArchiveFilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const handleFilter = useCallback(
        (category: string) => {
            const params = new URLSearchParams(searchParams.toString())
            // '전체' 클릭 또는 빈 값이면 category 쿼리 파라미터 자체를 제거
            if (category === "전체" || !category) {
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
                // '전체' 버튼은 activeCategory가 없을 때(쿼리 파라미터 없음) 활성화
                const isActive =
                    cat === "전체" ? !activeCategory : cat === activeCategory

                return (
                    <button
                        key={cat}
                        onClick={() => handleFilter(cat)}
                        className={[
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                            isActive
                                ? "bg-gradient-to-r from-[#065f46] to-[#047857] text-white shadow-[0_4px_16px_rgba(4,120,87,0.3)]"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                        ].join(" ")}
                    >
                        {cat}
                    </button>
                )
            })}
        </div>
    )
}
