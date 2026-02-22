# 🧠 PROJECT KNOWLEDGE BASE (For AI Agents)

> **ROLE:** You are an AI Agent assisting in the development of the "GIFT (Global Institute for the Fourfold-gospel Theology)" web platform.
> **OBJECTIVE:** Use this document to quickly understand the project architecture, tech stack, database schema, and current state *before* writing or modifying any code.

---

## 1. Project Architecture (Lite DDD + Next.js App Router)

The project utilizes Next.js App Router (`/app`) and a Domain-Driven Design (Lite DDD) pattern for feature encapsulation (`/features`).

### Directory Structure Map
- **`/app`**: Routing layer. Contains pages, layouts, and global CSS. Complex business logic should NOT reside here.
  - `/(main)`: Homepage / Landing
  - `/archive`, `/write`, `/edit/[id]`: Board/Data views
  - `/login`, `/signup`, `/mypage`: Authentication views
  - `/admin`, `/admin/users`: Admin views
  - `/about`, `/legal`: Static informational pages
  
- **`/features`**: Domain logic layer. Core business logic, domain-specific UI components, and utilities.
  - **`auth/`**: Authentication & Authorization
    - `components/NavAuth.tsx`: Login/Logout UI state.
    - `lib/permissions.ts`: Role-based access control (`user` vs `admin`).
  - **`core/`**: Global UI Shell & Shared logic
    - `components/Header.tsx`, `Navbar.tsx`: Global navigation elements.
  - **`database/`**: Data Persistence
    - `lib/supabase.ts`: Supabase client initialization.

**Architecture Rule:** `app/` routes should import logic and standard UI components from `features/`. Cross-feature imports should be minimized.

---

## 2. Tech Stack & Integrations

- **Framework:** Next.js 16.1.6 (App Router)
- **UI & Styling:** React 19.2.3, Tailwind CSS v4
- **Backend/DB/Auth (BaaS):** Supabase
- **Language:** TypeScript 5.x
- **Data Fetching Pattern:** Client-Side Rendering (CSR) fetching pattern. Data is fetched directly from components using `@supabase/supabase-js` v2.97.0 inside `useEffect`. No server-side API routes (`/api`) or Server Actions are currently implemented for DB calls.

---

## 3. Database Schema (Supabase)

### Table: `archive` (Board / Materials)
- `id` (UUID, PK)
- `title` (Text)
- `content` (Text)
- `category` (Text)
- `subtitle` (Text - optional)
- `created_at` (Timestamp)
- `user_id` (UUID, FK to Auth)
- `author` (Text)

### Table: `Activity` (Gallery / Events)
- `id` (UUID, PK)
- `title` (Text)
- `image_url` (Text)
- `created_at` (Timestamp)

### Table: `comments` (User Interactions)
- `user_id` (UUID, FK to Auth)
- *(Note: Currently only used for COUNT aggregation in User MyPage. Complete CRUD schema not implemented in code.)*

### Storage Buckets
- `activity-images`: Stores images uploaded via Admin dashboard for `Activity` gallery cards.

---

## 4. Current State & Business Logic

### Auth Flow
- Registration & Login handled directly via `supabase.auth.signUp`/`signInWithPassword` in `/app/signup` and `/app/login`.
- Session state is currently observed via `supabase.auth.onAuthStateChange` locally inside individual components (`Header.tsx`, `NavAuth.tsx`).
- Roles (`admin`, `user`) dictate read/write capabilities (logic located in `features/auth/lib/permissions.ts`).

### Board / Data Flow (`archive`)
- **Read:** Unauthenticated users can read basic lists.
- **Write:** Requires Auth (`user_id` tracking). Users write data which inserts into the `archive` table.
- **Edit:** Needs ownership validation before updating table rows.

---

## 5. Known Issues & Next Steps (Action Items)

When instructed to refactor or build new features, prioritize addressing or being mindful of the following:

1. **Missing Routes (404 Risk):** 
   - `/contact` is linked in global Navigations (`Header`, `Navbar`, `Layout`) but `app/contact/page.tsx` does NOT exist.
   
2. **Auth State Fragmentation:** 
   - Multiple components (`Header.tsx`, `NavAuth.tsx`) independently subscribe to Supabase Auth state changes.
   - **Recommended Action:** Centralize via React Context API or Zustand to avoid redundant event listeners and UI flashing during load.
   
3. **Incomplete Comment Feature:** 
   - `/mypage` logic attempts to aggregate comment counts, but the exact table structure (`comments`) and actual UI components for full CRUD operations do not exist in the repository.
   
4. **Admin Route Security (High Priority):** 
   - Admin routes (`/admin`, `/admin/users`) currently lack strict Next.js Middleware route protection. It relies on client-side state hiding. Needs a robust `middleware.ts` for secure token validation.

---
**End of Knowledge Base.**
