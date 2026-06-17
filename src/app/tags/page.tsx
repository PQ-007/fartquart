import type { Metadata } from "next"
import { TagGraph } from "@/components/TagGraph"
import { getGraphData } from "@/lib/content"
import { getServerLocale } from "@/lib/locale"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata(
  "Tags",
  "Explore posts and creations by topic in an interactive graph.",
  "/tags",
)

export default async function TagsPage() {
  const locale = await getServerLocale()
  const graphData = getGraphData(locale)
  return <TagGraph data={graphData} />
}
