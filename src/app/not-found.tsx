"use client"

import Link from "next/link"
import { SlidingText } from "@/components/SlidingText"
import { useT } from "@/components/LanguageProvider"

export default function NotFound() {
  const t = useT()

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <h1 style={{ fontSize: "var(--font-6)", lineHeight: 1 }}>404</h1>
      <p>{t("notFound.message")}</p>
      <Link href="/">
        <SlidingText text={t("notFound.back")} arrow />
      </Link>
    </div>
  )
}
