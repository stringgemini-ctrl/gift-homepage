'use client'

/*
  HeroParticles: 히어로 섹션 배경 부유 입자 애니메이션
  - 순수 CSS (keyframes) 기반, 라이브러리 없음
  - 주황/앰버 계열 점 22개가 각각 다른 속도/위치로 천천히 위로 떠오름
  - opacity 낮게 유지 → 어지럽지 않은 배경 효과
  - 딜레이 없이 페이지 진입 즉시 화면 안에서 보임
*/

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 4.7 + 3) % 95}%`,
    // 시작 위치를 화면 하단 ~ 중간으로 분산하여 처음부터 보이게 함
    bottom: `${(i * 8.3) % 70}%`,
    size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
    delay: `0s`,   // 딜레이 제거 — 진입 즉시 표시
    duration: `${12 + (i * 2.1) % 10}s`,
    opacity: i % 4 === 0 ? 0.45 : 0.25,
}))

export default function HeroParticles() {
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
                {PARTICLES.map(p => (
                    <div
                        key={p.id}
                        className="absolute rounded-full"
                        style={{
                            left: p.left,
                            bottom: p.bottom,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            // 주황/앰버 계열 + 골드 글로우
                            background: p.id % 5 === 0
                                ? 'rgba(251,146,60,0.9)'   // 주황 (orange-400)
                                : p.id % 3 === 0
                                    ? 'rgba(245,158,11,0.8)'   // 앰버 (amber-400)
                                    : 'rgba(253,186,116,0.7)',  // 연주황 (orange-300)
                            boxShadow: p.id % 5 === 0
                                ? '0 0 4px 1px rgba(251,146,60,0.5)'
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
