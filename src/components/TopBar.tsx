"use client"

import { useEffect, useState } from "react"
import styles from "./TopBar.module.css"
import { ClockIcon } from "./icons"
import { useT } from "./LanguageProvider"

const Clock = () => {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Asia/Ulaanbaatar",
        }),
      )
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.clock}>
      <ClockIcon />
      <p>
        {time ?? "00:00"} <span>(UB)</span>
      </p>
    </div>
  )
}

const LastLocation = () => {
  const [location, setLocation] = useState<string | null>(null)
  const t = useT()

  useEffect(() => {
    fetch("/api/last-visit")
      .then((res) => res.json())
      .then((data: { location: string }) => setLocation(data.location))
      .catch(() => setLocation("Ulaanbaatar, MN"))
  }, [])

  return (
    <div className={styles.lastLocation}>
      <p>{t("ui.latestVisit")}</p>
      {location ? (
        <div className={styles.pill}>
          <p>{location}</p>
        </div>
      ) : (
        <div className={styles.pillLoading} data-loading="true" />
      )}
    </div>
  )
}

export const TopBar = () => (
  <header className={styles.wrapper}>
    <LastLocation />
    <Clock />
  </header>
)
