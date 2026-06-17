"use client"

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react"
import { PlayIcon } from "./icons"
import styles from "./MusicPlayer.module.css"

const PauseIcon = () => (
  <svg viewBox="0 0 512 512" height="1em" width="1em" fill="currentColor" aria-hidden>
    <path d="M208 432h-48a16 16 0 0 1-16-16V96a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v320a16 16 0 0 1-16 16zM352 432h-48a16 16 0 0 1-16-16V96a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v320a16 16 0 0 1-16 16z" />
  </svg>
)

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg viewBox="0 0 24 24" height="1em" width="1em" fill="currentColor" aria-hidden>
    <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1z" />
    {muted ? (
      <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    )}
  </svg>
)

const youtubeId = (url: string): string | null => {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|embed\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

const normalize = (src: string): string =>
  src.startsWith("http") || src.startsWith("/") ? src : `/${src}`

/** Derive a track name from an audio file URL ("my-song.mp3" → "my song"). */
const fileTrackName = (url: string): string => {
  const base = decodeURIComponent(url.split(/[?#]/)[0].split("/").pop() ?? "")
  return base.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim()
}

const fmt = (s: number): string => {
  if (!Number.isFinite(s) || s < 0) return "0:00"
  return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`
}

type YTPlayer = {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (s: number, allowSeekAhead: boolean) => void
  setVolume: (v: number) => void
  getDuration: () => number
  getCurrentTime: () => number
  getVideoData: () => { title: string }
}
let ytApi: Promise<void> | null = null
const loadYouTubeApi = (): Promise<void> => {
  if (ytApi) return ytApi
  ytApi = new Promise((resolve) => {
    const w = window as unknown as { YT?: { Player: unknown }; onYouTubeIframeAPIReady?: () => void }
    if (w.YT?.Player) return resolve()
    const prev = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve()
    }
    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"
    document.head.appendChild(tag)
  })
  return ytApi
}

export const MusicPlayer = ({ src }: { src: string }) => {
  const yt = youtubeId(src)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [ready, setReady] = useState(!yt)
  const [track, setTrack] = useState(yt ? "" : fileTrackName(src))

  const audioRef = useRef<HTMLAudioElement>(null)
  const ytRef = useRef<YTPlayer | null>(null)
  const ytMount = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!yt || !ytMount.current) return
    let cancelled = false
    let timer: ReturnType<typeof setInterval>

    loadYouTubeApi().then(() => {
      const mount = ytMount.current
      if (cancelled || !mount) return
      const YT = (window as unknown as { YT: { Player: new (el: Element, opts: object) => YTPlayer } }).YT
      const player = new YT.Player(mount, {
        videoId: yt,
        playerVars: { controls: 0, disablekb: 1, playsinline: 1, loop: 1, playlist: yt },
        events: {
          onReady: () => {
            ytRef.current = player
            player.setVolume(volume * 100)
            setDuration(player.getDuration())
            setTrack(player.getVideoData().title)
            setReady(true)
          },
          onStateChange: (e: { data: number }) => setPlaying(e.data === 1),
        },
      })
      timer = setInterval(() => {
        if (ytRef.current) setCurrent(ytRef.current.getCurrentTime())
      }, 500)
    })

    return () => {
      cancelled = true
      clearInterval(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yt])

  const toggle = useCallback(() => {
    if (yt) {
      const p = ytRef.current
      if (!p) return
      playing ? p.pauseVideo() : p.playVideo()
    } else {
      const a = audioRef.current
      if (!a) return
      playing ? a.pause() : void a.play()
    }
  }, [yt, playing])

  const seek = (value: number) => {
    setCurrent(value)
    if (yt) ytRef.current?.seekTo(value, true)
    else if (audioRef.current) audioRef.current.currentTime = value
  }

  const changeVolume = (v: number) => {
    setVolume(v)
    if (yt) ytRef.current?.setVolume(v * 100)
    else if (audioRef.current) audioRef.current.volume = v
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div className={styles.player} data-playing={playing}>
      <div className={styles.top}>
        <button
          type="button"
          className={styles.play}
          onClick={toggle}
          disabled={!ready}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <span className={styles.name}>{track || "Loading…"}</span>
        <button
          type="button"
          className={styles.volBtn}
          onClick={() => changeVolume(volume > 0 ? 0 : 0.7)}
          aria-label={volume > 0 ? "Mute" : "Unmute"}
        >
          <VolumeIcon muted={volume === 0} />
        </button>
        <input
          type="range"
          className={styles.volume}
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => changeVolume(Number(e.target.value))}
          style={{ "--pct": `${volume * 100}%` } as CSSProperties}
          aria-label="Volume"
        />
      </div>

      <div className={styles.bottom}>
        <input
          type="range"
          className={styles.scrub}
          min={0}
          max={duration || 0}
          step={0.1}
          value={current}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ "--pct": `${pct}%` } as CSSProperties}
          aria-label="Seek"
          disabled={!ready}
        />
        <span className={styles.time}>{fmt(current)} / {fmt(duration)}</span>
      </div>

      {yt ? (
        <div className={styles.hiddenFrame}>
          <div ref={ytMount} />
        </div>
      ) : (
        <audio
          ref={audioRef}
          src={normalize(src)}
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration)
            e.currentTarget.volume = volume
          }}
        />
      )}
    </div>
  )
}
