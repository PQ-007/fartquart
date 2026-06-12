import Image from "next/image"
import type { Metadata } from "next"
import styles from "./page.module.css"
import { Footer } from "@/components/Footer"

export const metadata: Metadata = { title: "About | Josh Warren" }

const EXPERIENCE = [
  { company: "M-XR", period: "2025 - Present", role: "Senior Front-End Engineer" },
  { company: "Powur", period: "2024 - 2025", role: "Front-End Engineer" },
  { company: "EyeCue Lab", period: "2022 - 2024", role: "Full Stack Engineer" },
]

export default function AboutPage() {
  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.about}>
          <div className={styles.side}>
            <div className={styles.profile}>
              <Image
                src="/images/profile.webp"
                alt="Josh Warren profile picture"
                width={300}
                height={300}
                priority
              />
            </div>
          </div>
          <div className={styles.intro}>
            <h1>Hello 👋,</h1>
            <p>
              I&rsquo;m Josh. a creative Software Engineer with strong design
              instincts and a love for coding!
            </p>
            <p>
              I love designing and building things that are both beautiful and
              functional. Some of my current favorite tools are Next.js,
              Three.js, and Socket.io.
            </p>
            <p>
              I&rsquo;m currently working at M-XR as a front-end engineer, but
              I&rsquo;m also always building side projects. So, follow me on my
              socials to see what I&rsquo;m up to.
            </p>
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.divider} />
          <h4>Experience</h4>
          {EXPERIENCE.map((job) => (
            <div key={job.company} className={styles.experience}>
              <header>
                <p>{job.company}</p> <span>{job.period}</span>
              </header>
              <p>{job.role}</p>
            </div>
          ))}
        </section>
        <section className={styles.section}>
          <div className={styles.divider} />
          <div className={styles.more}>
            <p>
              When I&rsquo;m not coding, I&rsquo;m probably hanging out with my
              dogs, Remy and Benji.
            </p>
            <div className={styles.dogs}>
              <Image src="/images/dog.webp" alt="dogs" width={300} height={400} />
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  )
}
