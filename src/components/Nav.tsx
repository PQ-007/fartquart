"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useLayoutEffect } from "react"
import styles from "./Nav.module.css"
import { useLanguage, useT } from "./LanguageProvider"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { SettingsPanel } from "./SettingsPanel"
import { CloseIcon, GearIcon, MenuIcon, SearchIcon } from "./icons"

const openSearch = () => window.dispatchEvent(new Event("open-search"))

const HREFS = ["/", "/blog", "/notes", "/creations", "/about"]

const activeIndex = (pathname: string): number => {
  if (pathname === "/") return 0
  if (pathname.startsWith("/blog") || pathname.startsWith("/tags")) return 1
  if (pathname.startsWith("/notes")) return 2
  if (pathname.startsWith("/creations")) return 3
  if (pathname.startsWith("/about")) return 4
  return 0
}

export const Nav = () => {
  const pathname = usePathname()
  const t = useT()
  const { locale } = useLanguage()
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const active = activeIndex(pathname)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [indStyle, setIndStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 })

  const labels = [t("nav.home"), t("nav.blog"), t("nav.notes"), t("nav.creations"), t("nav.about")]

  useLayoutEffect(() => {
    const el = itemRefs.current[active]
    if (el) {
      setIndStyle({ left: el.offsetLeft, width: el.offsetWidth })
    }
  }, [active, locale])

  return (
    <>
      {settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} />}

      <nav className={styles.outer}>
        <div className={styles.inner}>
          <section className={styles.itemsContainer}>
            <div className={styles.items}>
              {HREFS.map((href, i) => (
                <div
                  key={href}
                  className={styles.item}
                  ref={(el) => { itemRefs.current[i] = el }}
                >
                  <Link href={href}>
                    <p>{labels[i]}</p>
                  </Link>
                </div>
              ))}
              <div
                className={styles.background}
                style={{ left: indStyle.left, width: indStyle.width }}
              />
            </div>
            <div className={styles.settingsButton}>
              <div className={styles.divider} />
              <button onClick={openSearch} aria-label={t("ui.search")}>
                <SearchIcon />
              </button>
              <button
                onClick={() => setSettingsOpen((s) => !s)}
                aria-label="Open settings"
                data-active={settingsOpen}
              >
                <GearIcon />
              </button>
            </div>
          </section>
        </div>
      </nav>

      <nav className={styles.mobileNav} data-open={open}>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <MenuIcon />
        </button>
      </nav>
      <div className={styles.mobileMenu} data-open={open}>
        <button
          className={styles.mobileClose}
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        <div className={styles.mobileLinks}>
          {HREFS.map((href, i) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <h1>{labels[i]}</h1>
            </Link>
          ))}
          <LanguageSwitcher mobile />
          <button
            className={styles.mobileTheme}
            onClick={() => {
              openSearch()
              setOpen(false)
            }}
          >
            <SearchIcon /> {t("ui.search")}
          </button>
          <button
            className={styles.mobileTheme}
            onClick={() => {
              setSettingsOpen(true)
              setOpen(false)
            }}
          >
            <GearIcon /> {t("settings.title")}
          </button>
        </div>
      </div>
    </>
  )
}
