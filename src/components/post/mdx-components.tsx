import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { MDXComponents } from "mdx/types"
import { CodeSnippet } from "./CodeSnippet"
import { CloudImage } from "./CloudImage"
import { Tweet } from "./Tweet"
import { Sandpack } from "./SandpackEmbed"
import { MathBlock } from "./Math"
import { ArrowTopRight } from "../icons"

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")

const textOf = (node: ReactNode): string => {
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: ReactNode }).children)
  }
  return ""
}

const heading =
  (Tag: "h2" | "h3") =>
  ({ children }: { children?: ReactNode }) => (
    <Tag id={slugify(textOf(children))}>{children}</Tag>
  )

const ExternalLink = ({
  href,
  children,
  ...props
}: ComponentPropsWithoutRef<"a">) => (
  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
    <ArrowTopRight />
  </a>
)

export const mdxComponents: MDXComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  a: ExternalLink,
  CodeSnippet,
  CloudImage,
  Tweet,
  Sandpack,
  Math: MathBlock,
}
