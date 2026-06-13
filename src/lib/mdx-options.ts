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

/** Strip Obsidian wikilink embeds (![[...]]) that MDX can't parse */
export const sanitizeMdx = (content: string): string =>
  content
    .split("\n")
    .filter((line) => !line.trim().match(/^!\[\[.+\]\]/))
    .join("\n")
