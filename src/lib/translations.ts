import { defaultLocale } from "./i18n"
import type { BlogMeta } from "./content"

// Pure, fs-free helpers (safe to import from client components).

const groupKey = (p: BlogMeta): string => p.translationKey ?? `__self:${p.slug}`

/** Choose the best variant of a translation group for the active locale. */
export const pickVariant = (variants: BlogMeta[], locale: string): BlogMeta =>
  variants.find((v) => v.lang === locale) ?? // exact match
  variants.find((v) => !v.lang) ?? // untagged = original
  variants.find((v) => v.lang === defaultLocale) ?? // site default
  variants[0]

/** Swap a single post for the variant of its translation group matching `locale`. */
export const localizePost = (
  post: BlogMeta,
  all: BlogMeta[],
  locale: string,
): BlogMeta => {
  if (!post.translationKey) return post
  const variants = all.filter((p) => p.translationKey === post.translationKey)
  return variants.length > 1 ? pickVariant(variants, locale) : post
}

/**
 * Collapse translation groups to one post each, choosing the variant that best
 * matches `locale`. Posts without a translationKey pass through unchanged.
 * Original ordering is preserved by first occurrence.
 */
export const collapseTranslations = (posts: BlogMeta[], locale: string): BlogMeta[] => {
  const groups = new Map<string, BlogMeta[]>()
  for (const p of posts) {
    const key = groupKey(p)
    const list = groups.get(key)
    if (list) list.push(p)
    else groups.set(key, [p])
  }

  const seen = new Set<string>()
  const out: BlogMeta[] = []
  for (const p of posts) {
    const key = groupKey(p)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(pickVariant(groups.get(key)!, locale))
  }
  return out
}
