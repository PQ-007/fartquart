"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import * as d3 from "d3"
import styles from "./TagGraph.module.css"
import { useT } from "./LanguageProvider"
import type { GraphData, GraphNode } from "@/lib/content"

type SimNode = GraphNode & d3.SimulationNodeDatum & { r: number }
type SimEdge = d3.SimulationLinkDatum<SimNode>

// Imperative handle the React overlay uses to drive the canvas simulation.
type GraphApi = {
  setTagsVisible: (visible: boolean) => void
  focusNode: (id: string) => void
}

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
  const [query, setQuery] = useState("")

  // Tag ToC: every tag with its link count, most-connected first.
  const tagList = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of data.edges) {
      for (const id of [e.source, e.target]) {
        if (id.startsWith("tag:")) counts.set(id, (counts.get(id) ?? 0) + 1)
      }
    }
    return data.nodes
      .filter((n) => n.type === "tag")
      .map((n) => ({ id: n.id, label: n.label, count: counts.get(n.id) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [data])

  const shownTags = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? tagList.filter((tag) => tag.label.toLowerCase().includes(q)) : tagList
  }, [tagList, query])

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

  const locateTag = (id: string) => {
    apiRef.current?.setTagsVisible(true)
    apiRef.current?.focusNode(id)
    if (!showTags) setShowTags(true)
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
    const radiusOf = (n: GraphNode) => {
      const base = n.type === "tag" ? 2.5 : n.type === "chapter" ? 3 : 3.5
      return Math.min(base + Math.sqrt(degree.get(n.id) ?? 0) * 1.8, 18)
    }

    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n, r: radiusOf(n) }))
    const simEdges: SimEdge[] = data.edges.map((e) => ({ ...e }))
    const current = currentId ? (simNodes.find((n) => n.id === currentId) ?? null) : null

    // ── Forces ──────────────────────────────────────────────────────────────
    const cx = w / 2
    const cy = h / 2
    const linkForce = d3
      .forceLink<SimNode, SimEdge>(simEdges)
      .id((n) => n.id)
      .distance((e) => 30 + (e.source as SimNode).r + (e.target as SimNode).r)
    const sim = d3
      .forceSimulation(simNodes)
      .force("link", linkForce)
      .force("charge", d3.forceManyBody<SimNode>().strength(-170).distanceMax(420))
      .force("x", d3.forceX(cx).strength(0.055))
      .force("y", d3.forceY(cy).strength(0.055))
      .force("collision", d3.forceCollide<SimNode>().radius((n) => n.r + 4).strength(0.7))
      .stop() // ticks are driven by the rAF loop below

    // ── Tag visibility filter ────────────────────────────────────────────────
    // Hidden nodes stay in `simNodes` (keeping their positions) but leave the
    // simulation and every render/hit/highlight structure.
    let tagsVisible = true
    try {
      tagsVisible = localStorage.getItem(SHOW_TAGS_KEY) !== "0"
    } catch {}

    let visNodes: SimNode[] = simNodes
    let visEdges: SimEdge[] = simEdges
    let neighbors = new Map<string, Set<string>>()
    const computeVisible = () => {
      visNodes = tagsVisible ? simNodes : simNodes.filter((n) => n.type !== "tag")
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
        neighbors.get(s.id)!.add(tg.id)
        neighbors.get(tg.id)!.add(s.id)
      }
    }
    computeVisible()
    if (!tagsVisible) {
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

    // The embedded home graph is a right-weighted backdrop behind the hero
    // text, so it frames into the right portion of the canvas; every other
    // graph fills and centers the whole viewport.
    const isHomeGraph = hideOverlay && !current
    const zoomToFit = () => {
      const xs = visNodes.map((n) => n.x!)
      const ys = visNodes.map((n) => n.y!)
      const pad = 48
      const bw = Math.max(...xs) - Math.min(...xs) + pad * 2
      const bh = Math.max(...ys) - Math.min(...ys) + pad * 2
      const fitW = isHomeGraph ? w * 0.5 : w
      const anchorX = isHomeGraph ? w * 0.74 : w / 2
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

    const hitNode = (sx: number, sy: number) => {
      for (let i = visNodes.length - 1; i >= 0; i--) {
        const n = visNodes[i]
        if (n.x == null || n.y == null) continue
        if (Math.hypot(n.x - sx, n.y - sy) < n.r + 5 / zoom) return n
      }
      return null
    }

    // ── Labels ────────────────────────────────────────────────────────────────
    // Pre-wrap node labels into stacked lines so long names don't overrun their
    // neighbours. Zoom-independent: measureText ignores the canvas transform, so
    // wrapping at a fixed 11px reference matches the 11px-on-screen draw size at
    // every zoom. Space-less names (CJK) and over-long tokens are char-broken.
    const LABEL_WRAP_PX = 118
    const LABEL_MAX_LINES = 3
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
          if (line) { lines.push(line); line = "" }
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

    const draw = () => {
      const colors = getPalette()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, dpr * panX, dpr * panY)

      // Labels fade in as you zoom, Obsidian-style. The embedded home graph is
      // decorative, so it keeps labels hidden until hovered or zoomed further —
      // unless a current node is set (local graph), where labels are navigation.
      const labelFadeStart = hideOverlay && !current ? 1.05 : 0.7
      const zoomLabelAlpha = Math.min(Math.max((zoom - labelFadeStart) / 0.55, 0), 1)
      const inFocus = (id: string) => !focusSet || focusSet.has(id)

      // Edges — neighborhood edges tint to the accent on hover, the rest mute
      // (still visible, never erased).
      ctx.lineWidth = 1 / zoom
      for (const e of visEdges) {
        const s = e.source as SimNode
        const tg = e.target as SimNode
        if (s.x == null || s.y == null || tg.x == null || tg.y == null) continue
        const touches = hovered && (s.id === hovered.id || tg.id === hovered.id)
        if (touches) {
          ctx.strokeStyle = colors.accent
          ctx.globalAlpha = lerp(colors.edgeAlpha, 0.65, fade)
        } else {
          ctx.strokeStyle = colors.edge
          ctx.globalAlpha = colors.edgeAlpha * lerp(1, 0.4, fade)
        }
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tg.x, tg.y)
        ctx.stroke()
      }

      // Nodes
      for (const n of visNodes) {
        if (n.x == null || n.y == null) continue
        const [color, baseAlpha] = colors.node[n.type]
        ctx.globalAlpha = inFocus(n.id) ? baseAlpha : baseAlpha * lerp(1, 0.35, fade)
        ctx.fillStyle = n === hovered || n === current ? colors.accent : color
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, 2 * Math.PI)
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
      // zoomed out, forced on for the hovered neighborhood.
      const fontSize = 11 / zoom
      ctx.textAlign = "center"
      for (const n of visNodes) {
        if (n.x == null || n.y == null) continue
        const isHub = n.type === "hub"
        const focused = hovered !== null && focusSet !== null && focusSet.has(n.id)
        let alpha = isHub ? Math.max(zoomLabelAlpha, 0.85) : zoomLabelAlpha * 0.8
        if (n === current) alpha = Math.max(alpha, 0.9)
        if (hovered) {
          alpha = focused ? Math.max(alpha, fade) : alpha * lerp(1, 0.3, fade)
        }
        if (alpha < 0.02) continue
        ctx.globalAlpha = alpha
        ctx.font = `${isHub || n === hovered || n === current ? "600 " : ""}${fontSize}px ${fontFamily}`
        ctx.fillStyle = n.type === "tag" ? colors.accent : colors.label
        let ly = n.y + n.r + fontSize + 3 / zoom
        for (const line of labelLines.get(n.id) ?? [n.label]) {
          ctx.fillText(line, n.x, ly)
          ly += fontSize * 1.18
        }
      }
      ctx.globalAlpha = 1
    }

    // ── Animation loop — runs only while the sim, a fade, or the view-tween
    // is active ──────────────────────────────────────────────────────────────
    let raf = 0
    const step = () => {
      raf = 0
      let active = false
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

    // ── Overlay API (tag toggle + ToC) ──────────────────────────────────────
    const setTagsVisible = (visible: boolean) => {
      if (visible === tagsVisible) return
      tagsVisible = visible
      computeVisible()
      sim.nodes(visNodes)
      linkForce.links(visEdges)
      if (hovered && !visible && hovered.type === "tag") setHovered(null)
      else if (hovered) focusSet = neighbors.get(hovered.id) ?? null
      sim.alpha(reducedMotion ? 0.3 : 0.5) // reflow the layout around the change
      kick()
    }

    const focusNode = (id: string) => {
      const n = simNodes.find((x) => x.id === id)
      if (!n || n.x == null || n.y == null) return
      viewTarget = { node: n, zoom: Math.max(zoom, 1.35) }
      setHovered(n)
      kick()
    }

    apiRef.current = { setTagsVisible, focusNode }

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
      <canvas ref={canvasRef} className={styles.canvas} />
      {!hideOverlay && (
        <>
          <div className={styles.panel}>
            <label className={styles.toggleRow}>
              <span>{t("graph.showTags")}</span>
              <input
                type="checkbox"
                className={styles.switch}
                checked={showTags}
                onChange={(e) => setShowTags(e.target.checked)}
              />
            </label>
            <input
              type="search"
              className={styles.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("graph.searchTags")}
              aria-label={t("graph.searchTags")}
            />
            <ul className={styles.tagList}>
              {shownTags.map((tag) => (
                <li key={tag.id}>
                  <button className={styles.tagItem} onClick={() => locateTag(tag.id)}>
                    <span className={styles.tagName}>#{tag.label}</span>
                    <span className={styles.tagCount}>{tag.count}</span>
                  </button>
                </li>
              ))}
              {shownTags.length === 0 && (
                <li className={styles.tagEmpty}>{t("ui.searchEmpty")}</li>
              )}
            </ul>
          </div>
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.dot} data-type="hub" /> {t("graph.hub")}
            <span className={styles.dot} data-type="tag" /> {t("graph.tag")}
            <span className={styles.dot} data-type="blog" /> {t("graph.blog")}
            <span className={styles.dot} data-type="note" /> {t("graph.note")}
            <span className={styles.dot} data-type="chapter" /> {t("graph.chapter")}
            <span className={styles.dot} data-type="creation" /> {t("graph.creation")}
          </div>
          <p className={styles.hint}>{t("ui.scrollHint")}</p>
        </>
      )}
    </div>
  )
}
