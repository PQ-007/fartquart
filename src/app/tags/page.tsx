import type { Metadata } from "next"
import { TagGraph } from "@/components/TagGraph"
import { VaultTree } from "@/components/VaultTree"
import { getGraphData, getVaultTree } from "@/lib/content"
import { defaultLocale } from "@/lib/i18n"
import { buildPageMetadata } from "@/lib/seo"
import styles from "./page.module.css"

export const metadata: Metadata = buildPageMetadata(
  "Tags",
  "Explore posts and creations by topic in an interactive graph.",
  "/tags",
)

export default function TagsPage() {
  const graphData = getGraphData(defaultLocale)
  const tree = getVaultTree(defaultLocale)
  return (
    <div className={styles.layout}>
      <VaultTree tree={tree} />
      <TagGraph data={graphData} />
    </div>
  )
}
