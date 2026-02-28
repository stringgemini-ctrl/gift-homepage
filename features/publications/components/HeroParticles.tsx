'use client'

import { useEffect, useState } from 'react'

export default function HeroParticles() {
    const [particles, setParticles] = useState<any[]>([])

    useEffect(() => {
        // Hydration Mismatch 방지를 위해 클라이언트 마운트 시점에 완전 무작위 입자 생성
        const newParticles = Array.from({ length: 25 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 95}%`,
            bottom: `${Math.random() * 70}%`,
            size: Math.random() > 0.6 ? 4 : Math.random() > 0.3 ? 3 : 2,
            delay: `-${Math.random() * 20}s`, // 음수 딜레이로 처음부터 화면 곳곳에 애니메이션 진행 상태로 존재하게 함
            duration: `${8 + Math.random() * 6}s`,
            opacity: Math.random() > 0.5 ? 0.9 : 0.6, // 투명도 대폭 증가로 밝기(조도) 상승
        }))
        setParticles(newParticles)
    }, [])

    if (particles.length === 0) return null // 마운트 전에는 렌더링 생략 (깜빡임 최소화)

    return (
        <>
            <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)    scale(1);   opacity: 0.5; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(-60vh) scale(0.6); opacity: 0; }
        }
        @keyframes floatDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0.5; }
          15%  { opacity: 1; }
          50%  { transform: translateY(-30vh) translateX(15px) scale(1.1); }
          85%  { opacity: 1; }
          100% { transform: translateY(-60vh) translateX(-10px) scale(0.7); opacity: 0; }
        }
      `}</style>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {particles.map(p => (
                    <div
                        key={p.id}
                        className={`absolute rounded-full blur-[1px]`}
                        style={{
                            left: p.left,
                            bottom: p.bottom,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            background: p.id % 5 === 0
                                ? 'rgba(253, 224, 71, 1)' // yellow-300: 매우 밝은 빛
                                : p.id % 3 === 0
                                    ? 'rgba(250, 204, 21, 0.95)' // yellow-400
                                    : 'rgba(245, 158, 11, 0.9)', // amber-500
                            boxShadow: p.id % 2 === 0
                                ? '0 0 10px 2px rgba(253, 224, 71, 0.7)'
                                : '0 0 5px 1px rgba(250, 204, 21, 0.5)',
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
