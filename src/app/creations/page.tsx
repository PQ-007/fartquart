import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { CreationsListing } from "@/components/CreationsListing"
import { getAllCreations } from "@/lib/content"

export const metadata: Metadata = { title: "Creations" }

export default function CreationsPage() {
  const creations = getAllCreations()
  return (
    <>
      <CreationsListing creations={creations} />
      <Footer gradient />
    </>
  )
}
