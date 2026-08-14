import type { ComponentPropsWithoutRef, ReactElement } from "react"
import styles from "./CodeSnippet.module.css"
import { CopyButton } from "./CopyButton"
import { highlight } from "@/lib/shiki"

const EXT_LANG: Record<string, string> = {
  py: "python", ts: "ts", tsx: "tsx", js: "js", jsx: "jsx",
  css: "css", html: "html", json: "json", sh: "bash", bash: "bash",
  rs: "rust", go: "go", java: "java", c: "c", cpp: "cpp", cc: "cpp",
}

// A fence info string is either a filename (`train.py`) or a bare language
// (`python`). Only filenames — anything with an extension — get a header label;
// a bare language just drives the syntax highlighting and shows no label.
const parseInfo = (info: string): { label: string | null; lang: string } => {
  const dot = info.lastIndexOf(".")
  if (dot !== -1) {
    const ext = info.slice(dot + 1).toLowerCase()
    return { label: info, lang: EXT_LANG[ext] ?? ext }
  }
  return { label: null, lang: info || "text" }
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

  // A bare language (no filename) has nothing to put in a header, so skip the
  // header bar entirely rather than leaving an empty strip — the copy button
  // floats over the code instead.
  return (
    <div className={`${styles.wrapper} codeWrapper`}>
      {label ? (
        <header className={styles.header}>
          <p>{label}</p>
          <CopyButton code={code.trimEnd()} />
        </header>
      ) : (
        <CopyButton code={code.trimEnd()} className={styles.floatingCopy} />
      )}
      <div className={styles.codeBody} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
