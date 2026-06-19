import { buildSearchRecords } from "@/lib/search-index"

// Prerendered at build time → served as a static CDN asset (no serverless cost,
// no function-bundle bloat). The browser fetches it once to build the index.
export const dynamic = "force-static"

export function GET() {
  return Response.json(buildSearchRecords(), {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  })
}
