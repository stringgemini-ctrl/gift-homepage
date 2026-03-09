/**
 * clean_archive_data.ts
 * archive 테이블의 abstract_text / content에서 첨부파일 관련 쓰레기 텍스트를 제거한다.
 *
 * 실행: tsx scripts/clean_archive_data.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ 환경 변수 누락");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
});

// ─── 정제 규칙 목록 ──────────────────────────────────────────
// 순서대로 적용 (앞선 패턴 제거 후 다음 패턴을 처리)
const CLEAN_PATTERNS: RegExp[] = [
    // [ 첨부파일 일괄 다운로드 ] 형태 (대괄호 포함)
    /\[\s*첨부파일\s*일괄\s*다운로드\s*\]/gi,
    // [첨부파일 N개 ↓] 또는 [첨부파일 2개 이미지]
    /\[\s*첨부파일\s*\d+\s*개[^\]]*\]/gi,
    // 첨부파일 N개 (대괄호 없이)
    /첨부파일\s*\d+\s*개[^\n]*/gi,
    // [ 첨부파일 일괄 다운로드 ] 플레인 텍스트 형태
    /첨부파일\s*일괄\s*다운로드[^\n]*/gi,
    // 파일명 패턴: 한글/영문 + 확장자 (.pdf .hwp .docx .xlsx .pptx .jpg .png 등)
    /[\w가-힣()（）\s\-_.,·]+\.(pdf|hwp|docx|doc|xlsx|xls|pptx|ppt|jpg|jpeg|png|gif|zip)\b/gi,
    // SNS 내보내기 텍스트
    /SNS내보내기[^\n]*/gi,
    // "미리보기 숫자.확장자" 형태
    /미리보기\s*\d+\.\w+/gi,
    // 빈 대괄호 쌍
    /\[\s*\]/g,
    // 연속 공백/개행 정리 (2개 이상 → 1개)
];

function cleanText(text: string | null): string {
    if (!text) return "";
    let result = text;
    for (const pattern of CLEAN_PATTERNS) {
        result = result.replace(pattern, " ");
    }
    // 연속 공백·개행 → 단일 공백, 앞뒤 trim
    result = result.replace(/\s{2,}/g, " ").trim();
    return result;
}

async function run() {
    console.log("🧹 archive 데이터 정제 시작\n");

    // 전체 데이터 조회
    const { data: rows, error: fetchErr } = await supabase
        .from("archive")
        .select("id, title, abstract_text, content");

    if (fetchErr) {
        console.error("❌ 조회 실패:", fetchErr.message);
        process.exit(1);
    }

    console.log(`총 ${rows?.length ?? 0}건 처리 예정\n`);

    let success = 0;
    let skipped = 0;
    let failed = 0;

    for (const row of rows ?? []) {
        const cleanedAbstract = cleanText(row.abstract_text);
        const cleanedContent  = cleanText(row.content);

        // 변경 없으면 스킵
        if (cleanedAbstract === (row.abstract_text ?? "") && cleanedContent === (row.content ?? "")) {
            skipped++;
            continue;
        }

        const { error: updateErr } = await supabase
            .from("archive")
            .update({
                abstract_text: cleanedAbstract || null,
                content: cleanedContent || null,
            })
            .eq("id", row.id);

        if (updateErr) {
            console.error(`  ❌ [${row.title?.slice(0, 30)}] 업데이트 실패: ${updateErr.message}`);
            failed++;
        } else {
            console.log(`  ✅ [${row.title?.slice(0, 40)}]`);
            success++;
        }
    }

    console.log(`\n${"═".repeat(50)}`);
    console.log(`🎉 정제 완료 — 수정: ${success}건 | 변경없음: ${skipped}건 | 실패: ${failed}건`);
    console.log(`${"═".repeat(50)}\n`);
}

run().catch(err => {
    console.error("💥 치명적 에러:", err);
    process.exit(1);
});
