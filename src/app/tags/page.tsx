import type { Metadata } from "next"
import { TagGraph } from "@/components/TagGraph"
import { getGraphData } from "@/lib/content"

export const metadata: Metadata = { title: "Tags" }

export default function TagsPage() {
  const graphData = getGraphData()
  return <TagGraph data={graphData} />
}
