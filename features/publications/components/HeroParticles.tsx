'use client'

type Particle = {
    id: number
    left: string
    bottom: string
    size: number
    delay: string
    duration: string
    opacity: number
}

const particleValue = (seed: number) => {
    const value = Math.sin(seed * 12.9898) * 43758.5453
    return value - Math.floor(value)
}

const rounded = (value: number) => Number(value.toFixed(3))

const particles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${rounded(particleValue(i + 1) * 95)}%`,
    bottom: `${rounded(particleValue(i + 31) * 70)}%`,
    size: particleValue(i + 61) > 0.6 ? 4 : particleValue(i + 91) > 0.3 ? 3 : 2,
    delay: `-${rounded(particleValue(i + 121) * 20)}s`,
    duration: `${rounded(8 + particleValue(i + 151) * 6)}s`,
    opacity: particleValue(i + 181) > 0.5 ? 0.9 : 0.6,
}))

export default function HeroParticles() {
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
