"use client"

import { useState } from "react"
import styles from "./VideoPlayer.module.css"

export const VideoPlayer = ({
  src,
  poster,
}: {
  src: string
  poster?: string
}) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={styles.wrapper}>
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
        data-loaded={loaded}
      />
      {!loaded && (
        <div className={styles.loading}>
          <div className={styles.animation} />
        </div>
      )}
    </div>
  )
}
