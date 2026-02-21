'use client'

import { useState } from 'react'

// --- 데이터 영역 ---

const greetingContent = {
  title: "글로벌사중복음연구소 홈페이지에 오신 것을 환영합니다",
  paragraphs: [
    "사중복음은 예수께서 전하신 임박한 하나님의 나라를 알리며, 지구상의 모든 민족이 그 나라에 참여토록 요청하는 성서적 케리그마(선포)입니다.",
    "사중복음은 철저한 하나님 나라 중심의 세계관을 보여주며, 예수 그리스도의 십자가 정신과 성령세례를 통해 열려지는 거룩한 삶으로 우리를 이끕니다.",
    "주님의 교회들이 이러한 사중복음의 정신과 그 능력으로 날마다 새로운 존재로 살아 갈 수 있도록 사중복음의 전통과 정신을 연구하기 위하여 태어난 본 연구소가 그 소명을 잘 감당할 수 있도록 기도해주시고 참여해주시면 감사하겠습니다."
  ],
  director: "글로벌사중복음연구소 소장 이용호"
};

const missionData = [
  { id: '01', title: '사중복음신앙 체험', desc: '교회 공동체가 온전한 구원의 확신을 성경 말씀 위에 세우도록 교의학적 기초를 확고히 수립하는 일을 돕습니다.', items: [{ highlight: '중생신앙으로!', text: '거듭남으로 영적 자유를 추구하는 삶' }, { highlight: '성결신앙으로!', text: '십자가와 성령세례로 죄악을 정복하는 삶' }, { highlight: '신유신앙으로!', text: '하나님의 능력으로 세상을 치유하는 삶' }, { highlight: '재림신앙으로!', text: '부활의 소망으로 복음을 증거하는 삶' }] },
  { id: '02', title: '사중복음 신학 정립', desc: '사중복음신앙을 고백하는 그리스도인으로 하여금 기독교 세계관을 바르게 세우도록 하는 일을 돕습니다.', items: [{ highlight: '하나님 제일주의(Theocentrism) 신앙으로!', text: '세속주의와 교권주의를 타파하는 사중복음정신 확립' }, { highlight: '승리자 그리스도(Christus Victor) 신앙으로!', text: '하나님의 관점에서 세상을 이기는 사중복음정신 확립' }, { highlight: '오순절 성결세례(Pentecostalism) 신앙으로!', text: '인간의 공로주의와 배타주의를 넘어서는 사중복음정신 확립' }, { highlight: '초교파주의(Globalism) 신앙으로!', text: '그리스도의 화해와 생명의 일치를 추구하는 사중복음정신 확립' }] },
  { id: '03', title: '사중복음윤리 실천', desc: '사중복음신앙 고백과 사중복음정신을 살려 모든 그리스도인들이 가정과 교회와 사회생활 가운데 하나님의 뜻대로 살도록 돕습니다.', items: [{ highlight: '생명의 윤리 실천으로!', text: '생명의 우선성에 기초한 생활' }, { highlight: '사랑의 윤리 실천으로!', text: '이웃의 아픔에 동참하는 생활' }, { highlight: '회복의 윤리 실천으로!', text: '불의의 재결합을 추구하는 생활' }, { highlight: '공의의 윤리 실천으로!', text: '주어진 힘을 바르게 사용하는 생활' }] }
];

const bylawsData = [
  { title: '제1조 (명칭과 위치)', content: "본 연구소는 '글로벌사중복음연구소’라 칭하며(이하 ‘본연구소’라고 한다), 서울신학대학교 안에 둔다. 영문은 다음과 같이 표기한다: The Global Institute for the Fourfold-Gospel Theology [G.I.F.T]" },
  { title: '제2조 (목적)', content: "본 연구소는 한국성결교회가 1925년에 공포한 바대로 “감리교회의 개조(開祖)인 요한 웨슬레를 이어 일어나 곧 초시대(初時代)의 감리교회와 같이 중생, 성결, 신유, 재림의 복음을 고조(高調)하며 ... 그리스도와 그 사도들로 말미암아 나타내심과 요한 웨슬레의 성경해석의 근본적 교리와 만국성결교회의 신앙개조를 토대로(이명직, 성결교회약사, 경성: 조선예수교동양선교회 성결교회이사회 간행, 1925. 서언, 10쪽)'사중복음’과 그 정신을 초교파적으로 연구함으로써 21세기 성결교회와 세계교회의 신학혁신과 목회혁신에 이바지하는 것을 목적으로 한다." },
  { title: '제3조 (사업)', content: "본 연구소는 제2조의 목적을 달성하기 위하여 다음의 사업을 계획하고 실행한다.\n① 성결운동의 역사와 정신, 및 사중복음 신학의 정립을 위한 제반 연구를 진행하다.\n② 목회자와 신자들의 영적 부흥을 위한 사중복음 컨퍼런스 및 사중복음학교를 운영한다.\n③ 성결교회 신자들의 사중복음 신앙을 위한 훈련 프로젝트를 운영한다.\n④ 글로벌 성결운동 네트워크 구축 및 국제학술대회를 개최한다.\n⑤ 연구와 훈련을 위한 각종 도서를 제작 출판한다.\n⑥ 서울신학대학교 및 교단 등 단체에서 위탁한 프로젝트를 진행한다.\n⑦ 위탁 프로젝트에 대한 세부규정은 별도로 마련한다." },
  { title: '제4조 (임직원)', content: "본 연구소의 구성은 다음과 같다.\n① 소장 1인\n② 책임연구원 및 연구원 약간 명\n③ 조교 약간명" },
  { title: '제5조 (자격 및 임명)', content: "① 소장은 성결교회 신학이나 이와 동등한 분야를 연구한 바 있는 전임교원 가운데서 총장이 임명한다.\n② 운영위원은 소장의 제청으로 총장이 임명하며, 연구원 및 조교는 운영위원회의 승인을 얻어 소장이 임명한다.\n③ 조교는 본교 조교인사규정을 따른다." },
  { title: '제6조 (임기)', content: "본 연구소의 모든 임직원의 임기는 2년으로 하되 연임할 수 있다." },
  { title: '제7조 (직무)', content: "① 소장은 본 연구소를 대표하고, 연구소의 운영에 관한 제반 업무와 활동을 관장하며, 운영위원회 및 제반회의의 의장이 된다.\n② 연구원은 소장의 지시를 따라 연구소의 운영에 관한 제반 연구 과제를 수행한다.\n③ 간사 또는 조교는 소장의 지시를 따라 연구소의 제반 업무를 집행한다." },
  { title: '부칙 (시행일 등)', content: "① (규약의 개정) 운영위원회의 심의를 거쳐 총장의 승인을 받아 개정할 수 있다.\n② (준용) 명시되지 않은 사항은 본교 관련 규정을 준용한다.\n③ (경과규정) 시행 이전의 활동은 본 규정에 의한 것으로 본다.\n④ (발효) 본 규정은 2014년 6월 11일부터 시행한다.\n제정 2014년 6월 11일" },
];

const familyData = [
  { role: '소장 / Director', name: '이용호 교수', bio: '서울신학대학교 전임교수.\n글로벌사중복음연구소(GIFT) 소장.', img: '/director.png?v=2' },
  { role: '사무국장, 전임연구원 / Chief of Administration, Senior Researcher', name: '장혜선 박사', bio: '서강대학교 생명과학과\n서울신학대학교 신학대학원(M.Div)\n서울신학대학교 대학원(Th.M)\n서울신학대학교 대학원(Ph.D)\n조직신학박사', img: '/jang.png?v=2' },
  { role: '연구원 / Researcher', name: '김상기 박사', bio: '서울신대 신학과(B.A.)\n연세대학교 연합 신학대학원(M.A.)\n연세대학교 대학원 기독교 윤리학(Ph.D)\n센프란시스코 신학교(Cad.D.Min)\n현 갈릴리겨자나무교회 담임목사', img: '/kim.png?v=2', objectPosition: 'object-[40%_center]' },
  { role: '객원연구원 / Visiting Researcher', name: '초빙 예정', bio: '국내외 사중복음 신학 전문가 초빙 예정.', img: '' },
  { role: '간사 / Research Coordinator', name: '이현규', bio: '글로벌사중복음연구소 간사.', img: '/lee.png?v=2' },
];

const historyData = [
  { year: '2023', items: [
    { date: '23.10.18', content: '제10회 사중복음 국제학술제' },
    { date: '23.10.16 ~ 23.10.23', content: '국제 학술탐방' },
    { date: '23.08.18', content: '조기연 제 2대 연구소장 은퇴식 & 출판기념회' },
    { date: '23.08.01', content: '제 3대 소장 오성욱 교수 취임' },
    { date: '23.05.17', content: '글로벌 사중복음 연구소 3040 목회자 세미나 간담회' },
    { date: '23.02.08 ~ 23.02.09', content: '연구소 워크샵' },
    { date: '23.01.26', content: '글로벌 사중복음 이사회 신년 하례회' },
  ]},
  { year: '2022', items: [
    { date: '22.12.08', content: '제 20회 글로벌 사중복음 정기 학술제\n- 사중복음과 기독교 윤리(2) 타자를 위한 교회, 타자를 위한 사중복음 - 디트리히 본회퍼의 교회 이해를 사중복음의 기독교 윤리학적 담론들 (발제자 : 김성호 박사 / 논찬 : 오성욱 박사)' },
    { date: '22.12.08', content: '글로벌 사중복음 이사회 총회' },
    { date: '22.11.30', content: '제 9차 글로벌사중복음 국제 학술제\n- The Perspective of the Digital Worship in the Post-Corona Era (발제 : 테레사 버거, 오주영 박사 / 논찬 : 조기연 교수)' },
    { date: '22.10.05', content: '제18회 글로벌사중복음 정기학술제\n- 사중복음과 기독교 윤리(1) 웨슬리의 산상수훈설교에 나타난 성품윤리 분석 (발제 : 김상기 박사 / 논찬 : 김희준 박사)' },
    { date: '22.07.14', content: '제 17회 글로벌사중복음 연구소 정기학술제\n- 사중복음과 나카다 주지 북 콘서트 (발제 : 박창훈, 오성욱 교수)' },
    { date: '22.06.', content: '연구소 출판물 영문저널\n-World Christianity & the Fourfold gospel no. 7. (2022. 6월)' },
    { date: '22.03.', content: '연구소 출판도서 / 나카다 주지의 사중복음\n-나카다 주지 저, 소기호, 정민임 역, (서울신대 출판부, 2022. 3월)' },
    { date: '22.02.16', content: '제 16회 글로벌 사중복음 정기학술제\n- 사중복음과 신앙고백 (발제 : 오주영 박사, 오성욱 교수 / 논찬 : 황훈식 박사)' },
  ]},
  { year: '2021', items: [
    { date: '21.08.01', content: '조기연 교수 신임 연구소장 임명' },
    { date: '21.07.30', content: '최인식 연구소장 은퇴' },
    { date: '21.06.22 ~ 21.06.29', content: '제 8차 국제학술 세미나 "사중복음의 오순절 신학적 지평"' },
  ]},
  { year: '2020', items: [
    { date: '20.12.30', content: '제1회 실시간 온라인 연구모임(글로벌사중복음연구소 주관)' },
    { date: '20.12.21', content: '<제15회 사중복음 학술세미나> 주제: 사중복음과 순교영성' },
    { date: '20.12.01', content: '윤리프로젝트 연구원 임명(김상기 박사, 김성호 박사)' },
    { date: '20.11.30', content: '글로벌사중복음 이사회 정기총회' },
    { date: '20.09.14', content: '<제 7차 사중복음 국제학술제> 부천, 서울신학대학교 백주년 기념관' },
    { date: '20.09.', content: '영문저널 World Christianity & the Fourfold Gospel 제6호 출간' },
    { date: '20.09.', content: '[GIFT 사중복음신학시리즈 6] 『사중복음과 복음주의』' },
    { date: '20.03.', content: '영문저널 World Christianity & the Fourfold Gospel 제 5호 출간' },
    { date: '20.02.05', content: '<제3회 미주목회자 사중복음세미나> (아틀랜타)' },
    { date: '20.01.30', content: '연구소 워크숍(서울)' },
    { date: '20.01.16', content: '이사회 신년하례회(서울역)' },
  ]},
  { year: '2019', items: [
    { date: '19.12.05', content: '글로벌 사중복음 이사회 정기총회' },
    { date: '19.11.27', content: '<제13회 사중복음 학술세미나> 주제: 사중복음과 사회적 실천 모색' },
    { date: '19.11.17', content: '미주 사중복음연구소 개소식 참여 및 특강' },
    { date: '19.10.21', content: '<제6차 사중복음 국제학술제> 영국, 맨체스터 공동주최' },
    { date: '19.07.01', content: '제주지방회와 함께하는 제5차 사중복음컨퍼런스' },
    { date: '19.05.23', content: '<제12회 사중복음 학술세미나> 주제: 사중복음과 사회적 실천 모색' },
    { date: '19.03.25', content: '미성대 사중복음 집중강의' },
    { date: '19.03.15', content: '미국 웨슬리학회 참석' },
    { date: '19.03.06', content: '글로벌 사중복음 연구소 교수운영위원회' },
    { date: '19.03.', content: '영문저널 World Christianity & the Fourfold Gospel 제 4호 출간' },
    { date: '19.02.22', content: '연구소 주관 학술제(기독교여성리더십연구회)' },
    { date: '19.02.21', content: '이사회 신년하례회' },
    { date: '19.01.15', content: '대만 사중복음세미나 진행' },
  ]},
  { year: '2018', items: [
    { date: '18.12.03', content: '글로벌 사중복음 연구소 교수운영위원회' },
    { date: '18.11.20', content: 'GIFT 글로벌 사중복음 이사회 정기총회' },
    { date: '18.11.05', content: '<제2회 미주 목회자 사중복음세미나> (LA)' },
    { date: '18.10.18', content: '<제 10회 사중복음 학술 세미나> 주제: 사중복음과 현대목회' },
    { date: '18.09.17', content: '사중복음 목회계획세미나' },
    { date: '18.09.16', content: '낙원교회 사중복음 세미나' },
    { date: '18.09.', content: '[GIFT 사중복음 신앙시리즈25] 『믿음의 영웅 마틴 냅』' },
    { date: '18.08.', content: '[GIFT 사중복음 신학시리즈 5] 『웨슬리안 사중복음 교의학 서설』' },
    { date: '18.07.12', content: '연구소 워크숍(산정호수)' },
    { date: '18.07.09', content: '이사회 독서모임(목포)' },
    { date: '18.06.17', content: '<제 1회 미주 목회자 사중복음 세미나> (포틀랜드)' },
    { date: '18.06.05', content: '<제9회 사중복음 학술세미나> 주제: 사중복음과 현대사회 이해' },
    { date: '18.05.07', content: '<제5차 사중복음 국제학술제> 일본, 동경성서학원' },
    { date: '18.04.12', content: '<제7회 사중복음 학술세미나> 주제 : 사중복음으로 읽는 텍스트와 컨텍스트' },
    { date: '18.03.08', content: '미국 웨슬리학회 참석' },
    { date: '18.01.18', content: '이사회 신년 하례회' },
  ]},
  { year: '2017', items: [
    { date: '17.12.07', content: '글로벌사중복음연구소 교수운영위원회' },
    { date: '17.11.27', content: '[GIFT사중복음신학시리즈4] 『종교개혁과 사중복음』' },
    { date: '17.11.27', content: '제3회 사중복음목회자컨퍼런스(삼광교회)' },
    { date: '17.06.19', content: '종교개혁지 탐방 및 제4회 사중복음국제학술제' },
    { date: '17.03.03', content: '미국웨슬리학회 참석(시카고)' },
    { date: '17.01.12', content: '이사회 신년 하례회' },
  ]},
  { year: '2016', items: [
    { date: '16.11.17', content: '제3회 사중복음이사회 정기총회' },
    { date: '16.11.02', content: '제1회 사중복음학교 개강' },
    { date: '16.10.10', content: '[GIFT사중복음신학시리즈3] 『사중복음과 성서신학』' },
    { date: '16.10.10', content: '제2회 사중복음목회자컨퍼런스(평창)' },
    { date: '16.09.11', content: '영어논문 공모전 시상식' },
    { date: '16.03.11', content: '미국웨슬리학회 참석(샌디에고)' },
    { date: '16.03.', content: '연구소 홈페이지 개시(국문/영문)' },
    { date: '16.01.13', content: '[GIFT사중복음논총2]『19세기 성결운동가의 재림론』' },
  ]},
  { year: '2015', items: [
    { date: '15.11.19', content: '제2회 사중복음이사회 정기총회' },
    { date: '15.10.30', content: '영문저널 창간호 출판기념회' },
    { date: '15.10.15', content: '제1회 글로벌사중복음목회자컨퍼런스 (안성)' },
    { date: '15.10.01', content: '제3회 글로벌사중복음학술제 [주제: 성령과 성령세례]' },
    { date: '15.06.02', content: '글로벌사중복음연구소와 함께하는 “북콘서트”' },
    { date: '15.04.30', content: '[GIFT사중복음신학시리즈2] 『글로벌신학과 사중복음』' },
    { date: '15.03.06', content: 'Wesleyan Theological Society 참석(Ohio)' },
  ]},
  { year: '2014', items: [
    { date: '14.10.29', content: '제1회 사중복음이사회 정기총회 (천안성결교회)' },
    { date: '14.10.13', content: '제2회 사중복음국제학술제 및 목회자 포럼 [주제: 신유]' },
    { date: '14.07.21', content: '글로벌사중복음연구소이사회 비전워크샵 (전주바울교회)' },
    { date: '14.04.28', content: '서울신학대학교 글로벌사중복음연구소 창립식 (교단과 학교 MOU)' },
    { date: '14.04.22', content: '[GIFT사중복음논총1]『19세기 급진적성결운동가의 생애와 사상』' },
    { date: '14.03.10', content: '제1회 창립기념 국제학술세미나 및 신학시리즈 1권 출간' },
  ]},
];

// --- 메인 컴포넌트 ---

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('greeting');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 py-32 px-6">
      <div className="mx-auto max-w-[1000px]">
        
        <div className="flex justify-center mb-20">
          <div className="inline-flex bg-white/60 backdrop-blur-2xl p-1.5 rounded-2xl border border-white/80 shadow-sm overflow-x-auto hide-scrollbar">
            {['greeting', 'mission', 'bylaws', 'family', 'history'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 md:px-10 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab === 'greeting' ? '소장 인사말' : tab === 'mission' ? '사명선언문' : tab === 'bylaws' ? '정관' : tab === 'family' ? '가족 소개' : '연혁'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'greeting' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-black text-xs tracking-[0.4em] uppercase mb-4 block">Welcome Message</span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic leading-tight">{greetingContent.title}</h1>
            </div>
            <div className="bg-white/80 backdrop-blur-3xl rounded-[4rem] p-12 md:p-20 shadow-xl border border-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-3 bg-emerald-500"></div>
              <div className="space-y-10">
                {greetingContent.paragraphs.map((para, idx) => (<p key={idx} className="text-xl md:text-2xl font-bold text-slate-700 leading-relaxed">{para}</p>))}
                <div className="pt-16 border-t border-slate-100 flex flex-col items-end">
                  <span className="text-emerald-600 font-black text-sm uppercase mb-2">Director of GIFT</span>
                  <p className="text-3xl font-black text-slate-900 italic">{greetingContent.director}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-16"><h1 className="text-4xl font-black text-slate-900 tracking-tighter">사명선언문</h1><p className="mt-2 text-emerald-600 font-bold tracking-[0.3em] text-xs uppercase">Mission Statement</p></div>
            <div className="grid gap-10">{missionData.map((section, idx) => (<div key={idx} className="bg-white/80 backdrop-blur-3xl rounded-[3rem] p-10 md:p-16 shadow-xl border border-white relative group transition-all duration-500"><div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#f68d2e]"></div><div className="flex flex-col md:flex-row gap-12 items-start"><div className="md:w-1/3"><span className="text-7xl font-black text-emerald-500/10 tracking-tighter mb-4 block">{section.id}</span><h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-6">{section.title}</h2><p className="text-slate-500 font-medium leading-relaxed">{section.desc}</p></div><div className="md:w-2/3 grid gap-4 w-full">{section.items.map((item, i) => (<div key={i} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 shadow-sm"><span className="block text-emerald-600 font-black text-[11px] mb-2 uppercase">{item.highlight}</span><p className="text-slate-700 font-bold text-lg">{item.text}</p></div>))}</div></div></div>))}</div>
          </div>
        )}

        {activeTab === 'bylaws' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-16"><h1 className="text-4xl font-black text-slate-900 tracking-tighter">연구소 정관</h1><p className="mt-2 text-emerald-600 font-bold tracking-[0.2em] text-xs uppercase">Bylaws of GIFT</p></div>
            <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] p-10 md:p-20 shadow-xl border border-white relative"><div className="absolute top-0 left-0 w-full h-2 bg-slate-400"></div><div className="mb-16 text-center border-b border-slate-100 pb-12"><h3 className="text-2xl font-black text-slate-800 italic">글로벌사중복음연구소 운영규정</h3></div><div className="space-y-12">{bylawsData.map((art, idx) => (<div key={idx} className="relative pl-6 border-l border-slate-100 group"><div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-slate-200 group-hover:bg-emerald-400 transition-colors"></div><p className="font-black text-slate-900 mb-3 text-lg">{art.title}</p><div className="text-slate-600 text-[16px] leading-[1.9] font-medium whitespace-pre-line tracking-tight">{art.content}</div></div>))}</div></div>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-20"><h1 className="text-4xl font-black text-slate-900 tracking-tighter">연구소 가족 소개</h1><p className="mt-2 text-emerald-600 font-bold tracking-[0.3em] text-xs uppercase">GIFT Family</p></div>
            <div className="grid gap-8 grid-cols-1">{familyData.map((member, idx) => (<div key={idx} className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-12 shadow-xl border border-white flex flex-col md:flex-row items-center gap-10 group hover:shadow-[0_30px_60px_rgba(16,185,129,0.15)] transition-all duration-500"><div className="relative shrink-0"><div className="absolute inset-0 bg-emerald-400/50 blur-[40px] rounded-full scale-125 opacity-60 group-hover:opacity-100 transition-all duration-700"></div><div className="relative w-36 h-36 md:w-48 md:h-48 rounded-full bg-slate-100 border-[6px] border-white overflow-hidden shadow-2xl">{member.img ? (<img src={member.img} alt={member.name} className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-110 ${member.objectPosition || 'object-center'}`} />) : (<div className="w-full h-full flex items-center justify-center text-slate-300"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg></div>)}</div></div><div className="flex-1 text-center md:text-left"><span className="text-[13px] font-black text-emerald-600 uppercase tracking-[0.3em] block mb-3">{member.role}</span><h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">{member.name}</h3><div className="text-[16px] text-slate-500 font-medium leading-relaxed whitespace-pre-line border-l-4 border-emerald-100/50 pl-8">{member.bio}</div></div></div>))}</div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fadeInUp">
            <div className="text-center mb-20"><h1 className="text-4xl font-black text-slate-900 tracking-tighter">연구소 연혁</h1><p className="mt-2 text-emerald-600 font-bold tracking-[0.3em] text-xs uppercase">History of GIFT</p></div>
            <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] p-10 md:p-20 shadow-xl border border-white relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-slate-700 opacity-80"></div><div className="space-y-16">
              {historyData.map((yearGroup, idx) => (
                <div key={idx} className="relative">
                  <h4 className="text-3xl font-black text-emerald-600 mb-8 flex items-center gap-3"><span className="w-1.5 h-8 bg-emerald-500 rounded-full"></span>{yearGroup.year}</h4>
                  <div className="space-y-8 ml-6">
                    {yearGroup.items.map((item, i) => (
                      <div key={i} className="flex flex-col md:flex-row gap-2 md:gap-8 border-l-2 border-slate-100 pl-6 group/item hover:border-emerald-300 transition-colors">
                        <span className="text-emerald-500 font-black text-sm tracking-tight w-32 shrink-0">{item.date}</span>
                        <p className="text-slate-700 font-bold text-[16px] leading-relaxed whitespace-pre-line flex-1">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div></div>
          </div>
        )}

        <footer className="mt-24 text-center pb-20 border-t border-slate-100 pt-16">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] mb-4">Global Institute for the Fourfold-gospel Theology</p>
          <div className="flex justify-center gap-4 text-[10px] font-bold text-slate-400"><span>Copyright © 2026 GIFT</span><span>|</span><span>Seoul Theological University</span></div>
        </footer>
      </div>
    </div>
  )
}