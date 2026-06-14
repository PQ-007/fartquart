import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { CreationsListing } from "@/components/CreationsListing"
import { getAllCreations } from "@/lib/content"
import { buildPageMetadata } from "@/lib/seo"

export const metadata: Metadata = buildPageMetadata(
  "Creations",
  "Apps, tools, and experiments I've built.",
  "/creations",
)

export default function CreationsPage() {
  const creations = getAllCreations()
  return (
    <>
      <CreationsListing creations={creations} />
      <Footer gradient />
    </>
  )
}
