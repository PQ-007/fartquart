import type { ComponentPropsWithoutRef, ReactElement } from "react"
import styles from "./CodeSnippet.module.css"
import { CopyButton } from "./CopyButton"
import { highlight } from "@/lib/shiki"

const EXT_LANG: Record<string, string> = {
  py: "python", ts: "ts", tsx: "tsx", js: "js", jsx: "jsx",
  css: "css", html: "html", json: "json", sh: "bash", bash: "bash",
  rs: "rust", go: "go", java: "java", c: "c", cpp: "cpp", cc: "cpp",
}

const parseInfo = (info: string): { label: string; lang: string } => {
  const dot = info.lastIndexOf(".")
  if (dot !== -1) {
    const ext = info.slice(dot + 1).toLowerCase()
    return { label: info, lang: EXT_LANG[ext] ?? ext }
  }
  return { label: info, lang: info || "text" }
}

type CodeProps = { className?: string; children?: string }

export const CodeBlock = async ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => {
  const child = children as ReactElement<CodeProps> | undefined
  const className = child?.props?.className ?? ""
  const info = className.startsWith("language-") ? className.slice("language-".length) : ""
  const { label, lang } = parseInfo(info)
  const code = child?.props?.children

  if (typeof code !== "string") {
    return <pre {...props}>{children}</pre>
  }

  const html = await highlight(code.trimEnd(), lang)

  return (
    <div className={`${styles.wrapper} codeWrapper`}>
      <header className={styles.header}>
        <p>{label || lang}</p>
        <CopyButton code={code.trimEnd()} />
      </header>
      <div className={styles.codeBody} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
