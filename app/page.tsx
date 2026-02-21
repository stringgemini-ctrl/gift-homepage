'use client'

import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Icons = {
  Regeneration: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Sanctification: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(71,85,105,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M3 12h1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  DivineHealing: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(202,138,4,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
    </svg>
  ),
  SecondComing: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-10 h-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(37,99,235,0.8)]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v6m0 0l-2-2m2 2l2-2" />
    </svg>
  ),
};

const fourfoldGospel = [
  { id: 1, icon: Icons.Regeneration, title: '중생', en: 'Regeneration', bg: 'bg-red-50', text: 'text-red-700', hoverBg: 'group-hover:bg-red-700', desc: '죄인이 예수를 믿어 영적으로 새로운 생명을 얻는 변화 (예 = 요 3:3)' },
  { id: 2, icon: Icons.Sanctification, title: '성결', en: 'Sanctification', bg: 'bg-slate-100', text: 'text-slate-700', hoverBg: 'group-hover:bg-slate-700', desc: '그리스도의 보혈로 마음이 정결케 되고 성령의 세례를 받는 은혜 (예 = 살전 5:23)' },
  { id: 3, icon: Icons.DivineHealing, title: '신유', en: 'Divine Healing', bg: 'bg-yellow-50', text: 'text-yellow-700', hoverBg: 'group-hover:bg-yellow-700', desc: '하나님의 능력이 믿음을 통해 병든 몸을 고치시는 육체적 구원 (예 = 약 5:15)' },
  { id: 4, icon: Icons.SecondComing, title: '재림', en: 'Second Coming', bg: 'bg-blue-50', text: 'text-blue-700', hoverBg: 'group-hover:bg-blue-700', desc: '부활하신 예수께서 다시 오셔서 세상을 심판하시는 소망의 완성 (예 = 행 1:11)' },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);

  const leftFigures = [
    { name: '이명직 목사', title: '성결교회의 사부', img: '/leemyungjikleft.png' },
    { name: '이성봉 목사', title: '부흥의 사도', img: '/leesungbongleft.png' }
  ];

  const rightFigures = [
    { name: '마틴 냅 목사', title: '성결의 불꽃', img: '/knappright.png' },
    { name: '찰스 카우만, 레티 카우만 선교사 부부', title: '동양선교회 창립자', img: '/lettiecowmanright.png' }
  ];

  useEffect(() => { 
    setIsLoaded(true); 
    fetchLatestPosts();
    const timer = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % leftFigures.length);
      setRightIndex((prev) => (prev + 1) % rightFigures.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const fetchLatestPosts = async () => {
    const { data } = await supabase.from('archive').select('*').order('created_at', { ascending: false }).limit(5);
    if (data) setPosts(data);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden pt-20">
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
          0% { transform: rotateY(-12deg) rotateX(5deg) translate3d(0, 0, 0); } 
          50% { transform: rotateY(12deg) rotateX(-5deg) translate3d(0, -25px, 0); } 
          100% { transform: rotateY(-12deg) rotateX(5deg) translate3d(0, 0, 0); } 
        }
        .animate-book-float { animation: book-float-rotate 3.5s ease-in-out infinite; transform-style: preserve-3d; will-change: transform; }
        @keyframes shadow-pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(0.7); opacity: 0.1; } }
        .animate-shadow-pulse { animation: shadow-pulse 3.5s ease-in-out infinite; }
        .text-glory { background: linear-gradient(135deg, #b491ff 0%, #fbbf24 50%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
      `}</style>

      {/* 1. 히어로 섹션 */}
      <section className="relative z-30 flex h-[85vh] items-center justify-center bg-gradient-to-br from-emerald-100/90 via-emerald-50/40 to-emerald-100/80 overflow-hidden text-center shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle,rgba(251,191,36,0.1)_0%,transparent_65%)] pointer-events-none -z-10" style={{ animation: 'radiant-glow 10s infinite' }} />
        <div className="hidden lg:block absolute left-4 xl:left-12 top-1/2 -translate-y-1/2 z-10 w-[22%] max-w-[280px]">
          <div key={`left-${leftIndex}`} className="animate-figure-majestic-left">
            <div className="relative"><img src={leftFigures[leftIndex].img} alt={leftFigures[leftIndex].name} className="relative w-full h-auto object-contain drop-shadow-xl sepia-[.10]" /></div>
            <p className="mt-5 text-lg font-black text-emerald-800 tracking-tighter opacity-90 drop-shadow-md">{leftFigures[leftIndex].title} <br/><span className="text-xl text-black">{leftFigures[leftIndex].name}</span></p>
          </div>
        </div>
        <div className={`relative z-20 px-5 max-w-[700px] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-[0.4em] text-emerald-600 bg-emerald-100/60 rounded-full animate-fadeInUp">THE GOOD NEWS</span>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 md:text-8xl leading-[1.1] animate-fadeInUp">성결의 빛, <br/><span className="text-glory drop-shadow-sm">온 누리에</span></h1>
          <p className="mt-8 text-sm md:text-lg font-bold text-slate-500 tracking-wide animate-fadeInUp uppercase leading-relaxed" style={{ animationDelay: '0.2s' }}>
            <span className="text-[#f68d2e] text-xl md:text-2xl">G</span>lobal <span className="text-[#f68d2e] text-xl md:text-2xl">I</span>nstitute for the <br className="hidden md:block" /><span className="text-[#f68d2e] text-xl md:text-2xl">F</span>ourfold-gospel <span className="text-[#f68d2e] text-xl md:text-2xl">T</span>heology
          </p>
          <div className="mt-12 animate-fadeInUp" style={{ animationDelay: '0.4s' }}><Link href="/archive" className="inline-block rounded-full bg-[#10b981] px-14 py-6 text-xl font-black text-white transition-all hover:bg-emerald-600 hover:scale-105 shadow-[0_20px_40px_rgba(16,185,129,0.25)]">연구소 자료실 바로가기</Link></div>
        </div>
        <div className="hidden lg:block absolute right-4 xl:right-12 top-1/2 -translate-y-1/2 z-10 w-[22%] max-w-[280px]">
          <div key={`right-${rightIndex}`} className="animate-figure-majestic-right">
            <div className="relative"><img src={rightFigures[rightIndex].img} alt={rightFigures[rightIndex].name} className="relative w-full h-auto object-contain drop-shadow-xl sepia-[.10]" /></div>
            <p className="mt-5 text-lg font-black text-emerald-800 tracking-tighter opacity-90 drop-shadow-md">{rightFigures[rightIndex].title} <br/><span className="text-xl text-black">{rightFigures[rightIndex].name}</span></p>
          </div>
        </div>
      </section>

      {/* 2. 북 섹션 (슬레이트 배경 + 보강된 텍스트 및 정렬) */}
      <section className="relative z-20 bg-slate-800 py-32 px-8 overflow-hidden shadow-inner">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none"></div>
        <div className="mx-auto max-w-[1300px] relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="relative w-full lg:w-1/2 flex justify-center perspective-[2000px]">
              <div className="relative w-full max-w-[400px] flex justify-center items-center flex-col">
                <img src="/holyjumpers3d.png" alt="Holy Jumpers 3D" className="w-full h-auto object-contain animate-book-float drop-shadow-[0_40px_70px_rgba(0,0,0,0.6)] relative z-10" />
                <div className="absolute -bottom-10 w-[60%] h-6 bg-black/40 blur-[20px] rounded-[100%] animate-shadow-pulse pointer-events-none"></div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 text-left">
              <span className="text-emerald-400 font-black tracking-[0.4em] text-sm uppercase mb-4 block">GIFT Theology Series No. 11</span>
              <h2 className="text-5xl md:text-6xl font-black text-white mt-2 mb-8 leading-tight tracking-tighter">홀리 점퍼스 <br/><span className="text-2xl text-slate-400 font-bold tracking-normal">19세기 미국 성결 운동의 역사</span></h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-12 font-medium">
                윌리엄 코슬레비의 『홀리 점퍼스』는 1890년대 초 시카고에서 설립된 급진적 종교 공동체인 '메트로폴리탄교회연합(MCA)'의 역사를 다룬 선구적인 연구서입니다. '점퍼스'라는 명칭은 그들의 역동적인 예배 방식에서 유래했습니다. 본서는 오순절 운동의 기원이 훨씬 더 혁명적이었음을 밝혀내며, 잊힌 성결 운동의 한 페이지를 생생하게 복원해냅니다.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 border-t border-white/10 pt-10">
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Author</span><span className="text-white font-black text-lg">William Kostlevy</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Translators</span><span className="text-white font-black text-lg">김상기, 오주영, 장혜선</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Publisher</span><span className="text-white font-black text-lg">도서출판 선인</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Publication Year</span><span className="text-white font-black text-lg">2025년 2월</span></div>
                <div className="flex flex-col"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pages</span><span className="text-white font-black text-lg">432p</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 사중복음 섹션 */}
      <section className="relative z-10 bg-[#faf7f2] py-32 px-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-20">사중복음의 은혜 <br/><span className="text-lg font-medium text-emerald-600 uppercase tracking-[0.3em]">Grace of Fourfold Gospel</span></h2>
        <div className="mx-auto max-w-[1300px] grid gap-8 md:grid-cols-2 lg:grid-cols-4 text-left">
          {fourfoldGospel.map((item) => (
            <div key={item.id} className="group relative rounded-[2.5rem] bg-white border border-slate-100/50 p-10 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] shadow-sm">
              <div className={`mb-10 flex h-20 w-20 items-center justify-center rounded-3xl ${item.bg} ${item.text} group-hover:scale-110 transition-transform duration-500`}><item.icon /></div>
              <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
              <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{item.en}</p>
              <p className="mt-8 text-[15px] leading-relaxed text-slate-500 font-medium group-hover:text-slate-700 transition-colors">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. 자료실 섹션 (Supabase 연동 로직 포함 복구) */}
      <section className="bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 py-32 px-8 relative">
        <div className="mx-auto max-w-[1200px]">
          <div className="bg-white/60 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16 shadow-[0_30px_80px_rgba(0,0,0,0.05)] border border-white/60 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#f68d2e]"></div>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">연구소 자료실</h2>
              <p className="mt-2 text-sm font-bold text-emerald-600 uppercase tracking-[0.3em]">Latest Archives</p>
              <div className="mt-4"><Link href="/archive" className="text-sm font-black text-emerald-500 border-b-2 border-emerald-500/20 hover:border-emerald-500">전체보기 →</Link></div>
            </div>
            <div className="flex flex-col gap-2">
              {posts.map((post) => (
                <Link href={`/archive/${post.id}`} key={post.id} className="group bg-white/50 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-emerald-100/50">
                  <div className="flex items-center gap-6 w-full">
                    <span className="w-24 px-3 py-1.5 rounded-full bg-emerald-100/40 text-emerald-700 font-black text-[11px] uppercase tracking-widest text-center">{post.category}</span>
                    <h3 className="flex-1 font-bold text-slate-700 text-lg group-hover:text-emerald-700 truncate pr-4">{post.title}</h3>
                  </div>
                  <span className="w-32 text-right text-sm font-medium text-slate-400">{new Date(post.created_at).toLocaleDateString()}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
