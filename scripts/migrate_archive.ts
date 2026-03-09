/**
 * migrate_archive.ts
 * fourfoldgospel.org → GIFT 홈페이지 archive 테이블 데이터 이관 스크립트
 *
 * 실행 방법:
 *   npm run scrape:archive
 *   (또는) npx tsx scripts/migrate_archive.ts
 *
 * 사전 조건:
 *   - .env.local에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 설정
 *   - npm install tsx (devDependency)
 *
 * 주의:
 *   실제 크롤링 로직이 더 완전하게 구현된 버전은
 *   scripts/archive-crawler.ts 를 참고하라.
 */

import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'

// ─── 환경변수 ───────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수 누락: .env.local의 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 확인하세요.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
})

// ─── 타입 정의 ──────────────────────────────────────────────
interface ArchiveItem {
  title: string
  author: string
  published_date: string | null  // 'YYYY-MM-DD' 또는 null
  category: string
  abstract_text: string
  content: string
  pdf_url: string
  original_url: string
}

// ─── 상수 ───────────────────────────────────────────────────
const BASE_URL = 'http://www.fourfoldgospel.org'

// TODO: 실제 목록 페이지 URL 패턴으로 교체
const getListUrl = (page: number) =>
  `${BASE_URL}/main/sub.html?page=${page}&boardID=www40&keyfield=&key=&bCate=`

// ─── 함수 정의 ──────────────────────────────────────────────

/**
 * fetchList — 목록 페이지에서 게시글 상세 URL 배열을 파싱해 반환한다.
 * @param page - 페이지 번호 (1부터 시작)
 * @returns 상세 페이지 URL 배열
 */
async function fetchList(page: number): Promise<string[]> {
  const url = getListUrl(page)
  const urls: string[] = []

  try {
    const { data } = await axios.get(url, { timeout: 10_000 })
    const $ = cheerio.load(data)

    // TODO: 실제 사이트 DOM 구조에 맞는 선택자로 교체
    // 예시: $(".mdWebzineSbj a").each(...)
    $('a[href*="mode=view"]').each((_, el) => {
      const href = $(el).attr('href')
      if (!href) return

      // TODO: URL 정규화 로직 (상대경로 → 절대경로 변환 등)
      const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`
      if (!urls.includes(fullUrl)) urls.push(fullUrl)
    })

    console.log(`[Page ${page}] ${urls.length}개 링크 발견`)
  } catch (err) {
    console.error(`[Page ${page}] 목록 크롤링 실패:`, (err as Error).message)
  }

  return urls
}

/**
 * fetchDetail — 개별 게시글 상세 페이지를 파싱해 ArchiveItem을 반환한다.
 * @param url - 상세 페이지 전체 URL
 * @returns ArchiveItem 또는 null (파싱 실패 시)
 */
async function fetchDetail(url: string): Promise<ArchiveItem | null> {
  try {
    const { data } = await axios.get(url, { timeout: 10_000 })
    const $ = cheerio.load(data)

    // TODO: 사이트별 실제 선택자로 교체
    const rawTitle = $('.mdView_sbj').text().trim() || $('h1').first().text().trim()

    // TODO: "[저자명] 제목" 패턴 파싱 — 저자가 제목에 포함된 경우
    let title = rawTitle
    let author = 'Unknown'
    const authorMatch = rawTitle.match(/^\[(.+?)]\s*(.+)$/)
    if (authorMatch) {
      author = authorMatch[1].trim()
      title = authorMatch[2].trim()
    }

    // TODO: 발행일 파싱 (사이트에 날짜 정보가 있는 경우)
    const published_date: string | null = null

    // TODO: 카테고리 파싱 또는 고정값 지정
    const category = '사중복음 논문'

    // TODO: 요약문 파싱 (없으면 빈 문자열)
    const abstract_text = ''

    // TODO: 본문 HTML 추출 및 이미지 절대경로 치환
    let content = $('.mdView_cont').html() || ''
    content = content.replace(/src="\/user/g, `src="${BASE_URL}/user`)

    // TODO: PDF 첨부파일 URL 추출
    const pdf_url = ''

    return { title, author, published_date, category, abstract_text, content, pdf_url, original_url: url }
  } catch (err) {
    console.error(`상세 파싱 실패 (${url}):`, (err as Error).message)
    return null
  }
}

/**
 * upsertToDb — ArchiveItem을 Supabase archive 테이블에 upsert한다.
 * original_url 기준으로 중복 여부를 판단한다.
 */
async function upsertToDb(item: ArchiveItem): Promise<boolean> {
  const { error } = await supabase
    .from('archive')
    .upsert(item, { onConflict: 'original_url' })

  if (error) {
    console.error(`❌ DB 저장 실패 (${item.title}):`, error.message)
    return false
  }
  console.log(`✅ 저장 완료: ${item.title}`)
  return true
}

// ─── 메인 실행 ──────────────────────────────────────────────
async function run() {
  console.log('🚀 fourfoldgospel.org → archive 이관 시작\n')

  let page = 1
  let totalSuccess = 0
  let totalFail = 0

  // TODO: 마지막 페이지 감지 로직 추가 (현재 최대 50페이지로 제한)
  while (page <= 50) {
    console.log(`\n── Page ${page} ──────────────────────────`)
    const urls = await fetchList(page)

    if (urls.length === 0) {
      console.log('게시물 없음. 종료합니다.')
      break
    }

    for (const url of urls) {
      const item = await fetchDetail(url)
      if (!item) { totalFail++; continue }

      const ok = await upsertToDb(item)
      ok ? totalSuccess++ : totalFail++

      // 서버 과부하 방지용 딜레이
      await new Promise(r => setTimeout(r, 800))
    }

    page++
    await new Promise(r => setTimeout(r, 2500))
  }

  console.log('\n════════════════════════════════════════')
  console.log(`완료! 성공: ${totalSuccess}건 | 실패: ${totalFail}건`)
}

run().catch(err => {
  console.error('치명적 에러:', err)
  process.exit(1)
})
