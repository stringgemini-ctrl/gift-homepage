'use client'

import { supabase } from '@/features/database/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import GallerySection from '@/features/main/components/GallerySection'
import ResourceSection from '@/features/main/components/ResourceSection'
import HeroParticles from '@/features/publications/components/HeroParticles'

const Icons = {
  Regeneration: ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-9 h-9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Sanctification: ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-9 h-9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M3 12h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  DivineHealing: ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-9 h-9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
    </svg>
  ),
  SecondComing: ({ color }: { color: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-9 h-9">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v6m0 0l-2-2m2 2l2-2" />
    </svg>
  ),
};

// 사중복음 4색 테마 (스펙 5.8 기준 + 요청사항 반영: Crimson, Pure White, Sage Green, Slate Blue)
const fourfoldGospel = [
  {
    id: 1, Icon: Icons.Regeneration,
    title: '중생', subtitle: 'Regeneration',
    iconColor: '#be123c', // Crimson Red (Tone down)
    borderColor: 'rgba(159,18,57,0.3)',
    glowColor: 'rgba(159,18,57,0.25)', // 밝은 배경에 맞춘 강한 글로우
    desc: '천국 시민의 자격을 갖추는 기독교의 입문입니다. 십자가에 달려 속죄의 피를 흘리신 예수 그리스도를 믿을 때, 성령의 역사로 새 생명을 얻어 심령과 인격 전체에 근본적인 변혁이 일어나는 영적 신비입니다.',
    scripture: '요한복음 3:3',
  },
  {
    id: 2, Icon: Icons.Sanctification,
    title: '성결', subtitle: 'Sanctification',
    iconColor: '#ffffff', // Pure White (밝은 배경에서 튀도록 그림자 적용 필수)
    borderColor: 'rgba(148,163,184,0.3)', // slate-400 border
    glowColor: 'rgba(255,255,255,0.8)', // pure white glow
    desc: '구원받은 신자가 마땅히 사모해야 할 성령 세례의 은혜입니다. 오순절 다락방에 임했던 성령의 역사처럼, 죄의 본성을 정결케 하고 하나님을 향한 온전한 사랑과 거룩한 삶의 능력을 덧입는 과정입니다.',
    scripture: '히브리서 12:14',
  },
  {
    id: 3, Icon: Icons.DivineHealing,
    title: '신유', subtitle: 'Divine Healing',
    iconColor: '#0d9488', // Sage Green (Tone down)
    borderColor: 'rgba(15,118,110,0.3)',
    glowColor: 'rgba(15,118,110,0.25)',
    desc: '하나님의 보호하심 아래 육신의 강건함을 누리며, 병들었을 때 기도함으로 나음을 얻는 은사입니다. 이는 단순한 기적을 넘어, 깨어진 육신을 안전케 하시는 주님의 전인적인 구원과 사랑의 표적입니다.',
    scripture: '마가복음 16:17–18',
  },
  {
    id: 4, Icon: Icons.SecondComing,
    title: '재림', subtitle: 'Second Coming',
    iconColor: '#1d4ed8', // Slate Blue (Tone down)
    borderColor: 'rgba(30,64,175,0.3)',
    glowColor: 'rgba(30,64,175,0.25)',
    desc: '신약성경 예언의 중심이자 우리 신앙의 궁극적인 소망입니다. \'내가 속히 오리라\' 하신 약속을 믿으며, 주님의 공중 재림과 지상 재림을 대망하여 오늘을 깨어 있는 신앙으로 살아가게 하는 원동력입니다.',
    scripture: '요한계시록 22:20',
  },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const leftFigures = [
    { name: '이명직 목사', title: '성결교회의 사부', img: '/leemyungjikleft.png' },
    { name: '이성봉 목사', title: '부흥의 사도', img: '/leesungbongleft.png' }
  ];

  const rightFigures = [
    { name: '마틴 냅 목사', title: '성결의 불꽃', img: '/knappright.png' },
    { name: '찰스 카우만 선교사 부부', title: '동양선교회 창립자', img: '/lettiecowmanright.png' }
  ];

  useEffect(() => {
    setIsLoaded(true);
    fetchLatestPosts();
    fetchActivities();
    const timer = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % leftFigures.length);
      setRightIndex((prev) => (prev + 1) % rightFigures.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('archive').select('*').order('created_at', { ascending: false }).limit(8)
      if (error) { console.error('[fetchLatestPosts] Supabase error:', error.message); return }
      if (data) setPosts(data)
    } catch (e) {
      console.error('[fetchLatestPosts] 예기치 못한 에러:', e)
    }
  };

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('Activity')
        .select('id, title, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(8)
      if (error) { console.error('[fetchActivities] Supabase error:', error.message); return }
      if (data) setActivities(data)
    } catch (e) {
      console.error('[fetchActivities] 예기치 못한 에러:', e)
    }
  };


  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden pt-20">
      <style jsx global>{`
        @keyframes radiant-glow { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes figure-majestic-enter-left {
          0% { opacity: 0; transform: translateX(-30px) scale(0.98); filter: blur(15px); }
          10% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
          90% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateX(10px) scale(1.02); filter: blur(10px); }
        }
        @keyframes figure-majestic-enter-right {
          0% { opacity: 0; transform: translateX(30px) scale(0.98); filter: blur(15px); }
          10% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
          90% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateX(-10px) scale(1.02); filter: blur(10px); }
        }
        .animate-figure-majestic-left { animation: figure-majestic-enter-left 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-figure-majestic-right { animation: figure-majestic-enter-right 7s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        @keyframes book-float-rotate { 
          0% { transform: rotateY(-12deg) rotateX(5deg) translate3d(0, 0, 0) scale(1.1); } 
          50% { transform: rotateY(12deg) rotateX(-5deg) translate3d(0, -30px, 0) scale(1.1); } 
          100% { transform: rotateY(-12deg) rotateX(5deg) translate3d(0, 0, 0) scale(1.1); } 
        }
        .animate-book-float { animation: book-float-rotate 6.5s ease-in-out infinite; transform-style: preserve-3d; will-change: transform; }
        @keyframes shadow-pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(0.7); opacity: 0.1; } }
        .animate-shadow-pulse { animation: shadow-pulse 3.5s ease-in-out infinite; }
        .text-glory { background: linear-gradient(135deg, #b491ff 0%, #fbbf24 50%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
      `}</style>

      {/* 1. 히어로 섹션 — 홀리 라이트 베이스 (stone-50) + 출간소개 동기화 에메랄드 오로라 */}
      <section className="relative z-30 flex h-[85vh] items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-800/40 via-stone-50 to-stone-100 overflow-hidden text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-b border-emerald-100/30">
        {/* 복합 에메랄드 오로라 렌더링 (방사형 다중 그라디언트 + 블러) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.3)_0%,transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.2)_0%,transparent_60%)] blur-3xl pointer-events-none -z-10" style={{ animation: 'radiant-glow 15s infinite alternate' }} />
        {/* 주황/앰버 파티클 */}
        <HeroParticles />

        {/* 좌측 인물 */}
        <div className="hidden lg:block absolute left-15 xl:left-30 top-1/2 -translate-y-1/2 z-10 w-[22%] max-w-[280px]">
          <div key={`left-${leftIndex}`} className="animate-figure-majestic-left text-center">
            <img src={leftFigures[leftIndex].img} className="w-full h-auto object-contain drop-shadow-xl" alt="" />
            <p className="mt-5 text-lg font-black text-emerald-900 tracking-tighter drop-shadow-sm">{leftFigures[leftIndex].title}<br /><span className="text-xl text-emerald-900">{leftFigures[leftIndex].name}</span></p>
          </div>
        </div>

        {/* 중앙 텍스트 */}
        <div className={`relative z-20 px-5 max-w-[700px] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.4em] text-emerald-900 bg-emerald-100/80 border border-emerald-400/40 backdrop-blur-md rounded-full animate-fadeInUp shadow-[0_0_15px_rgba(16,185,129,0.2)]">THE GOOD NEWS</span>
          <h1 className="text-6xl font-black tracking-tighter text-stone-900 md:text-8xl leading-[1.1] animate-fadeInUp drop-shadow-[0_2px_10px_rgba(0,0,0,0.05)]">성결의 빛, <br /><span className="text-glory drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">온 누리에</span></h1>
          <p className="mt-8 text-sm md:text-lg font-bold text-stone-600 tracking-wide animate-fadeInUp uppercase leading-relaxed drop-shadow-sm">
            <span className="text-emerald-700 text-xl md:text-2xl drop-shadow-sm">G</span>lobal <span className="text-emerald-700 text-xl md:text-2xl drop-shadow-sm">I</span>nstitute for the <br className="hidden md:block" />
            <span className="text-emerald-700 text-xl md:text-2xl drop-shadow-sm">F</span>ourfold-gospel <span className="text-emerald-700 text-xl md:text-2xl drop-shadow-sm">T</span>heology
          </p>
          <div className="mt-12 animate-fadeInUp">
            <Link href="/archive" className="inline-block rounded-full bg-[#10b981] px-14 py-6 text-xl font-black text-white hover:scale-105 shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition-all border border-emerald-400/50">연구소 자료실 바로가기</Link>
          </div>
        </div>

        {/* 우측 인물 */}
        <div className="hidden lg:block absolute right-15 xl:right-30 top-1/2 -translate-y-1/2 z-10 w-[22%] max-w-[280px]">
          <div key={`right-${rightIndex}`} className="animate-figure-majestic-right text-center">
            <img src={rightFigures[rightIndex].img} className="w-full h-auto object-contain drop-shadow-xl" alt="" />
            <p className="mt-5 text-lg font-black text-emerald-900 tracking-tighter drop-shadow-sm">{rightFigures[rightIndex].title}<br /><span className="text-xl text-emerald-900">{rightFigures[rightIndex].name}</span></p>
          </div>
        </div>
      </section>

      {/* 2. 북 섹션 — 홀리 라이트 기반 아늑한 서재 (stone-100) + 부드러운 그라데이션 브릿지 */}
      <section className="relative z-20 bg-stone-100 pt-56 pb-32 px-8 overflow-hidden">
        {/* 히어로 섹션에서 북 섹션으로 이어지는 밝은 그라데이션 브릿지 */}
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-stone-100 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none"></div>
        <div className="mx-auto max-w-[1300px] relative z-10 bg-emerald-950/70 backdrop-blur-xl border-2 border-white/40 rounded-3xl p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all">
          {/* 3D NEW Badge */}
          <div className="absolute -top-6 -left-6 z-30">
            <div className="bg-emerald-500 text-white font-black px-6 py-2.5 rounded-xl border-2 border-white/50 shadow-[0_10px_30px_rgba(16,185,129,0.4)] backdrop-blur-md transform -rotate-3 hover:rotate-0 transition-transform cursor-default flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="tracking-tighter text-lg italic">NEW!</span>
            </div>
            <div className="absolute inset-0 bg-emerald-900/30 blur-xl -z-10 rounded-xl"></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="relative w-full lg:w-1/2 flex justify-center perspective-[2000px]">
              <div className="relative w-full max-w-[380px] flex justify-center items-center flex-col">
                <img src="/holyjumpers3d.png" alt="Holy Jumpers 3D" className="w-full h-auto object-contain animate-book-float drop-shadow-[0_30px_50px_rgba(0,0,0,0.25)] relative z-10" />
                <div className="absolute -bottom-10 w-[60%] h-6 bg-black/30 blur-[20px] rounded-[100%] animate-shadow-pulse pointer-events-none"></div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 text-left">
              <span className="text-emerald-400 font-extrabold tracking-[0.4em] text-sm uppercase mb-4 block">GIFT Theology Series No. 11</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mt-2 mb-8 leading-tight tracking-tighter">홀리 점퍼스 <br /><span className="text-2xl text-emerald-100/70 font-bold tracking-normal">19세기 미국 성결 운동의 역사</span></h2>
              <p className="text-emerald-50/90 text-lg leading-relaxed mb-12 font-medium">
                윌리엄 코슬레비의 『홀리 점퍼스』는 1890년대 초 시카고에서 설립된 급진적 종교 공동체인 '메트로폴리탄교회연합(MCA)'의 역사를 다룬 선구적인 연구서입니다. '점퍼스'라는 명칭은 그들의 역동적인 예배 방식에서 유래했습니다. 본서는 오순절 운동의 기원이 훨씬 더 혁명적이었음을 밝혀내며, 잊힌 성결 운동의 한 페이지를 생생하게 복원해냅니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 border-t border-emerald-800/50 pt-10">
                <div className="flex flex-col"><span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Author</span><span className="text-white font-black text-lg">William Kostlevy</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Translators</span><span className="text-white font-black text-lg whitespace-nowrap">김상기, 오주영, 장혜선</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Publisher</span><span className="text-white font-black text-lg">도서출판 선인</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1">Publication Year & Pages</span><span className="text-white font-black text-lg text-emerald-100/90">2025.02 / 432p</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 사중복음 섹션 - 톤업 및 글로우 (밝고 우아한 글래스모피즘) */}
      <section className="pt-56 pb-32 px-8 w-full text-left relative overflow-hidden bg-slate-50">
        {/* 북 섹션(stone-100)과의 완벽한 브릿지 전환을 위한 매우 길고 부드러운 상단 그라디언트 */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-stone-100 via-stone-50 to-transparent pointer-events-none z-0"></div>
        {/* 에메랄드 혼합 밝은 글로우 (대폭 확장) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none scale-150"></div>

        <div className="mx-auto max-w-[1200px] relative z-10">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter drop-shadow-sm">사중복음의 은혜</h2>
          <p className="text-slate-600 font-bold mb-16 shadow-sm">복음의 영광이 투영된 기독교대한성결교회의 핵심적인 네 가지 신학적 기둥을 소개합니다.</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {fourfoldGospel.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden bg-white/60 backdrop-blur-xl p-8 rounded-3xl border-2 border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-2 cursor-default"
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = item.iconColor === '#ffffff'
                    ? `0 20px 60px rgba(245,158,11,0.15), 0 0 25px rgba(245,158,11,0.5), inset 0 1px 0 rgba(255,255,255,1)`
                    : `0 20px 60px ${item.glowColor}, 0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)`;
                  const bgGlow = e.currentTarget.querySelector('.bg-glow') as HTMLElement;
                  if (bgGlow) bgGlow.style.opacity = '1';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px rgba(0,0,0,0.04)`
                  const bgGlow = e.currentTarget.querySelector('.bg-glow') as HTMLElement;
                  if (bgGlow) bgGlow.style.opacity = '0';
                }}
              >
                <div
                  className="bg-glow absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{
                    background: item.iconColor === '#ffffff'
                      ? `radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent 70%)`
                      : `radial-gradient(circle at top right, ${item.glowColor}, transparent 70%)`
                  }}
                />

                {/* 워터마크 삭제됨 */}

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex justify-start">
                    <div className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-md" style={{
                      boxShadow: item.id === 2 ? '0 0 15px rgba(251,191,36,0.6)' : `0 4px 15px ${item.glowColor}`
                    }}>
                      <div style={{ filter: item.id === 2 ? 'drop-shadow(0 0 8px rgba(251,191,36,0.8))' : 'none' }}>
                        <item.Icon color={item.iconColor === '#ffffff' ? '#eab308' : item.iconColor} />
                      </div>
                    </div>
                  </div>
                  <h3
                    className="text-2xl font-black mb-1 drop-shadow-sm transition-all duration-500"
                    style={{
                      color: item.iconColor === '#ffffff' ? '#ffffff' : item.iconColor,
                      textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 5px rgba(0,0,0,0.6)'
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-[10px] uppercase font-black tracking-widest mb-6"
                    style={{
                      color: item.iconColor === '#ffffff' ? '#ffffff' : item.iconColor,
                      textShadow: item.iconColor === '#ffffff' ? '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 2px 5px rgba(0,0,0,0.6)' : 'none'
                    }}
                  >
                    {item.subtitle}
                  </p>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed flex-1">
                    {item.desc}
                  </p>
                  <p className="mt-6 text-[11px] font-bold text-slate-500 px-3 py-1.5 bg-slate-100/80 rounded-lg inline-block self-start border border-slate-200">{item.scripture}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. 활동 갤러리 */}
      <GallerySection activities={activities} onImageClick={setSelectedImage} />

      {/* 5. 자료실 */}
      <ResourceSection posts={posts} />

      {/* 6. 푸터 */}
      <footer className="bg-slate-950 pt-24 pb-12 w-full text-left relative z-20 border-t-4 border-slate-800 shadow-[inset_0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-[1200px] px-8">
          {/* 하단 메인 푸터 정보: 브랜드 및 9개 메뉴 그리드 */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-16 pb-16 border-b border-slate-800">
            {/* 왼쪽: 브랜드 및 정보 */}
            <div className="lg:w-1/3">
              <h2 className="text-2xl font-black text-white mb-6 tracking-tighter drop-shadow-sm">GIFT<span className="text-emerald-500 text-3xl">.</span></h2>
              <p className="text-sm font-medium text-slate-400 leading-relaxed mb-6">
                글로벌 사중복음 신학연구소는 성결교회의 핵심적인 네 가지 신학적 기둥인 사중복음의 은혜를 전 세계와 나눕니다.
              </p>
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                소장: 이용호<br />
                주소: 경기도 부천시 소사구 호현로 489번길 52, 서울신학대학교 100주년기념관 306호<br />
                전화: 032-340-9271
              </p>
            </div>

            {/* 오른쪽: 9개 메뉴 (3개의 컬럼 그리드로 재배치) */}
            <div className="lg:w-2/3 w-full grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">연구소 소개</h4>
                <ul className="space-y-3 text-sm font-bold text-slate-400 pl-3">
                  <li><Link href="/about" className="hover:text-emerald-400 transition-colors">인사말 / 연혁</Link></li>
                  <li><Link href="/about" className="hover:text-emerald-400 transition-colors">정관 및 사명</Link></li>
                  <li><Link href="/about" className="hover:text-emerald-400 transition-colors">연구진 소개</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">자료 아카이브</h4>
                <ul className="space-y-3 text-sm font-bold text-slate-400 pl-3">
                  <li><Link href="/archive" className="hover:text-emerald-400 transition-colors">아카이브 메인</Link></li>
                  <li><Link href="/archive" className="hover:text-emerald-400 transition-colors">학술 논문</Link></li>
                  <li><Link href="/archive" className="hover:text-emerald-400 transition-colors">연구소 간행물</Link></li>
                  <li><Link href="/archive" className="hover:text-emerald-400 transition-colors">도서 시리즈</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-300 uppercase tracking-widest border-l-2 border-emerald-500 pl-3">고객 지원</h4>
                <ul className="space-y-3 text-sm font-bold text-slate-400 pl-3">
                  <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">고객별 메뉴</Link></li>
                  <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">문의 및 요청</Link></li>
                  <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">오시는 길</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Copyright © 2026 GLOBAL INSTITUTE FOR THE FOURFOLD-GOSPEL THEOLOGY. All rights reserved.
            </p>
            <div className="flex gap-6 text-[11px] font-bold text-slate-500">
              <Link href="/legal" className="hover:text-slate-300 transition-colors">서비스 이용약관</Link>
              <Link href="/legal" className="hover:text-slate-300 transition-colors">개인정보 처리방침</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 7. 이미지 확대 모달 */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-10 right-10 text-white hover:text-emerald-400">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-xl shadow-2xl animate-scaleUp" alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleUp { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  )
}