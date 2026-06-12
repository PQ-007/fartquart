import styles from "./page.module.css"
import { TopBar } from "@/components/TopBar"
import { PostPreview } from "@/components/PostPreview"
import { Footer } from "@/components/Footer"
import { HomeHero } from "@/components/HomeHero"
import { HomeGraph } from "@/components/HomeGraph"
import { getFeaturedContent, getGraphData } from "@/lib/content"

export default function Home() {
  const { blogs, creations } = getFeaturedContent()
  const graphData = getGraphData()

  return (
    <>
      <div className={styles.pageWrapper}>
        <section className={styles.sectionWrapper}>
          <div className={styles.graphOverlay}>
            <HomeGraph data={graphData} />
          </div>
          <div className={styles.container}>
            <div className={styles.inner}>
              <TopBar />
              <div className={styles.text}>
                <div className={styles.name}>
                  <h1 className={styles.lastName}>Bilguuntushiq</h1>
                </div>
                <HomeHero />
              </div>
            </div>
          </div>
        </section>
        <div className={styles.projectWrapper}>
          <section className={styles.gradient} />
          <div className={styles.projectsInnerWrapper}>
            <div className={styles.projectsInner}>
              <section className={styles.projects}>
                {creations.map((c) => (
                  <PostPreview key={c.slug} type="creation" post={c} />
                ))}
                {blogs.map((p) => (
                  <PostPreview key={p.slug} type="blog" post={p} />
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
