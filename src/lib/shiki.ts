import { createHighlighter, type Highlighter } from "shiki"

let highlighterPromise: Promise<Highlighter> | null = null

export const getHighlighter = (): Promise<Highlighter> => {
  highlighterPromise ??= createHighlighter({
    themes: ["tokyo-night"],
    langs: ["tsx", "ts", "jsx", "js", "css", "html", "json", "bash", "text"],
  })
  return highlighterPromise
}

export const highlight = async (
  code: string,
  language: string,
): Promise<string> => {
  const highlighter = await getHighlighter()
  const lang = highlighter.getLoadedLanguages().includes(language)
    ? language
    : "text"
  return highlighter.codeToHtml(code, { lang, theme: "tokyo-night" })
}
