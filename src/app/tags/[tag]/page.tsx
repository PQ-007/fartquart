import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { PostPreview } from "@/components/PostPreview"
import { SlidingText } from "@/components/SlidingText"
import { Tag } from "@/components/Tag"
import { getAllTags, getPostsByTag } from "@/lib/posts"

export const generateStaticParams = () =>
  getAllTags().map(({ tag }) => ({ tag: encodeURIComponent(tag) }))

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> => {
  const { tag } = await params
  return { title: `#${decodeURIComponent(tag)} | Josh Warren` }
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>
}) {
  const { tag: encoded } = await params
  const tag = decodeURIComponent(encoded)
  const posts = getPostsByTag(tag)
  if (posts.length === 0) notFound()

  return (
    <>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <Tag name={tag} />
          <p>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
          <Link href="/tags" className={styles.allTags}>
            <SlidingText text="All Tags" arrow />
          </Link>
        </header>
        <section className={styles.posts}>
          {posts.map((post) => (
            <PostPreview key={post.slug} post={post} />
          ))}
        </section>
      </div>
      <Footer />
    </>
  )
}
