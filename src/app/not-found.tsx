import Link from "next/link"
import { SlidingText } from "@/components/SlidingText"

export default function NotFound() {
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
      <p>This page could not be found.</p>
      <Link href="/">
        <SlidingText text="Back Home" arrow />
      </Link>
    </div>
  )
}
