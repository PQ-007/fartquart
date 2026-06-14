import { ImageResponse } from "next/og"
import { SITE_NAME, SITE_DESC } from "@/lib/site"

// Branded default social card, served at /og and referenced explicitly as the
// fallback share image from metadata. A plain route handler (not the
// opengraph-image file convention) so it never auto-injects a competing
// og:image tag — every page sets its own image deterministically.
// English-only text so the built-in font renders cleanly (no CJK/Cyrillic).

export const dynamic = "force-static"

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 120% at 0% 0%, #0c1a3d 0%, #000000 55%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 34,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#3b82f6",
            fontWeight: 700,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 900,
            display: "flex",
          }}
        >
          {SITE_DESC}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 30,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          bilguun.me
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
