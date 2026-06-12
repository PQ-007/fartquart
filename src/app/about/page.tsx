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
            <p>
              I&rsquo;m <span>Bilguun</span>, a software engineer from Ulaanbaatar, Mongolia.
            </p>
            <p>
              I build web and mobile apps — with a particular interest in creative interfaces,
              3D graphics, and tools that feel alive to use.
            </p>
            <p>
              Currently learning Japanese and building <em>Ivo</em>, a dictionary and flashcard
              app designed to stay out of the way.
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
        <section className={styles.more}>
          <h4>{t("about.more")}</h4>
          <p>
            I also write about programming, language learning, and other random stuff on{" "}
            <a href="https://bilguun.dev" target="_blank" rel="noopener noreferrer">
              my personal blog
            </a>
            . If you want to chat or collaborate on something, feel free to reach out!
          </p>
        </section>
      </div>
      <Footer />
    </>
  )
}
