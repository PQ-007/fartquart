import Link from "next/link"
import type { Metadata } from "next"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { PostPreview } from "@/components/PostPreview"
import { SlidingText } from "@/components/SlidingText"
import { Tag } from "@/components/Tag"
import { getAllPosts } from "@/lib/posts"

export const metadata: Metadata = { title: "Posts | Josh Warren" }

export default function PostsPage() {
  const posts = getAllPosts()
  const categories = ["project", "lab"] as const

  return (
    <>
      <div className={styles.outer}>
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            {categories.map((category) => (
              <section key={category} className={styles.categorySection}>
                <header className={styles.header}>
                  <Tag name={category} />
                  <Link href="/tags">
                    <SlidingText text="All Tags" arrow />
                  </Link>
                </header>
                <section className={styles.posts}>
                  {posts
                    .filter((post) => post.category === category)
                    .map((post) => (
                      <PostPreview key={post.slug} post={post} />
                    ))}
                </section>
                <div className={styles.divider} />
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer gradient />
    </>
  )
}
