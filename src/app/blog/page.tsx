import type { Metadata } from "next"
import { Footer } from "@/components/Footer"
import { BlogListing } from "@/components/BlogListing"
import { getAllBlogPosts } from "@/lib/content"

export const metadata: Metadata = { title: "Blog" }

export default function BlogPage() {
  const posts = getAllBlogPosts()
  return (
    <>
      <BlogListing posts={posts} />
      <Footer gradient />
    </>
  )
}
