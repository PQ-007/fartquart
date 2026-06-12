"use client"

import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import * as d3 from "d3"
import styles from "./TagGraph.module.css"
import { useT } from "./LanguageProvider"
import type { GraphData, GraphNode } from "@/lib/content"

type SimNode = GraphNode & d3.SimulationNodeDatum
type SimEdge = d3.SimulationLinkDatum<SimNode> & {
  source: SimNode
  target: SimNode
}

const NODE_RADIUS: Record<GraphNode["type"], number> = {
  tag: 5,
  blog: 9,
  creation: 9,
}

const DARK_COLORS = {
  tag: "#818cf8",
  blog: "rgba(255,255,255,0.85)",
  creation: "rgba(255,255,255,0.55)",
  edge: "rgba(129,140,248,0.12)",
  label: "rgba(255,255,255,0.9)",
  tagLabel: "#818cf8",
}

const LIGHT_COLORS = {
  tag: "#6d28d9",
  blog: "rgba(87,87,87,0.85)",
  creation: "rgba(87,87,87,0.55)",
  edge: "rgba(109,40,217,0.15)",
  label: "rgba(87,87,87,0.9)",
  tagLabel: "#6d28d9",
}

export const TagGraph = ({ data }: { data: GraphData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const t = useT()

  const buildGraph = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return () => {}

    const container = canvas.parentElement!
    let w = container.clientWidth
    let h = container.clientHeight

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    const ctx = canvas.getContext("2d")!
    ctx.scale(dpr, dpr)

    // Copy nodes/edges so D3 can mutate them
    const simNodes: SimNode[] = data.nodes.map((n) => ({ ...n }))
    const simEdges: SimEdge[] = data.edges.map((e) => ({
      source: e.source as unknown as SimNode,
      target: e.target as unknown as SimNode,
    }))

    const sim = d3
      .forceSimulation(simNodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimEdge>(simEdges)
          .id((n) => n.id)
          .distance(90)
          .strength(0.5),
      )
      .force("charge", d3.forceManyBody<SimNode>().strength(-150))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force(
        "collision",
        d3.forceCollide<SimNode>().radius((n) => NODE_RADIUS[n.type] + 5),
      )

    // Pre-compute layout to stability
    sim.stop()
    for (let i = 0; i < 300; i++) sim.tick()

    // Pan / zoom state
    let panX = 0
    let panY = 0
    let zoom = 1

    // Interaction state
    let hovered: SimNode | null = null
    let draggingNode: SimNode | null = null
    let panning = false
    let panStart = { x: 0, y: 0 }
    let pointerDownPos = { x: 0, y: 0 }
    let didMove = false

    const getTheme = () =>
      document.documentElement.getAttribute("data-theme") === "light"
        ? LIGHT_COLORS
        : DARK_COLORS

    const toSim = (mx: number, my: number) => ({
      x: (mx - panX) / zoom,
      y: (my - panY) / zoom,
    })

    const hitNode = (sx: number, sy: number) =>
      simNodes.find(
        (n) =>
          n.x !== undefined &&
          n.y !== undefined &&
          Math.hypot(n.x - sx, n.y - sy) < NODE_RADIUS[n.type] + 6,
      ) ?? null

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const colors = getTheme()

      ctx.save()
      ctx.translate(panX, panY)
      ctx.scale(zoom, zoom)

      // Edges
      ctx.strokeStyle = colors.edge
      ctx.lineWidth = 1 / zoom
      for (const e of simEdges) {
        const s = e.source as SimNode
        const tgt = e.target as SimNode
        if (s.x == null || s.y == null || tgt.x == null || tgt.y == null) continue
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(tgt.x, tgt.y)
        ctx.stroke()
      }

      // Nodes
      for (const n of simNodes) {
        if (n.x == null || n.y == null) continue
        const r = NODE_RADIUS[n.type]
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, 2 * Math.PI)
        ctx.fillStyle = n === hovered ? colors.tag : colors[n.type]
        ctx.fill()
      }

      // Tag labels (always visible, small)
      ctx.font = `${11 / zoom}px var(--font-neue, sans-serif)`
      for (const n of simNodes) {
        if (n.x == null || n.y == null) continue
        if (n.type === "tag") {
          ctx.fillStyle = colors.tagLabel
          ctx.globalAlpha = 0.7
          ctx.fillText(n.label, n.x + NODE_RADIUS.tag + 3, n.y + 4 / zoom)
          ctx.globalAlpha = 1
        }
      }

      // Hovered node label (full)
      if (hovered && hovered.x != null && hovered.y != null) {
        const r = NODE_RADIUS[hovered.type]
        ctx.font = `bold ${13 / zoom}px var(--font-neue, sans-serif)`
        ctx.fillStyle = colors.label
        ctx.globalAlpha = 0.95
        ctx.fillText(hovered.label, hovered.x + r + 4, hovered.y + 4 / zoom)
        ctx.globalAlpha = 1
      }

      ctx.restore()
    }

    draw()

    // Event handlers
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const delta = e.deltaY * -0.001
      const newZoom = Math.min(Math.max(zoom * (1 + delta), 0.25), 4)
      panX = mx - (mx - panX) * (newZoom / zoom)
      panY = my - (my - panY) * (newZoom / zoom)
      zoom = newZoom
      draw()
    }

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId)
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      pointerDownPos = { x: mx, y: my }
      didMove = false
      const { x: sx, y: sy } = toSim(mx, my)
      const hit = hitNode(sx, sy)
      if (hit) {
        draggingNode = hit
        hit.fx = hit.x
        hit.fy = hit.y
        canvas.style.cursor = "grabbing"
      } else {
        panning = true
        panStart = { x: mx - panX, y: my - panY }
        canvas.style.cursor = "grabbing"
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (Math.hypot(mx - pointerDownPos.x, my - pointerDownPos.y) > 4) {
        didMove = true
      }

      if (draggingNode) {
        const { x: sx, y: sy } = toSim(mx, my)
        draggingNode.fx = sx
        draggingNode.fy = sy
        sim.alpha(0.3).restart()
        for (let i = 0; i < 10; i++) sim.tick()
        sim.stop()
        draw()
        return
      }

      if (panning) {
        panX = mx - panStart.x
        panY = my - panStart.y
        draw()
        return
      }

      // Hover detection
      const { x: sx, y: sy } = toSim(mx, my)
      const hit = hitNode(sx, sy)
      if (hit !== hovered) {
        hovered = hit
        canvas.style.cursor = hit ? "pointer" : "grab"
        draw()
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (!didMove && draggingNode) {
        router.push(draggingNode.href)
      } else if (!didMove && !draggingNode) {
        const { x: sx, y: sy } = toSim(mx, my)
        const hit = hitNode(sx, sy)
        if (hit) router.push(hit.href)
      }

      if (draggingNode) {
        draggingNode.fx = undefined
        draggingNode.fy = undefined
        draggingNode = null
      }
      panning = false
      canvas.style.cursor = hovered ? "pointer" : "grab"
    }

    const onResize = () => {
      w = container.clientWidth
      h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
      draw()
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", onPointerUp)
    const ro = new ResizeObserver(onResize)
    ro.observe(container)

    return () => {
      canvas.removeEventListener("wheel", onWheel)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", onPointerUp)
      ro.disconnect()
      sim.stop()
    }
  }, [data, router])

  useEffect(() => {
    return buildGraph()
  }, [buildGraph])

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.dot} data-type="tag" /> {t("graph.tag")}
        <span className={styles.dot} data-type="blog" /> {t("graph.blog")}
        <span className={styles.dot} data-type="creation" /> {t("graph.creation")}
      </div>
      <p className={styles.hint}>{t("ui.scrollHint")}</p>
    </div>
  )
}
