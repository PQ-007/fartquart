import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import "katex/dist/katex.min.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { LanguageProvider } from "@/components/LanguageProvider"
import { Background } from "@/components/Background"
import { Nav } from "@/components/Nav"
import { PostImageLightbox } from "@/components/post/PostImageLightbox"
import { SITE_URL, SITE_NAME, SITE_DESC, DEFAULT_OG_IMAGE } from "@/lib/site"

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies()
  const theme = cookieStore.get("theme")?.value === "light" ? "light" : "dark"

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body
        className={`${serif.variable} ${neue.variable} ${jetbrains.variable}`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <Background />
            <div aria-hidden="true" className="grid-bg" />
            {children}
            <Nav />
            <PostImageLightbox />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
