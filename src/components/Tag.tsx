import Link from "next/link"
import styles from "./Tag.module.css"

export const Tag = ({
  name,
  count,
  href,
}: {
  name: string
  count?: number
  href?: string
}) => {
  const inner = (
    <div className={styles.tag}>
      <p>
        #{name}
        {count !== undefined && <span className={styles.count}> {count}</span>}
      </p>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}
