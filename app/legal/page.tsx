'use client'

import { useState } from 'react'

const legalData = {
  privacy: {
    title: '개인정보 처리방침',
    content: `글로벌사중복음연구소(이하 '연구소')는 이용자의 개인정보를 소중하게 다루며, 관련 법령을 준수합니다.

1. 수집 항목: 성명, 접속 로그, 쿠키, 브라우저 정보 등
2. 수집 목적: 홈페이지 이용 통계 분석 및 관리자 서비스 제공
3. 보유 기간: 서비스 제공 종료 시 또는 이용자 요청 시까지
4. 제3자 제공: 법령에 정해진 경우를 제외하고 제3자에게 제공하지 않습니다.

본 방침은 표준 양식을 기반으로 작성되었으며, 추후 연구소 운영 방침에 따라 업데이트될 수 있습니다.`
  },
  terms: {
    title: '웹 사이트 이용 약관',
    content: `제1조 (목적)
본 약관은 글로벌사중복음연구소가 제공하는 웹사이트 서비스 이용과 관련하여 이용자와 연구소 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (저작권)
1. 연구소가 작성한 저작물에 대한 저작권은 연구소에 귀속됩니다.
2. 이용자는 서비스를 이용하며 얻은 정보를 연구소의 사전 승낙 없이 영리 목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.`
  },
  notice: {
    title: '법적 고지',
    content: `1. 본 웹사이트에 게재된 모든 정보는 연구 목적으로 제공되며, 실제 사실과 차이가 있을 수 있습니다.
2. 연구소는 본 사이트의 정보를 이용함으로써 발생하는 직·간접적인 손해에 대하여 법적 책임을 지지 않습니다.
3. 타 사이트로 연결된 링크의 경우, 해당 사이트의 내용에 대해서는 연구소가 보증하거나 책임을 지지 않습니다.`
  }
}

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'notice'>('privacy')

  return (
    <div className="min-h-screen bg-slate-50 py-32 px-6">
      <div className="mx-auto max-w-[800px]">
        <h1 className="text-3xl font-black text-slate-900 mb-10 tracking-tighter text-center">법적 고지 및 약관</h1>
        
        <div className="flex border-b border-slate-200 mb-8">
          {(['privacy', 'terms', 'notice'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold transition-all ${
                activeTab === tab 
                ? 'text-emerald-600 border-b-2 border-emerald-600' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'privacy' ? '개인정보 처리방침' : tab === 'terms' ? '이용 약관' : '법적 고지'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-slate-100 min-h-[400px]">
          <h2 className="text-xl font-black text-slate-800 mb-8">{legalData[activeTab].title}</h2>
          <div className="text-slate-600 leading-[1.8] whitespace-pre-line font-medium text-left">
            {legalData[activeTab].content}
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <button onClick={() => window.history.back()} className="text-slate-400 font-bold hover:text-emerald-600 transition-colors">
            ← 이전 페이지로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}