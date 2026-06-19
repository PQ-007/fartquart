"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useLanguage, useT } from "./LanguageProvider"
import { localeLabels, type Locale } from "@/lib/i18n"
import { searchPosts, type SearchHit } from "@/lib/search"
import styles from "./SearchModal.module.css"

const TYPE_ORDER = ["blog", "note", "chapter", "creation"] as const
const GROUP_KEY: Record<string, string> = {
  blog: "nav.blog",
  note: "nav.notes",
  chapter: "nav.notes",
  creation: "nav.creations",
}

/** Wrap matched terms in <mark>. Case-insensitive substring match (CJK-safe). */
const highlight = (text: string, terms: string[]): ReactNode => {
  if (!text || terms.length === 0) return text
  const escaped = terms
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .sort((a, b) => b.length - a.length)
  if (escaped.length === 0) return text
  const re = new RegExp(`(${escaped.join("|")})`, "gi")
  const lowerTerms = new Set(terms.map((t) => t.toLowerCase()))
  return text.split(re).map((part, i) =>
    part && lowerTerms.has(part.toLowerCase()) ? (
      <mark key={i} className={styles.mark}>{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export const SearchModal = () => {
  const t = useT()
  const { locale } = useLanguage()
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setHits([])
    setActive(0)
  }, [])

  // Global open triggers: ⌘K / Ctrl+K / "/" and the custom event from the Nav.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
        return
      }
      const el = e.target as HTMLElement | null
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
      if (e.key === "/" && !typing) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener("open-search", onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("open-search", onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Debounced query.
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => {
      searchPosts(query, locale).then((res) => {
        setHits(res)
        setActive(0)
      })
    }, 120)
    return () => clearTimeout(id)
  }, [query, locale, open])

  // Display order = grouped by type, flat index for keyboard nav.
  const ordered = TYPE_ORDER.flatMap((type) => hits.filter((h) => h.record.type === type))

  const go = useCallback(
    (hit: SearchHit | undefined) => {
      if (!hit) return
      close()
      router.push(hit.record.url)
    },
    [close, router],
  )

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return close()
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, ordered.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      go(ordered[active])
    }
  }

  if (!open) return null

  let flatIndex = -1

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown}>
        <div className={styles.inputRow}>
          <span className={styles.searchIcon} aria-hidden>⌕</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ui.searchPlaceholder")}
            aria-label={t("ui.search")}
          />
          <kbd className={styles.esc}>esc</kbd>
        </div>

        {query.trim() && ordered.length === 0 && (
          <p className={styles.empty}>{t("ui.searchEmpty")}</p>
        )}

        {ordered.length > 0 && (
          <div className={styles.results}>
            {TYPE_ORDER.map((type) => {
              const group = hits.filter((h) => h.record.type === type)
              if (group.length === 0) return null
              return (
                <section key={type} className={styles.group}>
                  <p className={styles.groupLabel}>{t(GROUP_KEY[type])}</p>
                  {group.map((hit) => {
                    flatIndex += 1
                    const idx = flatIndex
                    const r = hit.record
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={styles.hit}
                        data-active={idx === active}
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(hit)}
                      >
                        <span className={styles.hitTitle}>
                          {r.parentTitle && <span className={styles.parent}>{r.parentTitle} ▸ </span>}
                          {highlight(r.title, hit.terms)}
                          {r.lang && (
                            <span className={styles.lang}>{localeLabels[r.lang as Locale] ?? r.lang}</span>
                          )}
                        </span>
                        {(hit.snippet || r.description) && (
                          <span className={styles.hitSnippet}>
                            {highlight(hit.snippet || r.description, hit.terms)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </section>
              )
            })}
          </div>
        )}

        <div className={styles.footer}>{t("ui.searchHint")}</div>
      </div>
    </div>
  )
}
