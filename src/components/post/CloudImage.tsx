/* eslint-disable @next/next/no-img-element */
import styles from "./CloudImage.module.css"
import { CDN } from "@/lib/posts"

export const CloudImage = ({
  path,
  alt,
  subText,
  width,
  height,
}: {
  path: string
  alt: string
  subText?: string
  width?: number
  height?: number
}) => (
  <div className={styles.container}>
    <div className={styles.imageWrapper}>
      <img
        src={path.startsWith("http") ? path : `${CDN}/${path}`}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
      />
    </div>
    {subText && (
      <div className={styles.caption}>
        <p>{subText}</p>
      </div>
    )}
  </div>
)
