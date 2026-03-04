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
const LIST_URL = `${BASE_URL}/main/sub.html?page=1&boardID=www40&keyfield=&key=&bCate=`;

async function fetchArchiveList(): Promise<string[]> {
    try {
        const { data } = await axios.get(LIST_URL);
        const $ = cheerio.load(data);
        const postUrls: string[] = [];

        // Extract detailed links
        $(".mdWebzineSbj a").each((_, element) => {
            const href = $(element).attr("href");
            if (href) {
                // href is like /main/sub.html?Mode=view&boardID=www40&num=922&page=1&keyfield=&key=&bCate=
                // Extract the `num=` part. The requirement said `no=숫자`, but the original link has `num=숫자`.
                // Let's support both but default to the required format `mode=view&no=` for original_url if instructed, or just use the extracted URL directly. 
                // Instructions: `sub.html?page=1&boardID=www40&mode=view&no=` 뒤에 추출한 번호를 붙여 완성
                const match = href.match(/num=(\d+)/) || href.match(/no=(\d+)/);
                if (match) {
                    const num = match[1];
                    const fullUrl = `${BASE_URL}/main/sub.html?page=1&boardID=www40&mode=view&no=${num}`;
                    if (!postUrls.includes(fullUrl)) {
                        postUrls.push(fullUrl);
                    }
                }
            }
        });

        console.log(`총 ${postUrls.length}개의 게시글 링크를 찾았습니다.`);
        return postUrls;
    } catch (error) {
        console.error(`목록 페이지 크롤링 중 에러 발생 (${LIST_URL}):`, error);
        return [];
    }
}

async function fetchArchiveDetail(url: string): Promise<ArchiveData | null> {
    try {
        // Note: To fetch the actual detail page, we need to pass `num=xxx` because their system uses `num=`. 
        // The instruction said `no=숫자`, but if their server expects `num=`, using `no=` might fail.
        // I will fetch using `num=` but store `url` (which has `no=`) as original_url as instructed.
        const fetchUrl = url.replace("&no=", "&num=").replace("mode=view", "Mode=view");

        const { data } = await axios.get(fetchUrl);
        const $ = cheerio.load(data);

        // .mdView_sbj contains the title. It might have a span with the author's name inside brackets.
        let fullTitle = $(".mdView_sbj").text().trim();
        let author = "Unknown";
        let category = "사중복음 논문"; // default based on board
        let title = fullTitle;

        // Parse [Author] from title if present
        const authorMatch = fullTitle.match(/^\[(.*?)\]\s*(.*)$/);
        if (authorMatch) {
            author = authorMatch[1].trim();
            title = authorMatch[2].trim();
        }

        // Abstract is not distinctly separated on this board, we'll leave it empty or extract first few words
        const abstract_text = "";

        // Content is usually inside #lightgallery or adjacent to .mdView_cont
        let content = $("#lightgallery").html() || $(".mdView_cont").html() || "";
        // Clean up relative image paths in content
        content = content.replace(/src="\/user/g, `src="${BASE_URL}/user`);

        // Extract PDF / file downloads
        let pdf_url = "";
        const pdfAnchor = $("a:contains('.pdf')");
        if (pdfAnchor.length > 0) {
            const href = pdfAnchor.attr("href");
            // it looks like javascript:anyboard.fileDown('1966');
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
            original_url: url, // Store the instructed format
        };
    } catch (error) {
        console.error(`상세 페이지 크롤링 중 에러 발생 (${url}):`, error);
        return null;
    }
}

async function runCrawler() {
    console.log("크롤링을 시작합니다...");

    const postUrls = await fetchArchiveList();
    let successCount = 0;
    let failCount = 0;

    for (const url of postUrls) {
        console.log(`데이터 추출 중: ${url}`);
        const archiveData = await fetchArchiveDetail(url);

        if (archiveData) {
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
            } else {
                console.log(`✅ DB 저장 성공: ${archiveData.title}`);
                successCount++;
            }

            await new Promise((resolve) => setTimeout(resolve, 500));
        } else {
            failCount++;
        }
    }

    console.log("----------------------------------------");
    console.log(`크롤링 및 DB 삽입 완료.`);
    console.log(`성공: ${successCount}건 | 실패: ${failCount}건`);
}

runCrawler().catch((error) => {
    console.error("크롤러 실행 중 치명적 에러 발생:", error);
});
