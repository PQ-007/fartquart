import type { Metadata } from "next"
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Background } from "@/components/Background"
import { Nav } from "@/components/Nav"

const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
})

const neue = Inter({
  subsets: ["latin"],
  variable: "--font-neue",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  title: "Josh Warren",
  description:
    "Hi! I'm Josh, a front-end engineer with a passion for creating engaging user experiences.",
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
          <Background />
          {children}
          <Nav />
        </ThemeProvider>
      </body>
    </html>
  )
}
