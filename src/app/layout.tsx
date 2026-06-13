import type { Metadata } from "next"
import Script from "next/script"
import { Fraunces, Manrope, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import "katex/dist/katex.min.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { LanguageProvider } from "@/components/LanguageProvider"
import { Background } from "@/components/Background"
import { Nav } from "@/components/Nav"
import { PostImageLightbox } from "@/components/post/PostImageLightbox"

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
  title: {
    default: "Bilguun",
    template: "%s | Bilguun",
  },
  description: "A room for my thoughts, creations, and curiosities.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${serif.variable} ${neue.variable} ${jetbrains.variable}`}
      >
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
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
