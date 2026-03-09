/**
 * archive-crawler.ts
 *
 * ── 타겟 1 (www40): 사중복음 논문 게시판 — 17건 (이미 적재 완료, upsert로 안전 재실행 가능)
 *    http://www.fourfoldgospel.org/main/sub.html?boardID=www40
 *    제목 패턴: [저자] 제목
 *
 * ── 타겟 2 (www36): 사중복음 교단발행물 게시판 — 74건
 *    http://www.fourfoldgospel.org/main/sub.html?boardID=www36
 *    서브카테고리: 활천(48), 중생(8), 성결(5), 신유(7), 재림(6)
 *    제목 패턴: [서브카테고리] 제목 - 저자  (저자 없는 경우도 있음)
 *
 * 실행: npm run scrape:archive:full
 * upsert 기준: original_url UNIQUE → 기존 17건 절대 훼손 없음
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
    published_date: string | null;
    category: string;
    abstract_text: string;
    content: string;
    pdf_url: string;
    original_url: string;
}

// ─── 상수 ─────────────────────────────────────────────────────
const BASE_URL = "http://www.fourfoldgospel.org";

// 게시판 설정
interface BoardConfig {
    boardID: string;
    label: string;         // 로그용 이름
    defaultCategory: string; // category 컬럼 기본값 (서브카테고리 파싱 실패 시)
    maxPages: number;
    parseTitleFn: (rawTitle: string) => { title: string; author: string; category: string };
}

// www40: [저자] 제목 패턴
function parseTitleWww40(rawTitle: string): { title: string; author: string; category: string } {
    const m = rawTitle.match(/^\[(.+?)]\s*(.+)$/);
    if (m) return { author: m[1].trim(), title: m[2].trim(), category: "사중복음 논문" };
    return { author: "Unknown", title: rawTitle, category: "사중복음 논문" };
}

// www36: [서브카테고리] 제목 - 저자 패턴
function parseTitleWww36(rawTitle: string): { title: string; author: string; category: string } {
    let rest = rawTitle;
    let category = "사중복음 교단발행물";
    let author = "";

    // [서브카테고리] 접두어 추출
    const catMatch = rest.match(/^\[(.+?)]\s*/);
    if (catMatch) {
        category = catMatch[1].trim(); // 활천 | 중생 | 성결 | 신유 | 재림
        rest = rest.slice(catMatch[0].length);
    }

    // 제목 - 저자 분리: 마지막 " - " 기준
    const dashIdx = rest.lastIndexOf(" - ");
    if (dashIdx !== -1) {
        author = rest.slice(dashIdx + 3).trim();
        rest = rest.slice(0, dashIdx).trim();
    }

    return { title: rest.trim() || rawTitle, author, category };
}

const BOARDS: BoardConfig[] = [
    {
        boardID: "www40",
        label: "사중복음 논문",
        defaultCategory: "사중복음 논문",
        maxPages: 5,
        parseTitleFn: parseTitleWww40,
    },
    {
        boardID: "www36",
        label: "사중복음 교단발행물",
        defaultCategory: "사중복음 교단발행물",
        maxPages: 10, // 74건 / 15 = 5페이지 + 여유
        parseTitleFn: parseTitleWww36,
    },
];


// ─── 1. 목록 파싱 ─────────────────────────────────────────────
async function fetchArchiveList(boardID: string, page: number): Promise<string[]> {
    const url = `${BASE_URL}/main/sub.html?page=${page}&boardID=${boardID}&keyfield=&key=&bCate=`;
    const postUrls: string[] = [];

    try {
        const { data } = await axios.get(url, {
            timeout: 15_000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GIFT-Crawler/1.0)" },
        });
        const $ = cheerio.load(data);

        $(".mdWebzineSbj a, td a[href*='Mode=view']").each((_, el) => {
            const href = $(el).attr("href");
            if (!href) return;
            const fullUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
            if (/[?&]num=\d+/.test(fullUrl) && !postUrls.includes(fullUrl)) {
                postUrls.push(fullUrl);
            }
        });

        console.log(`  [Page ${page}] ${postUrls.length}개 발견`);
    } catch (err) {
        console.error(`  [Page ${page}] 목록 크롤링 실패:`, (err as Error).message);
    }

    return postUrls;
}


// ─── 2. 상세 페이지 파싱 ──────────────────────────────────────
async function fetchArchiveDetail(
    url: string,
    parseTitleFn: BoardConfig["parseTitleFn"]
): Promise<ArchiveData | null> {
    try {
        const { data } = await axios.get(url, {
            timeout: 15_000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GIFT-Crawler/1.0)" },
        });
        const $ = cheerio.load(data);

        // ── 제목 파싱 ──
        const rawTitle = $(".mdView_sbj").first().text().replace(/\s+/g, " ").trim();
        const { title, author, category } = parseTitleFn(rawTitle);

        // ── 등록일 파싱 ──
        let published_date: string | null = null;
        const dateText = $(".mdView_date").first().text();
        const dateMatch = dateText.match(/등록일\s*:\s*(\d{4})\.(\d{2})\.(\d{2})/);
        if (dateMatch) {
            published_date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
        }

        // ── 본문 HTML ──
        let content = $("#lightgallery").html() || $(".mdView_cont").html() || "";
        content = content.replace(/src="\/user/g, `src="${BASE_URL}/user`);

        // ── abstract_text ──
        const abstract_text = $(".mdView_cont").text().replace(/\s+/g, " ").trim().slice(0, 300);

        // ── PDF 링크 추출 ──
        let pdf_url = "";
        $(".mdView_file a").each((_, el) => {
            if (pdf_url) return;
            const linkText = $(el).text();
            const href = $(el).attr("href") || "";
            if (linkText.toLowerCase().includes(".pdf")) {
                const fileNumMatch = href.match(/fileDown\('(\d+)'\)/);
                if (fileNumMatch) {
                    pdf_url = `${BASE_URL}/core/anyboard/download.php?boardID=${url.match(/boardID=([a-z0-9]+)/i)?.[1] || ""}&fileNum=${fileNumMatch[1]}`;
                }
            }
        });

        if (!title) {
            console.warn(`  ⚠️  제목 추출 실패 (${url})`);
            return null;
        }

        return { title, author, published_date, category, abstract_text, content, pdf_url, original_url: url };

    } catch (err) {
        console.error(`  상세 파싱 실패 (${url}):`, (err as Error).message);
        return null;
    }
}


// ─── 3. PDF → Supabase Storage ────────────────────────────────
async function uploadPdfToStorage(originalPdfUrl: string, boardID: string, articleNum: string): Promise<string> {
    if (!originalPdfUrl) return "";

    try {
        console.log(`    → PDF 다운로드: ${originalPdfUrl}`);
        const response = await axios.get(originalPdfUrl, {
            responseType: "arraybuffer",
            timeout: 30_000,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; GIFT-Crawler/1.0)" },
        });
        const buffer = Buffer.from(response.data);
        const fileName = `${boardID}_${articleNum}_${crypto.randomUUID()}.pdf`;

        const { error } = await supabase.storage
            .from("archives")
            .upload(fileName, buffer, { contentType: "application/pdf", upsert: true });

        if (error) {
            console.error(`    ❌ PDF 업로드 실패: ${error.message}`);
            return originalPdfUrl;
        }

        const { data: publicData } = supabase.storage.from("archives").getPublicUrl(fileName);
        console.log(`    ✅ PDF 업로드 완료`);
        return publicData.publicUrl;

    } catch (err: any) {
        console.error(`    ❌ PDF 처리 에러: ${err.message}`);
        return originalPdfUrl;
    }
}


// ─── 4. DB Upsert ─────────────────────────────────────────────
async function upsertToDb(item: ArchiveData): Promise<boolean> {
    const { error } = await supabase
        .from("archive")
        .upsert(item, { onConflict: "original_url" }); // original_url UNIQUE 기준 — 기존 데이터 안전

    if (error) {
        console.error(`    ❌ DB 실패 [${item.title.slice(0, 30)}]: ${error.message}`);
        return false;
    }
    console.log(`    ✅ DB 저장: ${item.title.slice(0, 50)}`);
    return true;
}


// ─── 5. 게시판 크롤러 ─────────────────────────────────────────
async function crawlBoard(board: BoardConfig): Promise<{ success: number; fail: number }> {
    console.log(`\n${"═".repeat(55)}`);
    console.log(`📋 [${board.label}] boardID=${board.boardID} 크롤링 시작`);
    console.log(`${"═".repeat(55)}`);

    await supabase.storage.createBucket("archives", { public: true });

    let page = 1;
    let totalSuccess = 0;
    let totalFail = 0;
    let lastFirstNum = "";

    while (page <= board.maxPages) {
        console.log(`\n── Page ${page} ${"─".repeat(40)}`);
        const postUrls = await fetchArchiveList(board.boardID, page);

        if (postUrls.length === 0) {
            console.log("  게시물 없음. 종료.");
            break;
        }

        // 마지막 페이지 반복 감지
        const firstNum = (postUrls[0].match(/num=(\d+)/) ?? [])[1] ?? "";
        if (page > 1 && firstNum === lastFirstNum) {
            console.log("  마지막 페이지 반복 감지 → 종료");
            break;
        }
        lastFirstNum = firstNum;

        for (const url of postUrls) {
            const articleNum = (url.match(/num=(\d+)/) ?? [])[1] ?? "unknown";
            console.log(`\n  [#${articleNum}] ${url}`);

            const archiveData = await fetchArchiveDetail(url, board.parseTitleFn);
            if (!archiveData) {
                totalFail++;
                continue;
            }

            if (archiveData.pdf_url.startsWith("http")) {
                archiveData.pdf_url = await uploadPdfToStorage(archiveData.pdf_url, board.boardID, articleNum);
            }

            const ok = await upsertToDb(archiveData);
            ok ? totalSuccess++ : totalFail++;

            await new Promise(r => setTimeout(r, 800));
        }

        console.log(`\n  [ Page ${page} 완료 ]`);
        page++;
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n✅ [${board.label}] 완료 — 성공: ${totalSuccess}건 / 실패: ${totalFail}건`);
    return { success: totalSuccess, fail: totalFail };
}


// ─── 6. 메인 ──────────────────────────────────────────────────
async function runCrawler() {
    console.log("\n🚀 GIFT Archive Crawler 시작");
    console.log(`📌 타겟: www36(교단발행물 74건) + www40(논문 17건, upsert 안전)\n`);

    let grandSuccess = 0;
    let grandFail = 0;

    for (const board of BOARDS) {
        const { success, fail } = await crawlBoard(board);
        grandSuccess += success;
        grandFail += fail;
    }

    console.log(`\n${"═".repeat(55)}`);
    console.log(`🎉 전체 완료!  신규/갱신: ${grandSuccess}건 | 실패: ${grandFail}건`);
    console.log(`${"═".repeat(55)}\n`);
}

runCrawler().catch(err => {
    console.error("💥 치명적 에러:", err);
    process.exit(1);
});
