import type { Metadata } from "next"
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import "katex/dist/katex.min.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { LanguageProvider } from "@/components/LanguageProvider"
import { Background } from "@/components/Background"
import { Nav } from "@/components/Nav"
import { PostImageLightbox } from "@/components/post/PostImageLightbox"
import { SearchModal } from "@/components/SearchModal"
import { SITE_URL, SITE_NAME, SITE_DESC, DEFAULT_OG_IMAGE } from "@/lib/site"
import { defaultLocale as DEFAULT_LOCALE, locales as LOCALES } from "@/lib/i18n"

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
})

const neue = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-neue",
  weight: ["400", "500", "600", "700"],
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  // Config-based so the favicon can swap on prefers-color-scheme; a file-based
  // icon in app/ would override this whole field.
  icons: {
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESC,
    url: SITE_URL,
    locale: "en_US",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    images: [DEFAULT_OG_IMAGE],
  },
}

// Stamps the reader's stored theme/locale onto <html> before first paint.
// Reading them on the server instead (cookies()) would opt every route in the
// app into dynamic rendering, so this runs as a blocking inline script.
const BOOTSTRAP = `(function(){try{var d=document.documentElement;\
var t=localStorage.getItem("theme");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);\
var l=localStorage.getItem("locale");if(${JSON.stringify(LOCALES)}.indexOf(l)>-1){\
d.setAttribute("data-lang",l);d.setAttribute("lang",l)}}catch(e){}})()`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      data-theme="dark"
      data-lang={DEFAULT_LOCALE}
      suppressHydrationWarning
    >
      <body
        className={`${serif.variable} ${neue.variable} ${jetbrains.variable}`}
      >
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
        <ThemeProvider>
          <LanguageProvider>
            <Background />
            <div aria-hidden="true" className="grid-bg" />
            {children}
            <Nav />
            <SearchModal />
            <PostImageLightbox />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
