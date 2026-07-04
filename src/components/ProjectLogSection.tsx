import Link from "next/link"
import type { Blog } from "@/lib/content"
import { formatDate } from "@/lib/format"
import { Tag } from "@/components/Tag"
import styles from "./ProjectLogSection.module.css"

export const ProjectLogSection = ({
  creationSlug,
  log,
  chapters,
}: {
  creationSlug: string
  log: Blog
  chapters: Blog[]
}) => (
  <section className={styles.outer}>
    <div className={styles.inner}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{log.title || "Project Log"}</h2>
        {log.category && <span className={styles.category}>{log.category}</span>}
      </div>
      {log.description && <p className={styles.description}>{log.description}</p>}
      <div className={styles.list}>
        {chapters.map((chapter) => (
          <Link
            key={chapter.slug}
            href={`/creations/${encodeURIComponent(creationSlug)}/log/${encodeURIComponent(chapter.slug)}`}
            className={styles.row}
          >
            <div className={styles.top}>
              <span className={styles.title}>{chapter.title}</span>
              <span className={styles.meta}>
                {formatDate(chapter.publishedAt)}
                {chapter.updatedAt && ` · Updated ${formatDate(chapter.updatedAt)}`}
              </span>
            </div>
            {chapter.tags.length > 0 && (
              <div className={styles.tags}>
                {chapter.tags.map((t) => (
                  <Tag key={t} name={t} />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  </section>
)
