import Link from "next/link"
import styles from "./PostPreview.module.css"
import { SlidingText } from "./SlidingText"
import { VideoPlayer } from "./VideoPlayer"
import { videoUrl, type PostMeta } from "@/lib/posts"

export const PostPreview = ({ post }: { post: PostMeta }) => (
  <div className={styles.container}>
    <div className={styles.videoWrapper}>
      <div className={styles.lightBorder}>
        <Link href={`/posts/${post.slug}`} className={styles.videoLink}>
          <VideoPlayer src={videoUrl(post.mainVideo)} />
          <section className={styles.overlay}>
            <h3>View Post</h3>
          </section>
        </Link>
      </div>
    </div>
    <div className={styles.inner}>
      <div>
        <h1>{post.title}</h1>
        <p className={styles.description}>{post.description}</p>
      </div>
      <Link className={styles.link} href={`/posts/${post.slug}`}>
        <SlidingText text="Continue Reading" arrow />
      </Link>
    </div>
  </div>
)
