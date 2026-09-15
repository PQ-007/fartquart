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
import { defaultLocale } from "@/lib/i18n"

const NOTE_TYPES = ["blog", "note", "chapter", "creation"]

// Rendered at the default locale so the page can prerender: reading the locale
// cookie here would make this (and every other route) dynamic. Locale only
// picks between translation variants, which the client providers still swap.
export default function Home() {
  const { blogs, creations } = getFeaturedContent(defaultLocale)
  const graphData = getGraphData(defaultLocale)
  const allPosts = collapseTranslations(getAllBlogPosts(), defaultLocale)
  const pinnedPost = allPosts.find((p) => p.pinned)
  const latestPosts = allPosts.filter((p) => !p.pinned).slice(0, 8)
  const heroStats = {
    notes: graphData.nodes.filter((n) => NOTE_TYPES.includes(n.type)).length,
    links: graphData.edges.length,
    tags: graphData.nodes.filter((n) => n.type === "tag").length,
  }

  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <div className={styles.pageWrapper}>
        <section className={styles.sectionWrapper}>
          <div className={styles.heroDecor} aria-hidden="true" />
          <div className={styles.graphOverlay}>
            <HomeGraph data={graphData} />
          </div>
          <div className={styles.container}>
            <div className={styles.inner}>
              <TopBar />
              <div className={styles.text}>
                <HomeHero stats={heroStats} />
              </div>
            </div>
          </div>
          <div className={styles.scrollCue} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
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
              <ActivityFeed posts={latestPosts} pinned={pinnedPost} />
            </div>
          </div>
        </div>
      </div>
      <Footer background />
    </>
  )
}
