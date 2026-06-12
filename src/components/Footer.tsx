"use client"

import styles from "./Footer.module.css"
import { CopyEmail } from "./CopyEmail"
import { SlidingText } from "./SlidingText"
import { useT } from "./LanguageProvider"

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/bilguunpq" },
]

export const Footer = ({
  gradient = false,
  background = false,
}: {
  gradient?: boolean
  background?: boolean
}) => {
  const t = useT()

  return (
    <footer className={styles.wrapper}>
      <div
        className={styles.background}
        data-gradient={gradient}
        data-bg={background}
      />
      <div className={styles.inner}>
        <section className={styles.top}>
          <div className={styles.contact}>
            <h4>{t("ui.getInTouch")}</h4>
            <div>
              <CopyEmail email="bilguuntushig.a@gmail.com" />
            </div>
          </div>
          <div className={styles.socials}>
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SlidingText text={social.label} arrow />
              </a>
            ))}
          </div>
        </section>
        <section className={styles.bottom}>
          <p>© 2026 Bilguun</p>
          <p>{t("ui.builtWith")}</p>
          <p>Ulaanbaatar, MN</p>
        </section>
      </div>
    </footer>
  )
}
