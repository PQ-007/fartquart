import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import type { MDXRemoteProps } from "next-mdx-remote/rsc"
import { resolveResourceUrl } from "./resources"

export const mdxOptions: MDXRemoteProps["options"] = {
  blockJS: false,
  blockDangerousJS: false,
  mdxOptions: {
    useDynamicImport: true,
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
}

/**
 * Markdown footnotes → hover popovers.
 *
 * Collects `[^id]: explanation` definition lines, removes them, and rewrites
 * each inline `[^id]` reference into `<Footnote id="id">explanation</Footnote>`.
 * The explanation is left as MDX so inline math/markdown inside it still renders.
 */
const processFootnotes = (content: string): string => {
  const defs = new Map<string, string>()
  const defRe = /^\[\^([^\]]+)\]:\s?(.*)$/
  const kept: string[] = []

  for (const line of content.split("\n")) {
    const m = defRe.exec(line)
    if (m) {
      defs.set(m[1], m[2].trim())
      continue
    }
    kept.push(line)
  }

  if (defs.size === 0) return content

  return kept
    .join("\n")
    .replace(/\[\^([^\]]+)\]/g, (full, id: string) => {
      const text = defs.get(id)
      return text ? `<Footnote id="${id}">${text}</Footnote>` : full
    })
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i

/**
 * Render Obsidian embeds (`![[file.png]]`, `![[clip.mp4]]`, `![[img.png|alt]]`).
 * Resolves the target to a /resources URL and rewrites it to a Markdown image
 * or <Video> component. A numeric alias is an Obsidian size hint, not alt text.
 * Unresolved embeds are dropped so they don't leave raw `![[...]]` for MDX.
 */
const processEmbeds = (content: string): string =>
  content.replace(/!\[\[([^\]]+)\]\]/g, (full, inner: string) => {
    const [rawTarget, rawAlias] = inner.split("|")
    const target = rawTarget.trim()
    const url = resolveResourceUrl(target)
    if (!url) return ""

    if (VIDEO_EXT.test(target)) return `<Video src="${url}" />`

    const base = target.split("/").pop() ?? target
    const alias = rawAlias?.trim()
    const alt = alias && !/^\d/.test(alias) ? alias : base.replace(/\.[^.]+$/, "")
    return `![${alt}](${url})`
  })

/** Normalize Obsidian-flavored Markdown (embeds, footnotes) for the MDX pipeline. */
export const sanitizeMdx = (content: string): string =>
  processFootnotes(processEmbeds(content))
