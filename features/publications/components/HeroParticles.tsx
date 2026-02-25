'use client'

/*
  HeroParticles: 히어로 섹션 배경 부유 입자 애니메이션
  - 순수 CSS (keyframes) 기반, 라이브러리 없음
  - 미세한 점 20개가 각각 다른 속도/위치로 천천히 위로 떠오름
  - opacity 매우 낮게 유지 → 어지럽지 않은 배경 효과
*/

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    // 각 파티클의 위치·속도·크기를 랜덤하게 분산
    left: `${(i * 4.7 + 3) % 95}%`,
    size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
    delay: `${(i * 1.3) % 9}s`,
    duration: `${12 + (i * 2.1) % 10}s`,
    opacity: i % 4 === 0 ? 0.35 : 0.18,
}))

export default function HeroParticles() {
    return (
        <>
            <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0)    scale(1);   opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(-80vh) scale(0.6); opacity: 0; }
        }
        @keyframes floatDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          15%  { opacity: 1; }
          50%  { transform: translateY(-40vh) translateX(12px) scale(0.9); }
          85%  { opacity: 1; }
          100% { transform: translateY(-80vh) translateX(-8px) scale(0.7); opacity: 0; }
        }
      `}</style>

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {PARTICLES.map(p => (
                    <div
                        key={p.id}
                        className="absolute bottom-0 rounded-full"
                        style={{
                            left: p.left,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            background: p.id % 5 === 0
                                ? 'rgba(52,211,153,0.7)'   // 에메랄드 점
                                : 'rgba(255,255,255,0.5)',   // 흰 점
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
