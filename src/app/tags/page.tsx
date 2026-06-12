import type { Metadata } from "next"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { Tag } from "@/components/Tag"
import { getAllTags } from "@/lib/posts"

export const metadata: Metadata = { title: "Tags | Josh Warren" }

export default function TagsPage() {
  const tags = getAllTags()

  return (
    <>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>Tags</h1>
          <p>
            Browse posts by tag. Each tag is a topic that appears in one or
            more posts.
          </p>
        </header>
        <section className={styles.tags}>
          {tags.map(({ tag, count }) => (
            <Tag
              key={tag}
              name={tag}
              count={count}
              href={`/tags/${encodeURIComponent(tag)}`}
            />
          ))}
        </section>
      </div>
      <Footer />
    </>
  )
}
