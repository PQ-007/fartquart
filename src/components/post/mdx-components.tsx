import type { ComponentPropsWithoutRef, ReactNode } from "react"
import type { MDXComponents } from "mdx/types"
import { CodeBlock } from "./CodeBlock"
import { CodeSnippet } from "./CodeSnippet"
import { CloudImage } from "./CloudImage"
import { Tweet } from "./Tweet"
import { Sandpack } from "./SandpackEmbed"
import { MathBlock } from "./Math"
import { ArrowTopRight } from "../icons"
import { AnchorHeading } from "./AnchorHeading"

export const slugify = (text: string): string => {
  const slug = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
  return slug || "section"
}

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
    <AnchorHeading tag={Tag} id={slugify(textOf(children))}>{children}</AnchorHeading>
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

const Video = ({ src }: { src: string }) => (
  <video
    controls
    playsInline
    style={{ width: "100%", borderRadius: "12px", display: "block", margin: "16px 0" }}
  >
    <source src={src} type="video/mp4" />
    <source src={src} type="video/mp4; codecs=hvc1" />
  </video>
)

const YouTube = ({ id }: { id: string }) => (
  <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", marginBottom: "24px" }}>
    <iframe
      src={`https://www.youtube.com/embed/${id}`}
      title="YouTube video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", borderRadius: "12px" }}
    />
  </div>
)

export const mdxComponents: MDXComponents = {
  h2: heading("h2"),
  h3: heading("h3"),
  a: ExternalLink,
  pre: CodeBlock,
  CodeSnippet,
  CloudImage,
  Tweet,
  Sandpack,
  Math: MathBlock,
  YouTube,
  Video,
}
