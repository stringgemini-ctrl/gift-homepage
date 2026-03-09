/**
 * update_hwolcheon_category.ts
 * archive 테이블에서 category = '활천' → '활천 기고문' 일괄 업데이트
 *
 * 실행: npx tsx scripts/update_hwolcheon_category.ts
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

async function run() {
    console.log("🔄 category '활천' → '활천 기고문' 업데이트 시작\n");

    try {
        // 대상 건수 먼저 확인
        const { count, error: countErr } = await supabase
            .from("archive")
            .select("id", { count: "exact", head: true })
            .eq("category", "활천");

        if (countErr) throw countErr;
        console.log(`  대상 레코드: ${count ?? 0}건`);

        if (!count) {
            console.log("  업데이트할 데이터가 없습니다.");
            return;
        }

        // 일괄 업데이트
        const { error: updateErr } = await supabase
            .from("archive")
            .update({ category: "활천 기고문" })
            .eq("category", "활천");

        if (updateErr) throw updateErr;

        console.log(`\n✅ 총 ${count}건의 문패가 '활천 기고문'으로 교체되었습니다.`);
    } catch (err) {
        console.error("❌ 업데이트 실패:", (err as Error).message);
        process.exit(1);
    }
}

run();
