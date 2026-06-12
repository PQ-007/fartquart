import type { Metadata } from "next"
import { Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { LanguageProvider } from "@/components/LanguageProvider"
import { Background } from "@/components/Background"
import { Nav } from "@/components/Nav"

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
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
        <ThemeProvider>
          <LanguageProvider>
            <Background />
            {children}
            <Nav />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
