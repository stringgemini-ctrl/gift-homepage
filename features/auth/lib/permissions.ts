/**
 * 자료실(archive) 권한 유틸리티
 *
 * 역할 등급: admin > user
 * - min_role = 'user' → user, admin 모두 열람 가능
 * - min_role = 'admin' → admin만 열람 가능
 *
 * 사용 예시 (app/archive/[id]/page.tsx 등):
 * - 글 조회 후 post.min_role과 현재 유저의 profile.role을 canAccessArchive()에 전달
 * - false면 "권한이 없습니다" 메시지 또는 리다이렉트
 *
 * 글쓰기 페이지(app/write/page.tsx):
 * - admin만 작성 허용 시: profile.role === 'admin' 체크
 * - user도 작성 허용 시: 로그인 여부만 체크
 */

const ROLE_ORDER: Record<string, number> = {
  user: 1,
  admin: 2,
}

export function canAccessArchive(minRole: string, userRole: string | null): boolean {
  if (!userRole) return minRole === 'user' // 비로그인 사용자는 min_role이 'user'인 글만
  const minLevel = ROLE_ORDER[minRole] ?? 0
  const userLevel = ROLE_ORDER[userRole] ?? 0
  return userLevel >= minLevel
}

export function isAdmin(role: string | null): boolean {
  return role === 'admin'
}
