import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

// Supabase Environment Variables
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

        // Extract detailed links
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

        let pdf_url = "";
        const pdfAnchor = $("a:contains('.pdf')");
        if (pdfAnchor.length > 0) {
            const href = pdfAnchor.attr("href");
            const fileNumMatch = href?.match(/fileDown\('(\d+)'\)/);
            if (fileNumMatch) {
                pdf_url = `${BASE_URL}/core/anyboard/boardAct/fileDown.php?boardID=www40&fileNum=${fileNumMatch[1]}`;
            }
        }

        return {
            title,
            author,
            category,
            abstract_text,
            content,
            pdf_url,
            original_url: url,
        };
    } catch (error) {
        console.error(`상세 페이지 크롤링 중 에러 발생 (${url}):`, error);
        return null;
    }
}

async function runCrawler() {
    console.log("전체 페이지 크롤링을 시작합니다...");

    let currentPage = 1;
    let totalSuccessCount = 0;
    let totalFailCount = 0;

    // 무한 루프 방지를 위해 이미 방문한 가장 최근의 첫 번째 게시물 번호를 기억
    let lastFirstPostNum = "";

    while (true) {
        console.log(`\n--- [ ${currentPage} 페이지 처리 시작 ] ---`);
        const postUrls = await fetchArchiveList(currentPage);

        // 종료 조건 1: 추출된 링크가 0개
        if (postUrls.length === 0) {
            console.log(`게시물이 더 이상 존재하지 않으므로 크롤링을 종료합니다.`);
            break;
        }

        // 종료 조건 2: 파라미터를 초과하여 동일한 첫 번째 게시물이 계속 나타날 경우 (게시판 솔루션 특성상 1페이지로 리다이렉트되거나 마지막 페이지가 반복될 때)
        const firstPostMatch = postUrls[0].match(/no=(\d+)/);
        const currentFirstPostNum = firstPostMatch ? firstPostMatch[1] : "";
        if (currentPage > 1 && currentFirstPostNum === lastFirstPostNum) {
            console.log(`마지막 페이지에 도달하여 이전 페이지의 내용이 반복되고 있습니다. 크롤링 루프를 종료합니다.`);
            break;
        }
        lastFirstPostNum = currentFirstPostNum;

        let successCount = 0;
        let failCount = 0;

        for (const url of postUrls) {
            console.log(`데이터 추출 중: ${url}`);
            const archiveData = await fetchArchiveDetail(url);

            if (archiveData) {
                // 이미 DB에 있는지 upsert를 시도
                const { error } = await supabase
                    .from("archives")
                    .upsert(
                        {
                            title: archiveData.title,
                            author: archiveData.author,
                            category: archiveData.category,
                            abstract_text: archiveData.abstract_text,
                            content: archiveData.content,
                            pdf_url: archiveData.pdf_url,
                            original_url: archiveData.original_url,
                        },
                        { onConflict: "original_url" }
                    );

                if (error) {
                    console.error(`❌ DB Insert/Upsert 실패 (${url}):`, error.message);
                    failCount++;
                    totalFailCount++;
                } else {
                    console.log(`✅ DB 저장 성공: ${archiveData.title}`);
                    successCount++;
                    totalSuccessCount++;
                }

                // 서버 과부하 방지를 위해 1개 항목 처리 당 0.5초 대기
                await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
                failCount++;
                totalFailCount++;
            }
        }

        console.log(`[ ${currentPage} 페이지 완료 ] 성공: ${successCount}건 | 실패: ${failCount}건`);

        // 다음 페이지로 이동 전 2~3초 딜레이
        console.log("다음 페이지로 이동 전 대기 중...");
        await new Promise((resolve) => setTimeout(resolve, 2500));

        currentPage++;
    }

    console.log("\n========================================");
    console.log(`전체 크롤링 및 DB 삽입 최종 완료!`);
    console.log(`총 성공: ${totalSuccessCount}건 | 총 실패: ${totalFailCount}건`);
}

runCrawler().catch((error) => {
    console.error("크롤러 실행 중 치명적 에러 발생:", error);
});
