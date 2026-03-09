/**
 * archive-crawler.ts
 * 타겟: http://www.fourfoldgospel.org/main/sub.html?boardID=www40 (사중복음 논문 게시판)
 * 목적: fourfoldgospel.org 논문 17건을 Supabase archive 테이블에 이관
 *
 * 실행: npm run scrape:archive:full
 *
 * [DOM 분석 기준: 2026-03-08]
 * 목록 선택자 : .mdWebzineSbj a  (href → /main/sub.html?Mode=view&boardID=www40&num=NNN...)
 * 상세 제목   : .mdView_sbj text  → "[저자] 제목" 패턴
 * 상세 날짜   : .mdView_date text → "등록일 : YYYY.MM.DD" 패턴
 * 상세 본문   : #lightgallery html
 * 상세 PDF    : .mdView_file 내 a[href*="fileDown"] 중 .pdf 텍스트 포함 항목
 *               → /core/anyboard/download.php?boardID=www40&fileNum={ID}
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ─── 환경변수 ─────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ 환경 변수 누락: .env.local의 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY를 확인하세요.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

// ─── 타입 ─────────────────────────────────────────────────────
interface ArchiveData {
    title: string;
    author: string;
    published_date: string | null;  // "YYYY-MM-DD" 또는 null
    category: string;
    abstract_text: string;
    content: string;
    pdf_url: string;
    original_url: string;
}

// ─── 상수 ─────────────────────────────────────────────────────
const BASE_URL = "http://www.fourfoldgospel.org";

// 목록 페이지 URL — 총 17건, 페이지당 10건이므로 2페이지까지 존재
const getListUrl = (page: number) =>
    `${BASE_URL}/main/sub.html?page=${page}&boardID=www40&keyfield=&key=&bCate=`;

// PDF 다운로드 엔드포인트 (fileNum 변수 치환)
const getPdfUrl = (fileNum: string) =>
    `${BASE_URL}/core/anyboard/download.php?boardID=www40&fileNum=${fileNum}`;


// ─── 1. 목록 파싱 ─────────────────────────────────────────────
/**
 * 목록 페이지에서 게시글 상세 URL 배열을 파싱한다.
 *
 * 실제 HTML:
 * <p class="mdWebzineSbj">
 *   <a href="/main/sub.html?Mode=view&boardID=www40&num=928&page=1&...">...</a>
 * </p>
 */
async function fetchArchiveList(page: number): Promise<string[]> {
    const url = getListUrl(page);
    const postUrls: string[] = [];

    try {
        const { data } = await axios.get(url, {
            timeout: 15_000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GIFT-Crawler/1.0)" },
        });
        const $ = cheerio.load(data);

        // .mdWebzineSbj a → href가 이미 올바른 상세 페이지 상대 경로
        $(".mdWebzineSbj a").each((_, el) => {
            const href = $(el).attr("href");
            if (!href) return;

            // 상대경로 → 절대경로 변환
            const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

            // num= 파라미터가 있는 실제 게시글 URL만 수집
            if (/[?&]num=\d+/.test(fullUrl) && !postUrls.includes(fullUrl)) {
                postUrls.push(fullUrl);
            }
        });

        console.log(`[Page ${page}] ${postUrls.length}개 게시글 발견`);
    } catch (err) {
        console.error(`[Page ${page}] 목록 크롤링 실패:`, (err as Error).message);
    }

    return postUrls;
}


// ─── 2. 상세 페이지 파싱 ──────────────────────────────────────
/**
 * 상세 페이지에서 논문 메타데이터와 본문을 추출한다.
 *
 * 실제 HTML 예시:
 * - 제목: <div class="mdView_sbj"> <span class='mdPx16'>[조기연]</span> 초기 기독교 세례예전과 사중복음 </div>
 * - 날짜: <div class="mdView_date"> ... 등록일 : 2024.04.24 | 조회수 : 630 ... </div>
 * - 본문: <div id="lightgallery"> ... </div>
 * - PDF:  <a href="javascript:anyboard.fileDown('1966');"> ... 파일명.pdf ... </a>
 */
async function fetchArchiveDetail(url: string): Promise<ArchiveData | null> {
    try {
        const { data } = await axios.get(url, {
            timeout: 15_000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GIFT-Crawler/1.0)" },
        });
        const $ = cheerio.load(data);

        // ── 제목 & 저자 파싱 ──────────────────────────────────
        // ".mdView_sbj" text → "[조기연] 초기 기독교 세례예전과 사중복음"
        const rawTitle = $(".mdView_sbj").first().text().trim();
        let title = rawTitle;
        let author = "Unknown";

        // "[저자명] 제목" 패턴 파싱
        const authorMatch = rawTitle.match(/^\[(.+?)]\s*(.+)$/);
        if (authorMatch) {
            author = authorMatch[1].trim();
            title = authorMatch[2].trim();
        }

        // ── 등록일 파싱 ───────────────────────────────────────
        // ".mdView_date" text → "... 등록일 : 2024.04.24 | 조회수 ..."
        let published_date: string | null = null;
        const dateText = $(".mdView_date").first().text();
        const dateMatch = dateText.match(/등록일\s*:\s*(\d{4})\.(\d{2})\.(\d{2})/);
        if (dateMatch) {
            published_date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`; // "YYYY-MM-DD"
        }

        // ── 카테고리 ──────────────────────────────────────────
        // boardID=www40 게시판 이름 = "사중복음 논문" (페이지 title 태그로 확인)
        const category = "사중복음 논문";

        // ── 본문 HTML ─────────────────────────────────────────
        // #lightgallery 안에 이미지, 텍스트 등 본문 HTML이 위치
        let content = $("#lightgallery").html() || $(".mdView_cont").html() || "";
        // 이미지 상대경로 → 절대경로 치환 (Supabase에서 렌더링 시 필요)
        content = content.replace(/src="\/user/g, `src="${BASE_URL}/user`);

        // abstract_text: 본문 HTML에서 텍스트만 추출한 요약 (최대 300자)
        const abstract_text = $(".mdView_cont").text().replace(/\s+/g, " ").trim().slice(0, 300);

        // ── PDF 링크 추출 ─────────────────────────────────────
        // <a href="javascript:anyboard.fileDown('1966');"> ... 파일명.pdf ... </a>
        let pdf_url = "";
        $(".mdView_file a").each((_, el) => {
            const linkText = $(el).text();
            const href = $(el).attr("href") || "";

            // 이미 PDF를 찾았으면 건너뜀
            if (pdf_url) return;

            // 링크 텍스트에 ".pdf" 포함 + fileDown 패턴에서 ID 추출
            if (linkText.toLowerCase().includes(".pdf")) {
                const fileNumMatch = href.match(/fileDown\('(\d+)'\)/);
                if (fileNumMatch) {
                    pdf_url = getPdfUrl(fileNumMatch[1]);
                }
            }
        });

        if (!title) {
            console.warn(`  ⚠️  제목 추출 실패 (${url})`);
            return null;
        }

        return { title, author, published_date, category, abstract_text, content, pdf_url, original_url: url };

    } catch (err) {
        console.error(`상세 파싱 실패 (${url}):`, (err as Error).message);
        return null;
    }
}


// ─── 3. PDF → Supabase Storage 업로드 ────────────────────────
async function uploadPdfToStorage(originalPdfUrl: string, articleNum: string): Promise<string> {
    if (!originalPdfUrl) return "";

    try {
        console.log(`  → PDF 다운로드 중: ${originalPdfUrl}`);
        const response = await axios.get(originalPdfUrl, {
            responseType: "arraybuffer",
            timeout: 30_000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GIFT-Crawler/1.0)" },
        });
        const buffer = Buffer.from(response.data);
        const fileName = `fourfoldgospel_${articleNum}_${crypto.randomUUID()}.pdf`;

        const { error } = await supabase.storage
            .from("archives")
            .upload(fileName, buffer, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (error) {
            console.error(`  ❌ PDF 업로드 실패: ${error.message}`);
            return originalPdfUrl; // 실패 시 원본 URL 유지
        }

        const { data: publicData } = supabase.storage.from("archives").getPublicUrl(fileName);
        console.log(`  ✅ PDF 영구 URL 발급: ${publicData.publicUrl}`);
        return publicData.publicUrl;

    } catch (err: any) {
        console.error(`  ❌ PDF 처리 에러: ${err.message}`);
        return originalPdfUrl;
    }
}


// ─── 4. DB Upsert ─────────────────────────────────────────────
async function upsertToDb(item: ArchiveData): Promise<boolean> {
    const { error } = await supabase
        .from("archive")                        // 앱 코드와 동일한 테이블명 (singular)
        .upsert(item, { onConflict: "original_url" }); // migration 002에서 UNIQUE 설정됨

    if (error) {
        console.error(`  ❌ DB 저장 실패 [${item.title}]: ${error.message}`);
        return false;
    }
    console.log(`  ✅ DB 저장 성공: ${item.title}`);
    return true;
}


// ─── 5. 메인 실행 ─────────────────────────────────────────────
async function runCrawler() {
    console.log("═══════════════════════════════════════════");
    console.log("🚀 fourfoldgospel.org → archive 이관 시작");
    console.log(`📌 타겟: ${BASE_URL}/main/sub.html?boardID=www40`);
    console.log(`📂 게시판: 사중복음 논문 (총 17건 / 최대 2페이지)`);
    console.log("═══════════════════════════════════════════\n");

    // 스토리지 버킷 준비 (없으면 생성, 있으면 무시)
    await supabase.storage.createBucket("archives", { public: true });

    let page = 1;
    let totalSuccess = 0;
    let totalFail = 0;
    let lastFirstNum = "";

    while (page <= 5) { // 여유롭게 5페이지까지 허용 (실제 2페이지)
        console.log(`\n── Page ${page} ${"─".repeat(37)}`);
        const postUrls = await fetchArchiveList(page);

        if (postUrls.length === 0) {
            console.log("게시물 없음. 크롤링을 종료합니다.");
            break;
        }

        // 마지막 페이지 반복 감지 (URL 중 num= 값으로 비교)
        const firstNum = (postUrls[0].match(/num=(\d+)/) ?? [])[1] ?? "";
        if (page > 1 && firstNum === lastFirstNum) {
            console.log("마지막 페이지 반복 감지 → 종료");
            break;
        }
        lastFirstNum = firstNum;

        for (const url of postUrls) {
            // URL에서 게시글 번호 추출 (스토리지 파일명용)
            const articleNum = (url.match(/num=(\d+)/) ?? [])[1] ?? "unknown";
            console.log(`\n[#${articleNum}] ${url}`);

            const archiveData = await fetchArchiveDetail(url);
            if (!archiveData) {
                totalFail++;
                continue;
            }

            // PDF 첨부가 있으면 Supabase Storage에 영구 보관
            if (archiveData.pdf_url.startsWith("http")) {
                archiveData.pdf_url = await uploadPdfToStorage(archiveData.pdf_url, articleNum);
            }

            const ok = await upsertToDb(archiveData);
            ok ? totalSuccess++ : totalFail++;

            // 서버 과부하 방지 딜레이 (0.8초)
            await new Promise(r => setTimeout(r, 800));
        }

        console.log(`\n[ Page ${page} 완료 ]`);
        page++;
        await new Promise(r => setTimeout(r, 2500)); // 페이지 전환 딜레이
    }

    console.log("\n═══════════════════════════════════════════");
    console.log(`🎉 완료!  성공: ${totalSuccess}건 | 실패: ${totalFail}건`);
    console.log("═══════════════════════════════════════════");
}

runCrawler().catch(err => {
    console.error("💥 치명적 에러:", err);
    process.exit(1);
});
