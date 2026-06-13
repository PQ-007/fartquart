"use client"

import Image from "next/image"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"
import { useT } from "@/components/LanguageProvider"

const EXPERIENCE: { company: string; period: string; role: string }[] = [
  { company: "Tokyo System House", period: "2026", role: "Software Engineer Intern" },
  { company: "Co-graph", period: "Oct 2025", role: "Python / Streamlit Engineer Intern" },
  { company: "Susano", period: "Jul 2025", role: "C# / .NET Engineer Intern" },
  { company: "ALTEN Japan", period: "Aug 2024", role: "Software Engineer Intern" },
]

export default function AboutPage() {
  const t = useT()

  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.about}>
          <div className={styles.side}>
            <div className={styles.profile}>
              <Image
                src="/images/profile.png"
                alt="Bilguun"
                width={300}
                height={300}
              />
            </div>
          </div>
          <div className={styles.intro}>
            <h1>{t("about.greeting")}</h1>
            <p>{t("about.bio1")}</p>
            <p>{t("about.bio2")}</p>
            <p>{t("about.bio3")}</p>
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
        <section className={styles.more}>
          <h4>{t("about.more")}</h4>
          <p>
            {t("about.moreBody").split(t("about.blogLink")).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <a href="https://bilguun.dev" target="_blank" rel="noopener noreferrer">
                    {t("about.blogLink")}
                  </a>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        </section>
      </div>
      <Footer />
    </>
  )
}
