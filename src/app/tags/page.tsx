import type { Metadata } from "next"
import { TagGraph } from "@/components/TagGraph"
import { VaultTree } from "@/components/VaultTree"
import { getGraphData, getVaultTree } from "@/lib/content"
import { getServerLocale } from "@/lib/locale"
import { buildPageMetadata } from "@/lib/seo"
import styles from "./page.module.css"

export const metadata: Metadata = buildPageMetadata(
  "Tags",
  "Explore posts and creations by topic in an interactive graph.",
  "/tags",
)

export default async function TagsPage() {
  const locale = await getServerLocale()
  const graphData = getGraphData(locale)
  const tree = getVaultTree(locale)
  return (
    <div className={styles.layout}>
      <VaultTree tree={tree} />
      <TagGraph data={graphData} />
    </div>
  )
}
