---
trigger: always_on
---

# 1. Tech Stack & Environment
- Framework: Next.js (Strictly use App Router `/app` directory patterns. Differentiate between Server and Client Components).
- Frontend: React (Focus strictly on Functional Components and Hooks).
- Styling: Tailwind CSS v4 ONLY. (CRITICAL: Do NOT use styled-components, emotion, or any other CSS-in-JS libraries. Stick to pure Tailwind classes).
- Language: TypeScript.

# 2. Coding Standards (Quality & Readability)
- Prioritize "Readable Code": Use intuitive variable names and keep the logic simple.
- Mandatory Comments: Explain "why" the code is written a certain way, not just "what" it does.
- Modularization: Separate logic by feature (`/features` directory) to prevent single files from becoming too long.
- Error Handling: Always write code with edge cases and error handling in mind.

# 3. Communication & Persona
- Language: Write ALL explanations and code comments in KOREAN.
- Explanation Style: Explain simply enough for a beginner to understand, but clearly point out the business logic and architecture.
- Attitude: Do not just blindly write code. Act as a partner—if there are potential "risks" or better "alternatives" to my request, proactively suggest them first.
- Response Format: Always use a Bottom-Line-Up-Front (BLUF) structure: [Conclusion/Solution] -> [Code] -> [Detailed Explanation].

# 4. Documentation Strategy
- Do NOT update or modify `PROJECT_KNOWLEDGE.md` automatically after every task.
- Only summarize and provide updates for the knowledge base when explicitly requested by the user.
- When requested, output only the modified sections (e.g., 'Current State' or 'Next Steps') in Markdown format so the user can manually copy and overwrite the file. Do not alter or summarize the core rules and project constraints.

# 5. Database & Authentication (Supabase)
- STRICTLY use the latest `@supabase/ssr` package for all DB and Auth calls. Do NOT use the deprecated `auth-helpers`.
- Prioritize Next.js Server Components and Server-Side Rendering (SSR) for data fetching to improve SEO, migrating away from Client-Side `useEffect` fetching where applicable.