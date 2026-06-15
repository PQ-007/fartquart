import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import type { MDXRemoteProps } from "next-mdx-remote/rsc"

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

/** Strip Obsidian wikilink embeds (![[...]]) that MDX can't parse */
export const sanitizeMdx = (content: string): string =>
  processFootnotes(
    content
      .split("\n")
      .filter((line) => !line.trim().match(/^!\[\[.+\]\]/))
      .join("\n"),
  )
