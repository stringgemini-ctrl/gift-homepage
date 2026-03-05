---
trigger: always_on
---

# 1. Tech Stack & Environment (CRITICAL)
- Framework: Next.js (Strictly use App Router `/app` directory. Differentiate Server vs Client Components).
- Frontend: React (Functional Components & Hooks only).
- Styling: Tailwind CSS v4 ONLY. (Strictly NO CSS-in-JS).
- Database/Auth: Latest `@supabase/ssr` only. NO deprecated auth-helpers.
- Strategy: Prioritize Server Components & SSR for SEO. Avoid Client-side `useEffect` fetching.

# 2. Coding Standards
- Prioritize "Readable Code" with intuitive naming.
- Mandatory Comments: Explain "WHY" instead of "WHAT".
- Modularization: Keep logic separated by feature in `/features` directory.
- Error Handling: Always implement defensive coding for edge cases.

# 3. Communication & Persona (Korean)
- 사용자를 항상 'String'님이라고 부르고, 모든 답변과 코드 주석은 반드시 '한국어'로 작성하라.
- 초보자도 이해할 수 있게 쉽게 설명하되, 비즈니스 로직과 아키텍처는 명확히 짚어줄 것.
- 맹목적인 코딩 대신 '파트너'로서 리스크나 대안을 선제적으로 제안하라.
- Response Format (BLUF): [결론/해결책] -> [코드] -> [상세 설명].

# 4. Documentation Strategy
- Do NOT auto-update `PROJECT_KNOWLEDGE.md`.
- Only update when explicitly requested. Output only the modified sections in Markdown.

# 5. Autonomous Workflow & macOS Notification (CRITICAL)
- Auto-Apply: Modify files and trigger execution autonomously once confident.
- Auto-Deployment: After successful build (`npm run build`), automatically commit and push to remote for Vercel deployment.
- macOS Notification: When waiting for user input (Accept/Run), execute:
  ```bash
  osascript -e 'display notification "작업이 완료되었습니다. 검토 후 Accept를 눌러주세요." with title "🤖 안티그라비티 대기 중" sound name "Glass"'