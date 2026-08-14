"use client"

import { useEffect, useMemo, useRef, useState, useCallback, type ReactNode, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import * as d3 from "d3"
import { ChevronDown, X, RotateCcw, Play, Pause, Search, SlidersHorizontal } from "lucide-react"
import styles from "./TagGraph.module.css"
import { useT } from "./LanguageProvider"
import { formatDate } from "@/lib/format"
import type { GraphData, GraphNode } from "@/lib/content"

type SimNode = GraphNode & d3.SimulationNodeDatum & { r: number; baseR: number }
type SimEdge = d3.SimulationLinkDatum<SimNode>

// Imperative handle the React overlay uses to drive the canvas simulation.
type GraphApi = {
  setTagsVisible: (visible: boolean) => void
  setOrphansVisible: (visible: boolean) => void
  focusNode: (id: string) => void
  setSearch: (query: string) => void
  setArrows: (visible: boolean) => void
  setTextFadeOffset: (value: number) => void
  setNodeSize: (mult: number) => void
  setLinkThickness: (mult: number) => void
  setForces: (opts: { center?: number; repel?: number; link?: number; distance?: number }) => void
  startAnimate: () => void
  stopAnimate: () => void
  togglePlay: () => void
  seekAnimate: (index: number) => void
}

type AnimateState = { active: boolean; playing: boolean; index: number; total: number; date: string | null }
const ANIMATE_IDLE: AnimateState = { active: false, playing: false, index: 0, total: 0, date: null }

const DEFAULT_FORCES = { center: 1, repel: 170, link: 1, distance: 30 }

const SHOW_TAGS_KEY = "graph.showTags"

// Node color + base opacity per type. Blog posts and chapters are the neutral
// "default note" slots (Obsidian-style); the chromatic set (blue/emerald/amber)
// is CVD-validated against each theme's surface.
type Palette = {
  node: Record<GraphNode["type"], [color: string, alpha: number]>
  edge: string
  edgeAlpha: number
  accent: string
  label: string
}

const DARK: Palette = {
  node: {
    hub: ["#3b82f6", 1],
    tag: ["#3b82f6", 0.8],
    blog: ["#e2e8f0", 0.92],
    note: ["#059669", 1],
    chapter: ["#cbd5e1", 0.55],
    creation: ["#d97706", 1],
  },
  edge: "#94a3b8",
  edgeAlpha: 0.16,
  accent: "#3b82f6",
  label: "rgba(255,255,255,0.92)",
}

const LIGHT: Palette = {
  node: {
    hub: ["#1d4ed8", 1],
    tag: ["#1d4ed8", 0.8],
    blog: ["#3f3f46", 0.9],
    note: ["#047857", 1],
    chapter: ["#525252", 0.55],
    creation: ["#b45309", 1],
  },
  edge: "#475569",
  edgeAlpha: 0.18,
  accent: "#1d4ed8",
  label: "rgba(40,40,46,0.92)",
}

// ── Small presentational pieces for the settings sidebar ────────────────────
// Kept at module scope (not nested in TagGraph) so they have a stable identity
// across renders — nesting them would remount the DOM (and drop input focus)
// on every state change.

const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) => (
  <label className={styles.toggleRow}>
    <span>{label}</span>
    <input
      type="checkbox"
      className={styles.switch}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
)

const SliderRow = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) => (
  <div className={styles.sliderRow}>
    <span className={styles.sliderLabel}>{label}</span>
    <div className={styles.sliderInputRow}>
      <span className={styles.sliderValue}>{(format ?? ((v: number) => v.toFixed(2)))(value)}</span>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  </div>
)

const Section = ({
  title,
  collapsed,
  onToggle,
  action,
  children,
}: {
  title: string
  collapsed: boolean
  onToggle: () => void
  action?: ReactNode
  children: ReactNode
}) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader}>
      <button type="button" className={styles.sectionToggle} onClick={onToggle} aria-expanded={!collapsed}>
        <ChevronDown className={styles.chevron} data-collapsed={collapsed} size={14} />
        <span>{title}</span>
      </button>
      {action}
    </div>
    {!collapsed && <div className={styles.sectionBody}>{children}</div>}
  </div>
)

const LABEL_WRAP_PX = 118
const LABEL_MAX_LINES = 3

export const TagGraph = ({
  data,
  hideOverlay = false,
  currentId,
  className,
}: {
  data: GraphData
  hideOverlay?: boolean
  /** Highlight this node as "you are here" (used by the per-page local graph). */
  currentId?: string
  className?: string
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apiRef = useRef<GraphApi | null>(null)
  const router = useRouter()
  const t = useT()

  const [showTags, setShowTags] = useState(true)
  const [showOrphans, setShowOrphans] = useState(true)
  const [showArrows, setShowArrows] = useState(false)
  const [query, setQuery] = useState("")
  const [panelOpen, setPanelOpen] = useState(true)
  const [collapsed, setCollapsed] = useState({ filters: false, display: false, forces: false })
  const [textFade, setTextFade] = useState(0)
  const [nodeSize, setNodeSize] = useState(1)
  const [linkThickness, setLinkThickness] = useState(1)
  const [forces, setForcesState] = useState(DEFAULT_FORCES)
  const [anim, setAnim] = useState<AnimateState>(ANIMATE_IDLE)

  const hasTimeline = useMemo(() => data.nodes.some((n) => n.date), [data])

  const toggleSection = (key: keyof typeof collapsed) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }))

  // First run only syncs React state to the persisted value (the canvas build
  // reads localStorage itself); later runs persist + apply toggle changes.
  const syncedOnce = useRef(false)
  useEffect(() => {
    if (!syncedOnce.current) {
      syncedOnce.current = true
      try {
        setShowTags(localStorage.getItem(SHOW_TAGS_KEY) !== "0")
      } catch {}
      return
    }
    try {
      localStorage.setItem(SHOW_TAGS_KEY, showTags ? "1" : "0")
    } catch {}
    apiRef.current?.setTagsVisible(showTags)
  }, [showTags])

  // Ensures the target is actually visible (tags/orphans re-enabled if needed)
  // before zooming to it — used by the search box's Enter-to-jump.
  const locateNode = useCallback((id: string) => {
    apiRef.current?.setTagsVisible(true)
    apiRef.current?.setOrphansVisible(true)
    apiRef.current?.focusNode(id)
    setShowTags(true)
    setShowOrphans(true)
  }, [])

  const onSearchChange = (v: string) => {
    setQuery(v)
    apiRef.current?.setSearch(v)
  }
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    const q = query.trim().toLowerCase()
    if (!q) return
    const match = data.nodes.find((n) => n.label.toLowerCase().includes(q))
    if (match) locateNode(match.id)
  }

  const resetAll = () => {
    setShowTags(true)
    setShowOrphans(true)
    apiRef.current?.setOrphansVisible(true)
    setShowArrows(false)
    apiRef.current?.setArrows(false)
    setQuery("")
    apiRef.current?.setSearch("")
    setTextFade(0)
    apiRef.current?.setTextFadeOffset(0)
    setNodeSize(1)
    apiRef.current?.setNodeSize(1)
    setLinkThickness(1)
    apiRef.current?.setLinkThickness(1)
    setForcesState(DEFAULT_FORCES)
    apiRef.current?.setForces(DEFAULT_FORCES)
    apiRef.current?.stopAnimate()
  }

  const buildGraph = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return () => {}

    const container = canvas.parentElement!
    let w = container.clientWidth
    let h = container.clientHeight
    const dpr = Math.min(window.devicePixelRatio, 2)
    const sizeCanvas = () => {
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    sizeCanvas()
    const ctx = canvas.getContext("2d")!
    const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif"
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // ── Graph model ─────────────────────────────────────────────────────────
    // Node size scales with link count, like Obsidian's graph.
    const degree = new Map<string, number>()
    for (const e of data.edges) {
      degree.set(e.source, (degree.get(e.source) ?? 0) + 1)
      degree.set(e.target, (degree.get(e.target) ?? 0) + 1)
    }
    const baseRadiusOf = (n: GraphNode) => {
      const base = n.type === "tag" ? 2.5 : n.type === "chapter" ? 3 : 3.5
      return Math.min(base + Math.sqrt(degree.get(n.id) ?? 0) * 1.8, 18)
    }
    // Mirrors d3-force's own default forceLink strength (1 / min shared degree)
    // so a "link force" multiplier of 1 reproduces the untouched default feel.
    const defaultLinkStrength = (e: SimEdge) => {
      const s = e.source as SimNode
      const tg = e.target as SimNode
      return 1 / Math.max(1, Math.min(degree.get(s.id) ?? 1, degree.get(tg.id) ?? 1))
    }

    const simNodes: SimNode[] = data.nodes.map((n) => {
      const baseR = baseRadiusOf(n)
      return { ...n, baseR, r: baseR }
    })
    const simEdges: SimEdge[] = data.edges.map((e) => ({ ...e }))
    const current = currentId ? (simNodes.find((n) => n.id === currentId) ?? null) : null

    // ── Forces (live-tunable via the Forces panel) ────────────────────────────
    const cx = w / 2
    const cy = h / 2
    let centerMult = DEFAULT_FORCES.center
    let repelMag = DEFAULT_FORCES.repel
    let linkForceMult = DEFAULT_FORCES.link
    let linkDistanceBase = DEFAULT_FORCES.distance
    let nodeSizeMult = 1

    const linkForce = d3
      .forceLink<SimNode, SimEdge>(simEdges)
      .id((n) => n.id)
      .distance((e) => linkDistanceBase + (e.source as SimNode).r + (e.target as SimNode).r)
      .strength((e) => defaultLinkStrength(e) * linkForceMult)
    const chargeForce = d3.forceManyBody<SimNode>().strength(-repelMag).distanceMax(420)
    const xForce = d3.forceX<SimNode>(cx).strength(0.055 * centerMult)
    const yForce = d3.forceY<SimNode>(cy).strength(0.055 * centerMult)
    const collisionForce = d3.forceCollide<SimNode>().radius((n) => n.r + 4).strength(0.7)
    const sim = d3
      .forceSimulation(simNodes)
      .force("link", linkForce)
      .force("charge", chargeForce)
      .force("x", xForce)
      .force("y", yForce)
      .force("collision", collisionForce)
      .stop() // ticks are driven by the rAF loop below

    // The embedded home graph is a right-weighted backdrop behind the hero
    // text, so it frames into the right portion of the canvas; every other
    // graph fills and centers the whole viewport.
    const isHomeGraph = hideOverlay && !current

    // ── Tag / orphan visibility filters ──────────────────────────────────────
    // Hidden nodes stay in `simNodes` (keeping their positions) but leave the
    // simulation and every render/hit/highlight structure.
    let tagsVisible = true
    try {
      tagsVisible = localStorage.getItem(SHOW_TAGS_KEY) !== "0"
    } catch {}
    let orphansVisible = true

    let visNodes: SimNode[] = simNodes
    let visEdges: SimEdge[] = simEdges
    let neighbors = new Map<string, Set<string>>()
    const computeVisible = () => {
      visNodes = simNodes.filter(
        (n) => (tagsVisible || n.type !== "tag") && (orphansVisible || (degree.get(n.id) ?? 0) > 0),
      )
      visEdges = tagsVisible
        ? simEdges
        : simEdges.filter(
            (e) => (e.source as SimNode).type !== "tag" && (e.target as SimNode).type !== "tag",
          )
      neighbors = new Map()
      for (const n of visNodes) neighbors.set(n.id, new Set([n.id]))
      for (const e of visEdges) {
        const s = e.source as SimNode
        const tg = e.target as SimNode
        if (!neighbors.has(s.id) || !neighbors.has(tg.id)) continue
        neighbors.get(s.id)!.add(tg.id)
        neighbors.get(tg.id)!.add(s.id)
      }
    }
    computeVisible()
    if (visNodes.length !== simNodes.length) {
      sim.nodes(visNodes)
      linkForce.links(visEdges)
    }

    // Settle off-screen first so mount doesn't show the initial explosion,
    // then let the tail of the decay play as Obsidian's gentle drift-in.
    for (let i = 0; i < (reducedMotion ? 300 : 60); i++) sim.tick()

    // ── Viewport ────────────────────────────────────────────────────────────
    let panX = 0
    let panY = 0
    let zoom = 1

    // The home graph shares the hero section with the text column, which is
    // laid out by page.module.css as a 50%-wide block inside a side-padded,
    // max-width-capped container (--main-padding-sides / --main-max-width).
    // Mirroring that formula from the container's own measured width — rather
    // than guessing a fixed fraction — means the graph's fit region always
    // starts exactly past the text's real right edge, at any viewport size.
    const homeFitRegion = (containerW: number) => {
      const padding = Math.min(Math.max(containerW * 0.05, 20), 100)
      const available = containerW - padding * 2
      const innerW = Math.min(available, 1350)
      const innerLeft = padding + Math.max(0, (available - innerW) / 2)
      const textRight = innerLeft + innerW * 0.5
      const gutter = 32
      const left = Math.min(Math.max(textRight + gutter, containerW * 0.3), containerW - 120)
      return { left, fitW: Math.max(160, containerW - left - gutter) }
    }

    const zoomToFit = () => {
      const xs = visNodes.map((n) => n.x!)
      const ys = visNodes.map((n) => n.y!)
      const pad = 48
      const bw = Math.max(...xs) - Math.min(...xs) + pad * 2
      const bh = Math.max(...ys) - Math.min(...ys) + pad * 2
      const { left, fitW } = isHomeGraph ? homeFitRegion(w) : { left: 0, fitW: w }
      const anchorX = isHomeGraph ? left + fitW / 2 : w / 2
      zoom = Math.min(Math.max(Math.min(fitW / bw, h / bh), 0.3), 1.4)
      panX = anchorX - ((Math.max(...xs) + Math.min(...xs)) / 2) * zoom
      panY = h / 2 - ((Math.max(...ys) + Math.min(...ys)) / 2) * zoom
    }
    zoomToFit()

    // ── Interaction state ───────────────────────────────────────────────────
    let hovered: SimNode | null = null
    let focusSet: Set<string> | null = null
    let fade = 0 // 0 = everything full, 1 = non-neighbors muted
    let fadeTarget = 0
    let viewTarget: { node: SimNode; zoom: number } | null = null
    let draggingNode: SimNode | null = null
    let panning = false
    let panStart = { x: 0, y: 0 }
    let pointerDownPos = { x: 0, y: 0 }
    let didMove = false
    const pointers = new Map<number, { x: number; y: number }>()
    let pinchDist = 0

    const getPalette = () =>
      document.documentElement.getAttribute("data-theme") === "light" ? LIGHT : DARK

    const toSim = (mx: number, my: number) => ({
      x: (mx - panX) / zoom,
      y: (my - panY) / zoom,
    })

    // ── Timeline playback ("Animate") ─────────────────────────────────────────
    // Doc nodes (blog/note/chapter/creation) reveal chronologically by publish
    // date; tags/hubs are structural and stay visible throughout. Positions are
    // never re-simulated during playback — only draw-time visibility changes.
    const datedNodes = simNodes
      .filter((n): n is SimNode & { date: string } => Boolean(n.date))
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
    const revealIndex = new Map<string, number>()
    datedNodes.forEach((n, i) => revealIndex.set(n.id, i))
    const ANIMATE_TOTAL = datedNodes.length
    const STEP_MS = Math.max(70, Math.min(500, 9000 / Math.max(1, ANIMATE_TOTAL)))
    const POP_MS = 320

    let animateActive = false
    let animatePlaying = false
    let animateIndex = 0
    let animateElapsed = 0
    let lastFrameTime = performance.now()
    const poppedAt = new Map<string, number>()

    const isRevealed = (n: SimNode) =>
      !animateActive || !n.date || (revealIndex.get(n.id) ?? Infinity) < animateIndex

    const popFactor = (n: SimNode): { scale: number; alpha: number } => {
      if (!animateActive || !n.date) return { scale: 1, alpha: 1 }
      const startedAt = poppedAt.get(n.id)
      if (startedAt === undefined) return { scale: 1, alpha: 1 }
      const t = Math.min(1, (performance.now() - startedAt) / POP_MS)
      if (t >= 1) return { scale: 1, alpha: 1 }
      const eased = 1 - Math.pow(1 - t, 3)
      return { scale: 0.3 + 0.7 * eased + Math.sin(t * Math.PI) * 0.12, alpha: eased }
    }

    const reportAnimate = () =>
      setAnim({
        active: animateActive,
        playing: animatePlaying,
        index: animateIndex,
        total: ANIMATE_TOTAL,
        date: animateIndex > 0 ? (datedNodes[Math.min(animateIndex, ANIMATE_TOTAL) - 1]?.date ?? null) : null,
      })

    const revealUpTo = (index: number, animatePops: boolean) => {
      const now = performance.now()
      const clamped = Math.max(0, Math.min(index, ANIMATE_TOTAL))
      if (clamped > animateIndex) {
        for (let i = animateIndex; i < clamped; i++) {
          poppedAt.set(datedNodes[i].id, animatePops ? now : now - POP_MS)
        }
      }
      animateIndex = clamped
    }

    const startAnimate = () => {
      animateActive = true
      animatePlaying = true
      animateIndex = 0
      animateElapsed = 0
      lastFrameTime = performance.now()
      poppedAt.clear()
      setHovered(null)
      reportAnimate()
      kick()
    }
    const stopAnimate = () => {
      animateActive = false
      animatePlaying = false
      reportAnimate()
      kick()
    }
    const togglePlay = () => {
      if (!animateActive) return
      if (!animatePlaying && animateIndex >= ANIMATE_TOTAL) {
        animateIndex = 0
        poppedAt.clear()
      }
      animatePlaying = !animatePlaying
      animateElapsed = 0
      lastFrameTime = performance.now()
      reportAnimate()
      kick()
    }
    const seekAnimate = (index: number) => {
      animatePlaying = false
      revealUpTo(index, false)
      reportAnimate()
      kick()
    }

    // ── Search ──────────────────────────────────────────────────────────────
    // null = no active query (nothing dimmed); non-null Set = active query,
    // matches stay full opacity, everything else dims (Obsidian-style).
    let searchMatches: Set<string> | null = null
    const applySearch = (q: string) => {
      const query = q.trim().toLowerCase()
      searchMatches = query
        ? new Set(simNodes.filter((n) => n.label.toLowerCase().includes(query)).map((n) => n.id))
        : null
      kick()
    }

    const hitNode = (sx: number, sy: number) => {
      for (let i = visNodes.length - 1; i >= 0; i--) {
        const n = visNodes[i]
        if (n.x == null || n.y == null) continue
        if (animateActive && !isRevealed(n)) continue
        if (Math.hypot(n.x - sx, n.y - sy) < n.r + 5 / zoom) return n
      }
      return null
    }

    // ── Labels ────────────────────────────────────────────────────────────────
    // Pre-wrap node labels into stacked lines so long names don't overrun their
    // neighbours. Zoom-independent: measureText ignores the canvas transform, so
    // wrapping at a fixed 11px reference matches the 11px-on-screen draw size at
    // every zoom. Space-less names (CJK) and over-long tokens are char-broken.
    const labelLines = new Map<string, string[]>()
    ctx.font = `11px ${fontFamily}`
    const measureLabel = (s: string) => ctx.measureText(s).width
    const wrapLabel = (text: string): string[] => {
      const lines: string[] = []
      let line = ""
      for (let word of text.split(/\s+/)) {
        // Hard-break a single token that can't fit on a line (URLs, CJK runs).
        while (word && measureLabel(word) > LABEL_WRAP_PX && word.length > 1) {
          let i = 1
          while (i < word.length && measureLabel(word.slice(0, i + 1)) <= LABEL_WRAP_PX) i++
          if (line) {
            lines.push(line)
            line = ""
          }
          lines.push(word.slice(0, i))
          word = word.slice(i)
        }
        if (!word) continue
        const candidate = line ? `${line} ${word}` : word
        if (line && measureLabel(candidate) > LABEL_WRAP_PX) {
          lines.push(line)
          line = word
        } else {
          line = candidate
        }
      }
      if (line) lines.push(line)
      if (lines.length > LABEL_MAX_LINES) {
        lines.length = LABEL_MAX_LINES
        let last = lines[LABEL_MAX_LINES - 1]
        while (last.length > 1 && measureLabel(`${last}…`) > LABEL_WRAP_PX) last = last.slice(0, -1)
        lines[LABEL_MAX_LINES - 1] = `${last}…`
      }
      return lines.length ? lines : [text]
    }
    for (const n of simNodes) labelLines.set(n.id, wrapLabel(n.label))

    // ── Render ──────────────────────────────────────────────────────────────
    const lerp = (a: number, b: number, k: number) => a + (b - a) * k
    let textFadeOffset = 0
    let linkThicknessMult = 1
    let arrowsEnabled = false

    const draw = () => {
      const colors = getPalette()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * panX, dpr * panY)

      // Labels fade in as you zoom, Obsidian-style. The embedded home graph is
      // decorative, so it keeps labels hidden until hovered or zoomed further —
      // unless a current node is set (local graph), where labels are navigation.
      const labelFadeStart = (hideOverlay && !current ? 1.05 : 0.7) - textFadeOffset
      const zoomLabelAlpha = Math.min(Math.max((zoom - labelFadeStart) / 0.55, 0), 1)
      const inFocus = (id: string) => !focusSet || focusSet.has(id)
      const dimOf = (id: string) => (searchMatches === null || searchMatches.has(id) ? 1 : 0.1)

      // Edges — neighborhood edges tint to the accent on hover, the rest mute
      // (still visible, never erased). Search matches stay full strength.
      ctx.lineWidth = (1 / zoom) * linkThicknessMult
      for (const e of visEdges) {
        const s = e.source as SimNode
        const tg = e.target as SimNode
        if (s.x == null || s.y == null || tg.x == null || tg.y == null) continue
        if (animateActive && (!isRevealed(s) || !isRevealed(tg))) continue
        const dim = Math.min(dimOf(s.id), dimOf(tg.id))
        const touches = hovered && (s.id === hovered.id || tg.id === hovered.id)
        if (touches) {
          ctx.strokeStyle = colors.accent
          ctx.globalAlpha = lerp(colors.edgeAlpha, 0.65, fade) * dim
        } else {
          ctx.strokeStyle = colors.edge
          ctx.globalAlpha = colors.edgeAlpha * lerp(1, 0.4, fade) * dim
        }
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tg.x, tg.y)
        ctx.stroke()

        if (arrowsEnabled) {
          const dx = tg.x - s.x
          const dy = tg.y - s.y
          const dist = Math.hypot(dx, dy) || 1
          const ux = dx / dist
          const uy = dy / dist
          const tipX = tg.x - ux * (tg.r + 2 / zoom)
          const tipY = tg.y - uy * (tg.r + 2 / zoom)
          const ah = 4.5 / zoom
          ctx.beginPath()
          ctx.moveTo(tipX, tipY)
          ctx.lineTo(tipX - ux * ah - uy * ah * 0.55, tipY - uy * ah + ux * ah * 0.55)
          ctx.lineTo(tipX - ux * ah + uy * ah * 0.55, tipY - uy * ah - ux * ah * 0.55)
          ctx.closePath()
          ctx.fillStyle = ctx.strokeStyle
          ctx.fill()
        }
      }

      // Nodes
      for (const n of visNodes) {
        if (n.x == null || n.y == null) continue
        if (animateActive && !isRevealed(n)) continue
        const pop = popFactor(n)
        if (pop.alpha <= 0) continue
        const [color, baseAlpha] = colors.node[n.type]
        const dim = dimOf(n.id)
        ctx.globalAlpha = (inFocus(n.id) ? baseAlpha : baseAlpha * lerp(1, 0.35, fade)) * dim * pop.alpha
        ctx.fillStyle = n === hovered || n === current ? colors.accent : color
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pop.scale, 0, 2 * Math.PI)
        ctx.fill()
      }

      // "You are here" ring on the current node
      if (current && current.x != null && current.y != null) {
        ctx.globalAlpha = 0.9
        ctx.strokeStyle = colors.accent
        ctx.lineWidth = 1.5 / zoom
        ctx.beginPath()
        ctx.arc(current.x, current.y, current.r + 3 / zoom, 0, 2 * Math.PI)
        ctx.stroke()
      }

      // Hover ring
      if (hovered && hovered.x != null && hovered.y != null) {
        ctx.globalAlpha = 0.9 * fade
        ctx.strokeStyle = colors.accent
        ctx.lineWidth = 1.5 / zoom
        ctx.beginPath()
        ctx.arc(hovered.x, hovered.y, hovered.r + 3 / zoom, 0, 2 * Math.PI)
        ctx.stroke()
      }

      // Labels — centered under nodes at constant screen size; hidden while
      // zoomed out, forced on for the hovered neighborhood or search matches.
      const fontSize = 11 / zoom
      ctx.textAlign = "center"
      for (const n of visNodes) {
        if (n.x == null || n.y == null) continue
        if (animateActive && !isRevealed(n)) continue
        const pop = popFactor(n)
        if (pop.alpha <= 0) continue
        const isHub = n.type === "hub"
        const focused = hovered !== null && focusSet !== null && focusSet.has(n.id)
        const searching = searchMatches !== null && searchMatches.has(n.id)
        let alpha = isHub ? Math.max(zoomLabelAlpha, 0.85) : zoomLabelAlpha * 0.8
        if (n === current) alpha = Math.max(alpha, 0.9)
        if (hovered) {
          alpha = focused ? Math.max(alpha, fade) : alpha * lerp(1, 0.3, fade)
        }
        if (searchMatches !== null) alpha = searching ? Math.max(alpha, 0.9) : alpha * 0.15
        alpha *= pop.alpha
        if (alpha < 0.02) continue
        ctx.globalAlpha = alpha
        ctx.font = `${isHub || n === hovered || n === current ? "600 " : ""}${fontSize}px ${fontFamily}`
        ctx.fillStyle = n.type === "tag" ? colors.accent : colors.label
        let ly = n.y + n.r * pop.scale + fontSize + 3 / zoom
        for (const line of labelLines.get(n.id) ?? [n.label]) {
          ctx.fillText(line, n.x, ly)
          ly += fontSize * 1.18
        }
      }
      ctx.globalAlpha = 1
    }

    // ── Animation loop — runs only while the sim, a fade, the view-tween, a
    // timeline pop, or playback is active ─────────────────────────────────────
    let raf = 0
    const step = () => {
      raf = 0
      let active = false
      const now = performance.now()
      const dt = now - lastFrameTime
      lastFrameTime = now
      // alphaTarget > 0 must keep ticking even after alpha has fully decayed,
      // otherwise dragging a settled graph does nothing.
      if (sim.alpha() > sim.alphaMin() || sim.alphaTarget() > 0) {
        sim.tick()
        active = true
      }
      if (reducedMotion) {
        fade = fadeTarget
      } else if (Math.abs(fade - fadeTarget) > 0.015) {
        fade = lerp(fade, fadeTarget, 0.18)
        active = true
      } else {
        fade = fadeTarget
      }
      if (viewTarget && viewTarget.node.x != null && viewTarget.node.y != null) {
        // Track the node itself — it may still be drifting while we tween.
        const vz = viewTarget.zoom
        const tx = w / 2 - viewTarget.node.x * vz
        const ty = h / 2 - viewTarget.node.y * vz
        if (reducedMotion) {
          zoom = vz
          panX = tx
          panY = ty
          viewTarget = null
        } else {
          zoom = lerp(zoom, vz, 0.16)
          panX = lerp(panX, tx, 0.16)
          panY = lerp(panY, ty, 0.16)
          if (Math.abs(zoom - vz) < 0.002 && Math.abs(panX - tx) < 0.5 && Math.abs(panY - ty) < 0.5) {
            viewTarget = null
          } else {
            active = true
          }
        }
      }
      if (animatePlaying) {
        animateElapsed += dt
        if (animateElapsed >= STEP_MS) {
          const steps = Math.floor(animateElapsed / STEP_MS)
          animateElapsed -= steps * STEP_MS
          revealUpTo(animateIndex + steps, true)
          if (animateIndex >= ANIMATE_TOTAL) animatePlaying = false
          reportAnimate()
        }
        active = true
      }
      if (animateActive && !reducedMotion) {
        for (const ts of poppedAt.values()) {
          if (now - ts < POP_MS) {
            active = true
            break
          }
        }
      }
      draw()
      if (active) kick()
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step)
    }
    kick()

    const setHovered = (n: SimNode | null) => {
      if (n === hovered) return
      hovered = n
      if (n) focusSet = neighbors.get(n.id) ?? null
      fadeTarget = n ? 1 : 0
      canvas.style.cursor = n ? "pointer" : "grab"
      kick()
    }

    // ── Overlay API (filters, display, forces, timeline) ─────────────────────
    const applyVisibilityChange = () => {
      computeVisible()
      sim.nodes(visNodes)
      linkForce.links(visEdges)
      if (hovered && !neighbors.has(hovered.id)) setHovered(null)
      else if (hovered) focusSet = neighbors.get(hovered.id) ?? null
      sim.alpha(reducedMotion ? 0.3 : 0.5) // reflow the layout around the change
      kick()
    }
    const setTagsVisible = (visible: boolean) => {
      if (visible === tagsVisible) return
      tagsVisible = visible
      applyVisibilityChange()
    }
    const setOrphansVisible = (visible: boolean) => {
      if (visible === orphansVisible) return
      orphansVisible = visible
      applyVisibilityChange()
    }

    const focusNode = (id: string) => {
      const n = simNodes.find((x) => x.id === id)
      if (!n || n.x == null || n.y == null) return
      viewTarget = { node: n, zoom: Math.max(zoom, 1.35) }
      setHovered(n)
      kick()
    }

    const setArrows = (v: boolean) => {
      arrowsEnabled = v
      kick()
    }
    const setTextFadeOffset = (v: number) => {
      textFadeOffset = v
      kick()
    }
    const setLinkThickness = (v: number) => {
      linkThicknessMult = v
      kick()
    }
    const setNodeSize = (mult: number) => {
      nodeSizeMult = mult
      for (const n of simNodes) n.r = n.baseR * nodeSizeMult
      collisionForce.radius((n) => n.r + 4)
      linkForce.distance((e) => linkDistanceBase + (e.source as SimNode).r + (e.target as SimNode).r)
      sim.alpha(0.4)
      kick()
    }
    const setForces = (opts: { center?: number; repel?: number; link?: number; distance?: number }) => {
      if (opts.center !== undefined) {
        centerMult = opts.center
        xForce.strength(0.055 * centerMult)
        yForce.strength(0.055 * centerMult)
      }
      if (opts.repel !== undefined) {
        repelMag = opts.repel
        chargeForce.strength(-repelMag)
      }
      if (opts.link !== undefined) {
        linkForceMult = opts.link
        linkForce.strength((e) => defaultLinkStrength(e) * linkForceMult)
      }
      if (opts.distance !== undefined) {
        linkDistanceBase = opts.distance
        linkForce.distance((e) => linkDistanceBase + (e.source as SimNode).r + (e.target as SimNode).r)
      }
      sim.alpha(0.4)
      kick()
    }

    apiRef.current = {
      setTagsVisible,
      setOrphansVisible,
      focusNode,
      setSearch: applySearch,
      setArrows,
      setTextFadeOffset,
      setNodeSize,
      setLinkThickness,
      setForces,
      startAnimate,
      stopAnimate,
      togglePlay,
      seekAnimate,
    }

    // ── Events ──────────────────────────────────────────────────────────────
    // Full-page graph zooms on plain scroll; the embedded home graph must not
    // hijack page scroll, so it only zooms on ctrl+wheel / trackpad pinch.
    const applyZoom = (mx: number, my: number, factor: number) => {
      const next = Math.min(Math.max(zoom * factor, 0.2), 5)
      panX = mx - (mx - panX) * (next / zoom)
      panY = my - (my - panY) * (next / zoom)
      zoom = next
      kick()
    }

    const onWheel = (e: WheelEvent) => {
      if (hideOverlay && !e.ctrlKey) return
      e.preventDefault()
      viewTarget = null
      const rect = canvas.getBoundingClientRect()
      applyZoom(e.clientX - rect.left, e.clientY - rect.top, 1 + e.deltaY * -0.0016)
    }

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId)
      viewTarget = null
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      pointers.set(e.pointerId, { x: mx, y: my })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
        draggingNode = null
        panning = false
        return
      }
      pointerDownPos = { x: mx, y: my }
      didMove = false
      const { x: sx, y: sy } = toSim(mx, my)
      const hit = hitNode(sx, sy)
      if (hit) {
        draggingNode = hit
        hit.fx = hit.x
        hit.fy = hit.y
        sim.alphaTarget(0.3)
        kick()
      } else {
        panning = true
        panStart = { x: mx - panX, y: my - panY }
      }
      canvas.style.cursor = "grabbing"
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: mx, y: my })
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchDist > 0) applyZoom((a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinchDist)
        pinchDist = dist
        return
      }

      if (Math.hypot(mx - pointerDownPos.x, my - pointerDownPos.y) > 4) didMove = true

      if (draggingNode) {
        const { x: sx, y: sy } = toSim(mx, my)
        draggingNode.fx = sx
        draggingNode.fy = sy
        kick()
        return
      }
      if (panning) {
        panX = mx - panStart.x
        panY = my - panStart.y
        kick()
        return
      }
      const { x: sx, y: sy } = toSim(mx, my)
      setHovered(hitNode(sx, sy))
    }

    const endPointer = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchDist = 0
    }

    const releaseDrag = () => {
      if (draggingNode) {
        draggingNode.fx = undefined
        draggingNode.fy = undefined
        draggingNode = null
        sim.alphaTarget(0)
      }
      panning = false
    }

    const onPointerUp = (e: PointerEvent) => {
      endPointer(e)
      const rect = canvas.getBoundingClientRect()
      const { x: sx, y: sy } = toSim(e.clientX - rect.left, e.clientY - rect.top)

      if (!didMove) {
        const target = draggingNode ?? hitNode(sx, sy)
        if (target) router.push(target.href)
      }
      releaseDrag()
      canvas.style.cursor = hovered ? "pointer" : "grab"
    }

    const onPointerCancel = (e: PointerEvent) => {
      endPointer(e)
      releaseDrag()
    }

    const onPointerLeave = () => setHovered(null)

    const onResize = () => {
      w = container.clientWidth
      h = container.clientHeight
      sizeCanvas()
      // The home graph is a decorative backdrop with no user-facing pan/zoom
      // state worth preserving, so keep it recentered against the text column
      // on every resize; the full-page /tags graph and local graphs keep
      // whatever view the visitor left them in.
      if (isHomeGraph) {
        viewTarget = null
        zoomToFit()
      }
      kick()
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    canvas.addEventListener("pointercancel", onPointerCancel)
    canvas.addEventListener("pointerleave", onPointerLeave)
    const ro = new ResizeObserver(onResize)
    ro.observe(container)
    // Redraw when the theme toggles (colors are read per-frame).
    const mo = new MutationObserver(kick)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    return () => {
      apiRef.current = null
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      canvas.removeEventListener("pointercancel", onPointerCancel)
      canvas.removeEventListener("pointerleave", onPointerLeave)
      ro.disconnect()
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
      sim.stop()
    }
  }, [data, router, hideOverlay, currentId])

  useEffect(() => buildGraph(), [buildGraph])

  return (
    <div className={className ?? styles.wrapper}>
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvas} />
        {!hideOverlay && (
          <>
            <div className={styles.legend} aria-hidden="true">
              <span className={styles.dot} data-type="hub" /> {t("graph.hub")}
              <span className={styles.dot} data-type="tag" /> {t("graph.tag")}
              <span className={styles.dot} data-type="blog" /> {t("graph.blog")}
              <span className={styles.dot} data-type="note" /> {t("graph.note")}
              <span className={styles.dot} data-type="chapter" /> {t("graph.chapter")}
              <span className={styles.dot} data-type="creation" /> {t("graph.creation")}
            </div>
            <p className={styles.hint}>{t("ui.scrollHint")}</p>
            {!panelOpen && (
              <button
                type="button"
                className={styles.reopenBtn}
                onClick={() => setPanelOpen(true)}
                aria-label={t("graph.openPanel")}
              >
                <SlidersHorizontal size={16} />
              </button>
            )}
          </>
        )}
      </div>

      {!hideOverlay && panelOpen && (
        <aside className={styles.panel}>
          <div className={styles.panelScroll}>
            <Section
              title={t("graph.filters")}
              collapsed={collapsed.filters}
              onToggle={() => toggleSection("filters")}
              action={
                <div className={styles.panelActions}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={resetAll}
                    aria-label={t("graph.reset")}
                    title={t("graph.reset")}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => setPanelOpen(false)}
                    aria-label={t("graph.closePanel")}
                    title={t("graph.closePanel")}
                  >
                    <X size={14} />
                  </button>
                </div>
              }
            >
              <div className={styles.searchRow}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  type="search"
                  className={styles.search}
                  value={query}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={onSearchKeyDown}
                  placeholder={t("graph.searchFiles")}
                  aria-label={t("graph.searchFiles")}
                />
              </div>
              <ToggleRow
                label={t("graph.showTags")}
                checked={showTags}
                onChange={(v) => setShowTags(v)}
              />
              <ToggleRow
                label={t("graph.orphans")}
                checked={showOrphans}
                onChange={(v) => {
                  setShowOrphans(v)
                  apiRef.current?.setOrphansVisible(v)
                }}
              />
            </Section>

            <Section
              title={t("graph.display")}
              collapsed={collapsed.display}
              onToggle={() => toggleSection("display")}
            >
              <ToggleRow
                label={t("graph.arrows")}
                checked={showArrows}
                onChange={(v) => {
                  setShowArrows(v)
                  apiRef.current?.setArrows(v)
                }}
              />
              <SliderRow
                label={t("graph.textFade")}
                value={textFade}
                min={-1}
                max={1}
                step={0.01}
                onChange={(v) => {
                  setTextFade(v)
                  apiRef.current?.setTextFadeOffset(v)
                }}
              />
              <SliderRow
                label={t("graph.nodeSize")}
                value={nodeSize}
                min={0.4}
                max={3}
                step={0.01}
                onChange={(v) => {
                  setNodeSize(v)
                  apiRef.current?.setNodeSize(v)
                }}
              />
              <SliderRow
                label={t("graph.linkThickness")}
                value={linkThickness}
                min={0.2}
                max={5}
                step={0.01}
                onChange={(v) => {
                  setLinkThickness(v)
                  apiRef.current?.setLinkThickness(v)
                }}
              />

              {hasTimeline &&
                (!anim.active ? (
                  <button
                    type="button"
                    className={styles.animateBtn}
                    onClick={() => apiRef.current?.startAnimate()}
                  >
                    <Play size={13} /> {t("graph.animate")}
                  </button>
                ) : (
                  <div className={styles.timeline}>
                    <div className={styles.timelineControls}>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => apiRef.current?.togglePlay()}
                        aria-label={anim.playing ? t("graph.pause") : t("graph.animate")}
                      >
                        {anim.playing ? <Pause size={13} /> : <Play size={13} />}
                      </button>
                      <span className={styles.timelineDate}>
                        {anim.date ? formatDate(anim.date) : "—"}
                      </span>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => apiRef.current?.stopAnimate()}
                        aria-label={t("graph.closePanel")}
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <input
                      type="range"
                      className={styles.slider}
                      min={0}
                      max={anim.total}
                      step={1}
                      value={anim.index}
                      onChange={(e) => apiRef.current?.seekAnimate(Number(e.target.value))}
                    />
                  </div>
                ))}
            </Section>

            <Section
              title={t("graph.forces")}
              collapsed={collapsed.forces}
              onToggle={() => toggleSection("forces")}
            >
              <SliderRow
                label={t("graph.centerForce")}
                value={forces.center}
                min={0}
                max={3}
                step={0.01}
                onChange={(v) => {
                  setForcesState((f) => ({ ...f, center: v }))
                  apiRef.current?.setForces({ center: v })
                }}
              />
              <SliderRow
                label={t("graph.repelForce")}
                value={forces.repel}
                min={0}
                max={400}
                step={1}
                format={(v) => v.toFixed(0)}
                onChange={(v) => {
                  setForcesState((f) => ({ ...f, repel: v }))
                  apiRef.current?.setForces({ repel: v })
                }}
              />
              <SliderRow
                label={t("graph.linkForce")}
                value={forces.link}
                min={0}
                max={3}
                step={0.01}
                onChange={(v) => {
                  setForcesState((f) => ({ ...f, link: v }))
                  apiRef.current?.setForces({ link: v })
                }}
              />
              <SliderRow
                label={t("graph.linkDistance")}
                value={forces.distance}
                min={10}
                max={300}
                step={1}
                format={(v) => v.toFixed(0)}
                onChange={(v) => {
                  setForcesState((f) => ({ ...f, distance: v }))
                  apiRef.current?.setForces({ distance: v })
                }}
              />
            </Section>
          </div>
        </aside>
      )}
    </div>
  )
}
