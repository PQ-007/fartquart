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

float blob(vec2 uv, vec2 center, float radius) {
  float d = length(uv - center);
  return smoothstep(radius, 0.0, d);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;
  float t = u_time * 0.12;

  vec2 c1 = vec2(0.85 + 0.25 * sin(t * 0.9), 0.75 + 0.2 * cos(t * 0.7));
  vec2 c2 = vec2(0.35 + 0.3 * cos(t * 0.6 + 2.0), 0.25 + 0.25 * sin(t * 0.8 + 1.0));
  vec2 c3 = vec2(1.25 + 0.3 * sin(t * 0.5 + 4.0), 0.2 + 0.3 * cos(t * 0.9 + 3.0));

  vec3 navy   = vec3(0.05, 0.08, 0.30);
  vec3 indigo = vec3(0.10, 0.06, 0.40);
  vec3 violet = vec3(0.15, 0.05, 0.35);

  vec3 color = vec3(0.0);
  color += navy   * blob(uv, c1, 0.85) * 0.9;
  color += indigo * blob(uv, c2, 0.75) * 0.8;
  color += violet * blob(uv, c3, 0.9)  * 0.7;

  // subtle grain to avoid banding
  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  color += (grain - 0.5) * 0.015;

  if (u_light > 0.5) {
    float lum = dot(color, vec3(0.333));
    color = vec3(1.0) - lum * vec3(0.06, 0.08, 0.18);
  }

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
    const render = () => {
      const light =
        document.documentElement.getAttribute("data-theme") === "light"
      gl.uniform2f(uResolution, canvas.width, canvas.height)
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.uniform1f(uLight, light ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  )
}
