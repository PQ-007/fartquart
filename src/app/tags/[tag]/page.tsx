import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { TagPageContent } from "@/components/TagPageContent"
import {
  getAllTagsUnified,
  getBlogPostsByTag,
  getCreationsByTag,
} from "@/lib/content"

export const generateStaticParams = () =>
  getAllTagsUnified().map(({ tag }) => ({ tag: encodeURIComponent(tag) }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> => {
  const { tag } = await params
  return { title: `#${decodeURIComponent(tag)}` }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: encoded } = await params
  const tag = decodeURIComponent(encoded)

  const blogs = getBlogPostsByTag(tag)
  const creations = getCreationsByTag(tag)

  if (blogs.length + creations.length === 0) notFound()

  return (
    <>
      <TagPageContent tag={tag} blogs={blogs} creations={creations} />
      <Footer />
    </>
  )
}
