"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import styles from "./Nav.module.css"
import { useTheme } from "./ThemeProvider"
import { CloseIcon, GearIcon, MenuIcon } from "./icons"

const ITEMS = [
  { label: "Home", href: "/" },
  { label: "Posts", href: "/posts" },
  { label: "About", href: "/about" },
]

const activeIndex = (pathname: string): number => {
  if (pathname === "/") return 0
  if (pathname.startsWith("/posts") || pathname.startsWith("/tags")) return 1
  if (pathname.startsWith("/about")) return 2
  return 0
}

export const Nav = () => {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const active = activeIndex(pathname)

  return (
    <>
      <nav className={styles.outer}>
        <div className={styles.inner}>
          <section className={styles.itemsContainer}>
            <div className={styles.items}>
              {ITEMS.map((item) => (
                <div key={item.href} className={styles.item}>
                  <Link href={item.href}>
                    <p>{item.label}</p>
                  </Link>
                </div>
              ))}
              <div
                className={styles.background}
                style={{ transform: `translateX(${active * 100}%)` }}
              />
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
          {ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <h1>{item.label}</h1>
            </Link>
          ))}
          <button
            className={styles.mobileTheme}
            onClick={() => {
              toggleTheme()
              setOpen(false)
            }}
          >
            <GearIcon /> {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>
      </div>
    </>
  )
}
