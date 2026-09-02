const SAFE_PATH = /^\/[\w\-./?=&%#]*$/

export function getSafeRedirectPath(value: string | null | undefined, fallback = '/archive') {
  if (!value || !SAFE_PATH.test(value) || value.startsWith('//')) return fallback

  try {
    const url = new URL(value, 'https://gift.local')
    if (url.origin !== 'https://gift.local') return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
