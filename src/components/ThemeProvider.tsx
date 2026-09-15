"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react"

type Theme = "dark" | "light"

const KEY = "theme"

// localStorage is the source of truth; the layout's bootstrap script applies it
// to <html> before first paint. Subscribing to it (rather than reading it in an
// effect and calling setState) keeps React's copy in sync without the extra
// render pass, and React swaps from the server snapshot after hydration.
const listeners = new Set<() => void>()

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  window.addEventListener("storage", onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener("storage", onChange)
  }
}

const readTheme = (): Theme => {
  try {
    return localStorage.getItem(KEY) === "light" ? "light" : "dark"
  } catch {
    return "dark"
  }
}

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({ theme: "dark", toggleTheme: () => {} })

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme)

  // The favicon tracks the site's own theme, which prefers-color-scheme (the
  // OS setting) knows nothing about, so the link has to be swapped by hand.
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (link) link.href = theme === "light" ? "/favicon-light.png" : "/favicon-dark.png"
  }, [theme])

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === "dark" ? "light" : "dark"
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // private mode — the toggle still applies for this page view
    }
    document.cookie = `${KEY}=${next};path=/;max-age=31536000`
    document.documentElement.setAttribute("data-theme", next)
    for (const notify of listeners) notify()
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
