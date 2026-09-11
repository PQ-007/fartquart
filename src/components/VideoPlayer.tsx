"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./VideoPlayer.module.css"

// Used for post heroes and for listing thumbnails, where a dozen cards can be
// on screen at once — so the source is only attached once the card is near the
// viewport. The poster frame renders immediately either way, so a card is never
// blank while its loop downloads.
export const VideoPlayer = ({
  src,
  poster,
}: {
  src: string
  poster?: string
}) => {
  const [loaded, setLoaded] = useState(false)
  const [near, setNear] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      // No observer to gate on — load on the next frame rather than during
      // the effect body, which would force an extra synchronous render.
      const id = requestAnimationFrame(() => setNear(true))
      return () => cancelAnimationFrame(id)
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: "400px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={styles.wrapper}>
      <video
        src={near ? src : undefined}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={() => setLoaded(true)}
        data-loaded={loaded || !!poster}
      />
      {!loaded && !poster && (
        <div className={styles.loading}>
          <div className={styles.animation} />
        </div>
      )}
    </div>
  )
}
