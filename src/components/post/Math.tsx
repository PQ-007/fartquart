import katex from "katex"
import "katex/dist/katex.min.css"
import styles from "./Math.module.css"

export const MathBlock = ({
  math,
  block = false,
}: {
  math: string
  block?: boolean
}) => {
  const html = katex.renderToString(math, {
    displayMode: block,
    throwOnError: false,
  })
  return (
    <span
      className={block ? styles.block : styles.inline}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
