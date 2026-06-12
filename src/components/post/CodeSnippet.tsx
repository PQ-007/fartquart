import styles from "./CodeSnippet.module.css"
import { CopyButton } from "./CopyButton"
import { highlight } from "@/lib/shiki"

export const CodeSnippet = async (props: {
  title?: string
  language?: string
  code: string
  showLineNumbers?: boolean
}) => {
  const { title, language = "tsx", code, showLineNumbers = true } = props
  const html = await highlight(code, language)
  const withLineNumbers = showLineNumbers
    ? html.replace("<pre class=", '<pre data-line-numbers="true" class=')
    : html

  return (
    <div className={`${styles.wrapper} codeWrapper`}>
      <header className={styles.header}>
        <p>{title ?? language}</p>
        <CopyButton code={code} />
      </header>
      <div
        className={styles.codeBody}
        dangerouslySetInnerHTML={{ __html: withLineNumbers }}
      />
    </div>
  )
}
