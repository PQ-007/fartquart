"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import styles from "./Nav.module.css"
import { useTheme } from "./ThemeProvider"
import { useT } from "./LanguageProvider"
import { LanguageSwitcher } from "./LanguageSwitcher"
import { CloseIcon, GearIcon, MenuIcon } from "./icons"

const HREFS = ["/", "/blog", "/creations", "/about"]

const activeIndex = (pathname: string): number => {
  if (pathname === "/") return 0
  if (pathname.startsWith("/blog") || pathname.startsWith("/tags")) return 1
  if (pathname.startsWith("/creations")) return 2
  if (pathname.startsWith("/about")) return 3
  return 0
}

export const Nav = () => {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const t = useT()
  const [open, setOpen] = useState(false)
  const active = activeIndex(pathname)

  const labels = [t("nav.home"), t("nav.blog"), t("nav.creations"), t("nav.about")]

  return (
    <>
      <nav className={styles.outer}>
        <div className={styles.inner}>
          <section className={styles.itemsContainer}>
            <div className={styles.items}>
              {HREFS.map((href, i) => (
                <div key={href} className={styles.item}>
                  <Link href={href}>
                    <p>{labels[i]}</p>
                  </Link>
                </div>
              ))}
              <div
                className={styles.background}
                style={{ transform: `translateX(${active * 100}%)` }}
              />
            </div>
            <div className={styles.langSection}>
              <div className={styles.divider} />
              <LanguageSwitcher />
            </div>
            <div className={styles.settingsButton}>
              <div className={styles.divider} />
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
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
              toggleTheme()
              setOpen(false)
            }}
          >
            <GearIcon /> {theme === "dark" ? t("ui.lightMode") : t("ui.darkMode")}
          </button>
        </div>
      </div>
    </>
  )
}
