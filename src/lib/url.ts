// Shared helpers for normalizing frontmatter cover paths.
// Frontmatter covers are either absolute URLs or vault-relative
// paths like "resources/images/foo.jpg" served by /resources/[...path].

export const coverUrl = (cover: string): string =>
  cover.startsWith("http") ? cover : `/${cover}`

export const isGif = (url: string): boolean => url.toLowerCase().endsWith(".gif")

// Labels whose posts live under /notes instead of /blog.
export const NOTE_LABELS = ["lesson-note", "book-note"] as const

/** The on-site path for a post, routed by label. */
export const postPath = (slug: string, label: string): string =>
  (NOTE_LABELS as readonly string[]).includes(label)
    ? `/notes/${encodeURIComponent(slug)}`
    : `/blog/${encodeURIComponent(slug)}`
