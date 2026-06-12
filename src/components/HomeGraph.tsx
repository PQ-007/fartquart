"use client"

import { TagGraph } from "./TagGraph"
import styles from "./HomeGraph.module.css"
import type { GraphData } from "@/lib/content"

export const HomeGraph = ({ data }: { data: GraphData }) => (
  <TagGraph data={data} hideOverlay className={styles.wrapper} />
)
