// Single source of truth for site-wide identity and URL helpers.

export const SITE_URL = "https://bilguun.me"
export const SITE_NAME = "Bilguun"
export const SITE_DESC = "A room for my thoughts, creations, and curiosities."

export const AUTHOR = {
  name: "Bilguuntushig",
  url: SITE_URL,
}

/** Resolve a path or already-absolute URL to an absolute URL on this site. */
export const absoluteUrl = (path: string): string =>
  path.startsWith("http")
    ? path
    : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`

/** Branded fallback social-share image (served by app/og/route.tsx). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og`
