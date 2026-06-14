import type { Metadata } from "next"
import { TagGraph } from "@/components/TagGraph"
import { getGraphData } from "@/lib/content"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata(
  "Tags",
  "Explore posts and creations by topic in an interactive graph.",
  "/tags",
)

export default function TagsPage() {
  const graphData = getGraphData()
  return <TagGraph data={graphData} />
}
