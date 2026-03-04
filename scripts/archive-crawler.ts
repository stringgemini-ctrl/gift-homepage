import axios from 'axios';
import * as cheerio from 'cheerio';

interface ArchiveData {
    title: string;
    author: string;
    category: string;
    abstract_text: string;
    content: string;
    pdf_url: string;
    original_url: string;
}

const BASE_URL = 'http://fourfoldgospel.org'; // 실제 타겟 URL로 변경 필요
const LIST_URL = `${BASE_URL}/archives`;

async function fetchArchiveList(): Promise<string[]> {
    try {
        const { data } = await axios.get(LIST_URL);
        const $ = cheerio.load(data);
        const postUrls: string[] = [];

        // 목록 페이지의 각 게시글 링크 파싱 (선택자는 실제 구조에 맞게 수정)
        $('.post-list-item a').each((_, element) => {
            const href = $(element).attr('href');
            if (href) {
                postUrls.push(href.startsWith('http') ? href : `${BASE_URL}${href}`);
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

        // 상세 페이지 파싱 (선택자는 실제 HTML 구조에 따라 수정 필요)
        const title = $('.post-title').text().trim();
        const author = $('.post-author').text().trim();
        const category = $('.post-category').text().trim();
        const abstract_text = $('.post-abstract').text().trim();
        const content = $('.post-content').html() || '';

        // PDF 다운로드 링크 파싱
        let pdf_url = '';
        const pdfHref = $('a.pdf-download').attr('href');
        if (pdfHref) {
            pdf_url = pdfHref.startsWith('http') ? pdfHref : `${BASE_URL}${pdfHref}`;
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
    console.log('크롤링을 시작합니다...');

    const postUrls = await fetchArchiveList();
    const archives: ArchiveData[] = [];

    for (const url of postUrls) {
        console.log(`데이터 추출 중: ${url}`);
        const archiveData = await fetchArchiveDetail(url);
        if (archiveData) {
            archives.push(archiveData);
            // 서버 과부하 방지를 위한 딜레이 추가
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    console.log(`크롤링 완료. 총 ${archives.length}개의 데이터를 수집했습니다.`);
    // 결과 데이터 확인 (실제 적용 시 이 부분에 DB 인서트 로직 추가)
    console.log(JSON.stringify(archives, null, 2));
}

runCrawler().catch(console.error);
