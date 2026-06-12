"use client"

import { useEffect, useState } from "react"
import styles from "./TopBar.module.css"
import { ClockIcon } from "./icons"

const Clock = () => {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "America/Los_Angeles",
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
        {time ?? "00:00"} <span>(PST)</span>
      </p>
    </div>
  )
}

const LastLocation = () => {
  const [location, setLocation] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/last-visit")
      .then((res) => res.json())
      .then((data: { location: string }) => setLocation(data.location))
      .catch(() => setLocation("California, USA"))
  }, [])

  return (
    <div className={styles.lastLocation}>
      <p>Latest Visit</p>
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
