"use client"

import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { useT } from "@/components/LanguageProvider"

const EXPERIENCE: { company: string; period: string; role: string }[] = [
  // TODO: add your experience here
]

export default function AboutPage() {
  const t = useT()

  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.about}>
          <div className={styles.intro}>
            <h1>{t("about.greeting")}</h1>
            <p>
              I&rsquo;m <span>Bilguun</span>. {/* TODO: write your intro */}
            </p>
            <p>
              {/* TODO: what you build, what you care about */}
            </p>
            <p>
              {/* TODO: where you are now */}
            </p>
          </div>
        </section>
        {EXPERIENCE.length > 0 && (
          <section className={styles.section}>
            <div className={styles.divider} />
            <h4>{t("about.experience")}</h4>
            {EXPERIENCE.map((job) => (
              <div key={job.company} className={styles.experience}>
                <header>
                  <p>{job.company}</p> <span>{job.period}</span>
                </header>
                <p>{job.role}</p>
              </div>
            ))}
          </section>
        )}
      </div>
      <Footer />
    </>
  )
}
