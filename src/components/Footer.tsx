import styles from "./Footer.module.css"
import { CopyEmail } from "./CopyEmail"
import { SlidingText } from "./SlidingText"

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/joshwrn/" },
  { label: "GitHub", href: "https://github.com/joshwrn" },
  { label: "Twitter", href: "https://twitter.com/joshwrn" },
]

export const Footer = ({
  gradient = false,
  background = false,
}: {
  gradient?: boolean
  background?: boolean
}) => (
  <footer className={styles.wrapper}>
    <div
      className={styles.background}
      data-gradient={gradient}
      data-bg={background}
    />
    <div className={styles.inner}>
      <section className={styles.top}>
        <div className={styles.contact}>
          <h4>Get In Touch</h4>
          <div>
            <CopyEmail email="joshnwarren@gmail.com" />
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
        <p>© 2025 Josh Warren</p>
        <p>Built with 🖤</p>
        <p>California, USA</p>
      </section>
    </div>
  </footer>
)
