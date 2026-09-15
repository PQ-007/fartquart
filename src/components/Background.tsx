"use client"

import { useEffect, useRef } from "react"
import styles from "./Background.module.css"

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const FRAG = `
precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_light;

// a soft round bubble — dense in the middle, falling off to nothing at the rim
float bubble(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  return smoothstep(radius, radius * 0.30, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;

  // blue bubbles, each on its own slow loop so they never travel as a pack
  float bubbles = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 c = vec2(
      0.80 + 0.80 * sin(u_time * 0.043 * (0.55 + fi * 0.13) + fi * 1.7),
      0.50 + 0.44 * cos(u_time * 0.037 * (0.70 + fi * 0.11) + fi * 2.3));
    float r = 0.042 + 0.030 * fract(fi * 0.613 + 0.2);
    bubbles += bubble(uv, c, r);
  }
  bubbles = clamp(bubbles, 0.0, 1.0);

  // The ground is flat — pure black or pure white — so it matches
  // --color-background exactly; only the bubbles carry any colour.
  vec3 color;
  if (u_light > 0.5) {
    color = mix(vec3(1.0), vec3(0.25, 0.55, 1.0), bubbles * 0.50);
  } else {
    color = vec3(0.16, 0.45, 1.0) * bubbles * 0.62;
  }

  // grain only inside the bubbles, to break banding on their falloff
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.02 * bubbles;

  gl_FragColor = vec4(color, 1.0);
}`

export const Background = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false })
    if (!gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const position = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const uResolution = gl.getUniformLocation(program, "u_resolution")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uLight = gl.getUniformLocation(program, "u_light")

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    let frame = 0
    const start = performance.now()
    const renderAt = (time: number) => {
      const light =
        document.documentElement.getAttribute("data-theme") === "light"
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime, time)
      gl.uniform1f(uLight, light ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = () => {
      renderAt((performance.now() - start) / 1000)
      frame = requestAnimationFrame(loop)
    }
    // Reduced motion gets one frozen frame (a mid-drift time where the bubbles
    // are nicely spread); the loop also stops while the tab is hidden.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const still = () => renderAt(40)
    const apply = () => {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      if (reduceMotion.matches) still()
      else if (!document.hidden) frame = requestAnimationFrame(loop)
    }
    apply()
    reduceMotion.addEventListener("change", apply)
    document.addEventListener("visibilitychange", apply)
    // The still frame reads the theme once, so repaint it when the theme flips.
    const themeObserver = new MutationObserver(() => {
      if (!frame) still()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })
    const resizeStill = () => {
      if (!frame) still()
    }
    window.addEventListener("resize", resizeStill)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      reduceMotion.removeEventListener("change", apply)
      document.removeEventListener("visibilitychange", apply)
      themeObserver.disconnect()
      window.removeEventListener("resize", resizeStill)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
