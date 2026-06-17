import styles from "./page.module.css"
import { TopBar } from "@/components/TopBar"
import { PostPreview } from "@/components/PostPreview"
import { Footer } from "@/components/Footer"
import { HomeHero } from "@/components/HomeHero"
import { HomeGraph } from "@/components/HomeGraph"
import { ActivityFeed } from "@/components/ActivityFeed"
import { JsonLd } from "@/components/JsonLd"
import { getFeaturedContent, getGraphData, getAllBlogPosts } from "@/lib/content"
import { siteJsonLd } from "@/lib/seo"
import { collapseTranslations } from "@/lib/translations"
import { getServerLocale } from "@/lib/locale"

export default async function Home() {
  const locale = await getServerLocale()
  const { blogs, creations } = getFeaturedContent(locale)
  const graphData = getGraphData(locale)
  const latestPosts = collapseTranslations(getAllBlogPosts(), locale).slice(0, 8)

  return (
    <>
      <JsonLd data={siteJsonLd()} />
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
          <div className={styles.projectsInnerWrapper}>
            <div className={styles.projectsInner}>
              <ActivityFeed posts={latestPosts} />
            </div>
          </div>
        </div>
      </div>
      <Footer background />
    </>
  )
}
