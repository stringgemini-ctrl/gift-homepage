'use client'

import { useEffect, useState } from 'react'

export default function HeroParticles() {
    const [particles, setParticles] = useState<any[]>([])

    useEffect(() => {
        // Hydration Mismatch 방지를 위해 클라이언트 마운트 시점에 완전 무작위 입자 생성
        const newParticles = Array.from({ length: 11 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 95}%`,
            bottom: `${Math.random() * 70}%`,
            size: Math.random() > 0.6 ? 3 : Math.random() > 0.3 ? 2 : 1.5,
            delay: `-${Math.random() * 20}s`, // 음수 딜레이로 처음부터 화면 곳곳에 애니메이션 진행 상태로 존재하게 함
            duration: `${10 + Math.random() * 8}s`,
            opacity: Math.random() > 0.5 ? 0.2 : 0.1, // 투명도 절반 축소
        }))
        setParticles(newParticles)
    }, [])

    if (particles.length === 0) return null // 마운트 전에는 렌더링 생략 (깜빡임 최소화)

    return (
        <>
            <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)    scale(1);   opacity: 0.3; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-60vh) scale(0.6); opacity: 0; }
        }
        @keyframes floatDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
          15%  { opacity: 1; }
          50%  { transform: translateY(-30vh) translateX(12px) scale(0.9); }
          85%  { opacity: 1; }
          100% { transform: translateY(-60vh) translateX(-8px) scale(0.7); opacity: 0; }
        }
      `}</style>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className={`absolute rounded-full blur-[1px]`} // 블러를 1px로 줄여 선명하고 은은하게 개선
                        style={{
                            left: p.left,
                            bottom: p.bottom,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            background: p.id % 5 === 0
                                ? 'rgba(251,191,36,0.9)' // amber-400
                                : p.id % 3 === 0
                                    ? 'rgba(245,158,11,0.8)' // amber-500
                                    : 'rgba(234,179,8,0.7)', // yellow-500
                            boxShadow: p.id % 5 === 0
                                ? '0 0 4px 1px rgba(251,191,36,0.5)'
                                : 'none',
                            animation: `${p.id % 2 === 0 ? 'floatUp' : 'floatDrift'} ${p.duration} ${p.delay} infinite ease-in-out`,
                            opacity: p.opacity,
                            willChange: 'transform, opacity',
                        }}
                    />
                ))}
            </div>
        </>
    )
}
