import styles from "./page.module.css"
import { TopBar } from "@/components/TopBar"
import { PostPreview } from "@/components/PostPreview"
import { Footer } from "@/components/Footer"
import { getFeaturedPosts } from "@/lib/posts"

export default function Home() {
  const featured = getFeaturedPosts()

  return (
    <>
      <div className={styles.pageWrapper}>
        <section className={styles.sectionWrapper}>
          <div className={styles.container}>
            <div className={styles.inner}>
              <TopBar />
              <div className={styles.text}>
                <div className={styles.name}>
                  <h1>josh</h1>
                  <h1 className={styles.lastName}>warren</h1>
                </div>
                <p>
                  Hi! I&rsquo;m <span>Josh</span>, a front-end engineer with a
                  passion for creating engaging user experiences. Currently at{" "}
                  <span>M-XR</span>.
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className={styles.projectWrapper}>
          <section className={styles.gradient} />
          <div className={styles.projectsInnerWrapper}>
            <div className={styles.projectsInner}>
              <section className={styles.projects}>
                {featured.map((post) => (
                  <PostPreview key={post.slug} post={post} />
                ))}
              </section>
            </div>
          </div>
          <div className={styles.divider} />
        </div>
      </div>
      <Footer background />
    </>
  )
}
