import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

interface ArchiveData {
    title: string;
    author: string;
    category: string;
    abstract_text: string;
    content: string;
    pdf_url: string;
    original_url: string;
}

const BASE_URL = "http://www.fourfoldgospel.org";
const getListUrl = (page: number) =>
    `${BASE_URL}/main/sub.html?page=${page}&boardID=www40&keyfield=&key=&bCate=`;

async function fetchArchiveList(page: number): Promise<string[]> {
    const url = getListUrl(page);
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const postUrls: string[] = [];

        $(".mdWebzineSbj a").each((_, element) => {
            const href = $(element).attr("href");
            if (href) {
                const match = href.match(/num=(\d+)/) || href.match(/no=(\d+)/);
                if (match) {
                    const num = match[1];
                    const fullUrl = `${BASE_URL}/main/sub.html?page=${page}&boardID=www40&mode=view&no=${num}`;
                    if (!postUrls.includes(fullUrl)) {
                        postUrls.push(fullUrl);
                    }
                }
            }
        });

        console.log(`[Page ${page}] 총 ${postUrls.length}개의 게시글 링크를 찾았습니다.`);
        return postUrls;
    } catch (error) {
        console.error(`[Page ${page}] 목록 페이지 크롤링 중 에러 발생:`, error);
        return [];
    }
}

async function fetchArchiveDetail(url: string): Promise<ArchiveData | null> {
    try {
        const fetchUrl = url.replace("&no=", "&num=").replace("mode=view", "Mode=view");
        const { data } = await axios.get(fetchUrl);
        const $ = cheerio.load(data);

        let fullTitle = $(".mdView_sbj").text().trim();
        let author = "Unknown";
        let category = "사중복음 논문";
        let title = fullTitle;

        const authorMatch = fullTitle.match(/^\[(.*?)\]\s*(.*)$/);
        if (authorMatch) {
            author = authorMatch[1].trim();
            title = authorMatch[2].trim();
        }

        const abstract_text = "";
        let content = $("#lightgallery").html() || $(".mdView_cont").html() || "";
        content = content.replace(/src="\/user/g, `src="${BASE_URL}/user`);

        // PDF 다운로드 링크 추출 (anyboard.fileDown 방식)
        let pdf_url = "";
        const pdfAnchor = $("a:contains('.pdf')");
        if (pdfAnchor.length > 0) {
            const href = pdfAnchor.attr("href");
            const fileNumMatch = href?.match(/fileDown\('(\d+)'\)/);
            if (fileNumMatch) {
                // 실제 다운로드 엔드포인트: /core/anyboard/download.php
                pdf_url = `${BASE_URL}/core/anyboard/download.php?boardID=www40&fileNum=${fileNumMatch[1]}`;
            }
        }

        return { title, author, category, abstract_text, content, pdf_url, original_url: url };
    } catch (error) {
        console.error(`상세 페이지 크롤링 중 에러 발생 (${url}):`, error);
        return null;
    }
}

async function uploadPdfToStorage(originalPdfUrl: string, archiveId: string): Promise<string> {
    if (!originalPdfUrl) return "";
    try {
        console.log(`  -> 원본 PDF 다운로드 중: ${originalPdfUrl}`);
        const response = await axios.get(originalPdfUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data);
        const fileName = `${archiveId}-${crypto.randomUUID()}.pdf`;

        console.log(`  -> Supabase Storage 업로드 중: ${fileName}`);
        // ─── [핵심 수정] contentType을 반드시 'application/pdf'로 명시 ───
        const { error } = await supabase.storage
            .from("archives")
            .upload(fileName, buffer, {
                contentType: "application/pdf",  // Google Docs Viewer 정상 렌더링에 필수
                upsert: true,
            });

        if (error) {
            console.error(`  ❌ PDF 업로드 실패:`, error.message);
            return originalPdfUrl;
        }

        const { data: publicData } = supabase.storage.from("archives").getPublicUrl(fileName);
        console.log(`  ✅ 영구 URL 발급: ${publicData.publicUrl}`);
        return publicData.publicUrl;
    } catch (error: any) {
        console.error(`  ❌ PDF 다운로드/업로드 중 에러:`, error.message);
        return originalPdfUrl;
    }
}

async function runCrawler() {
    console.log("전체 페이지 크롤링을 시작합니다...\n");

    // 버킷 없을 경우 자동 생성 (이미 있으면 무시)
    await supabase.storage.createBucket("archives", { public: true });

    let currentPage = 1;
    let totalSuccess = 0;
    let totalFail = 0;
    let lastFirstPostNum = "";

    while (true) {
        console.log(`--- [ ${currentPage} 페이지 처리 시작 ] ---`);
        const postUrls = await fetchArchiveList(currentPage);

        if (postUrls.length === 0) {
            console.log("게시물 없음. 종료합니다.");
            break;
        }

        const currentFirstPostNum = postUrls[0].match(/no=(\d+)/)?.[1] ?? "";
        if (currentPage > 1 && currentFirstPostNum === lastFirstPostNum) {
            console.log("마지막 페이지 반복 감지. 루프를 종료합니다.");
            break;
        }
        lastFirstPostNum = currentFirstPostNum;

        for (const url of postUrls) {
            console.log(`\n데이터 추출 중: ${url}`);
            const archiveData = await fetchArchiveDetail(url);
            if (!archiveData) {
                totalFail++;
                continue;
            }

            let finalPdfUrl = archiveData.pdf_url;
            if (finalPdfUrl.startsWith("http")) {
                const articleId = url.match(/no=(\d+)/)?.[1] ?? "unknown";
                finalPdfUrl = await uploadPdfToStorage(finalPdfUrl, articleId);
            }

            // ─── [핵심 수정] onConflict: 'title' 기준으로 중복 방지 Upsert ───
            const { error: dbError } = await supabase
                .from("archives")
                .upsert(
                    {
                        title: archiveData.title,
                        author: archiveData.author,
                        category: archiveData.category,
                        abstract_text: archiveData.abstract_text,
                        content: archiveData.content,
                        pdf_url: finalPdfUrl,
                        original_url: archiveData.original_url,
                    },
                    { onConflict: "title" }  // title 기준으로 중복 시 업데이트
                );

            if (dbError) {
                console.error(`❌ DB Upsert 실패 (${archiveData.title}):`, dbError.message);
                totalFail++;
            } else {
                console.log(`✅ DB 저장 성공: ${archiveData.title}`);
                totalSuccess++;
            }

            await new Promise((r) => setTimeout(r, 800));
        }

        console.log(`\n[ ${currentPage} 페이지 완료 ]`);
        await new Promise((r) => setTimeout(r, 2500));
        currentPage++;
    }

    console.log("\n========================================");
    console.log(`전체 완료! 총 성공: ${totalSuccess}건 | 총 실패: ${totalFail}건`);
}

runCrawler().catch((error) => {
    console.error("치명적 에러:", error);
});
