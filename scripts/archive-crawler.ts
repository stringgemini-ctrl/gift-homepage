import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";

// Supabase 환경 변수 설정
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase 환경 변수가 설정되지 않았습니다.");
    process.exit(1);
}

// Server-side 전용 Admin 권한 클라이언트 생성
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false,
    },
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

const BASE_URL = "http://fourfoldgospel.org"; // 실제 타겟 사이트로 치환할 것
const LIST_URL = `${BASE_URL}/archives`;

async function fetchArchiveList(): Promise<string[]> {
    try {
        const { data } = await axios.get(LIST_URL);
        const $ = cheerio.load(data);
        const postUrls: string[] = [];

        // 목록 페이지의 각 게시글 링크 파싱 (타겟 DOM 구조에 맞게 수정 필요)
        $(".post-list-item a").each((_, element) => {
            const href = $(element).attr("href");
            if (href) {
                postUrls.push(href.startsWith("http") ? href : `${BASE_URL}${href}`);
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
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // 상세 페이지 파싱 (타겟 DOM 구조에 맞게 수정 필요)
        const title = $(".post-title").text().trim();
        const author = $(".post-author").text().trim();
        const category = $(".post-category").text().trim();
        const abstract_text = $(".post-abstract").text().trim();
        const content = $(".post-content").html() || "";

        // PDF 다운로드 링크 파싱
        let pdf_url = "";
        const pdfHref = $("a.pdf-download").attr("href");
        if (pdfHref) {
            pdf_url = pdfHref.startsWith("http") ? pdfHref : `${BASE_URL}${pdfHref}`;
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
    console.log("크롤링을 시작합니다...");

    const postUrls = await fetchArchiveList();
    let successCount = 0;
    let failCount = 0;

    for (const url of postUrls) {
        console.log(`데이터 추출 중: ${url}`);
        const archiveData = await fetchArchiveDetail(url);

        if (archiveData) {
            // original_url 기준으로 중복 처리를 위해 upsert 활용 (또는 DB 유니크 제약 이용 가능)
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

            // 대상 서버 과부하 방지 딜레이
            await new Promise((resolve) => setTimeout(resolve, 1000));
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
