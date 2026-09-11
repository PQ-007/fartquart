// Convert hotlinked remote GIF covers into self-hosted assets.
//
// A Giphy GIF cover costs several MB and can never be optimized: isGif() in
// src/lib/url.ts marks it `unoptimized`, which also bypasses the remotePatterns
// allowlist. This downloads each one and emits a pair under
// content/resources/images/covers/:
//
//   <slug>.webp  first frame — the poster listings render through next/image
//   <slug>.mp4   the animation — played by the post page only
//
// then rewrites the frontmatter to `cover:` (poster) + `coverVideo:` (mp4).
// Re-runnable: covers already pointing at a local path are left alone.
//
// Run with `node scripts/convert-covers.mjs` after adding a remote GIF cover.

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const root = process.cwd()
const CONTENT = path.join(root, "content")
const OUT_DIR = path.join(CONTENT, "resources", "images", "covers")
const OUT_REL = "resources/images/covers"
const COVER_RE = /^cover:\s*(https?:\/\/\S+)\s*$/

// Drafts and deleted notes still publish nothing, but templates and .trash are
// not part of the site at all — leave their placeholders alone.
const SKIP_DIRS = new Set([".trash", "templates", "archieve"])

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) {
      return SKIP_DIRS.has(e.name) || e.name === "resources"
        ? []
        : walk(path.join(dir, e.name))
    }
    return e.name.endsWith(".md") ? [path.join(dir, e.name)] : []
  })

// A readable, filesystem-safe name derived from the document (Cyrillic and
// Japanese are fine — public/resources already serves such names).
const slugFor = (file) => {
  const base = path.basename(file, ".md")
  const name = base === "index" ? path.basename(path.dirname(file)) : base
  return name.replace(/\s+/g, "-").replace(/[/\\:*?"<>|]/g, "")
}

const ffmpeg = (args) =>
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args])

const mb = (p) => (fs.statSync(p).size / 1048576).toFixed(2)

const targets = []
for (const file of walk(CONTENT)) {
  const lines = fs.readFileSync(file, "utf8").split("\n")
  const i = lines.findIndex((l) => COVER_RE.test(l))
  if (i === -1) continue
  targets.push({ file, line: i, url: lines[i].match(COVER_RE)[1] })
}

if (targets.length === 0) {
  console.log("[convert-covers] no remote covers left — nothing to do")
  process.exit(0)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "covers-"))

// One asset per URL: translation variants of a post share a cover.
const byUrl = new Map()
const used = new Set()
for (const t of targets) {
  if (byUrl.has(t.url)) continue
  let slug = slugFor(t.file)
  while (used.has(slug)) slug = `${slug}-2`
  used.add(slug)
  byUrl.set(t.url, slug)
}

let before = 0
let after = 0

for (const [url, slug] of byUrl) {
  const gif = path.join(tmp, `${slug}.gif`)
  const mp4 = path.join(OUT_DIR, `${slug}.mp4`)
  const webp = path.join(OUT_DIR, `${slug}.webp`)

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`[convert-covers] ${slug}: HTTP ${res.status} for ${url}`)
    process.exit(1)
  }
  fs.writeFileSync(gif, Buffer.from(await res.arrayBuffer()))

  // h264 needs even dimensions; faststart puts the moov atom up front so the
  // first frames play before the whole file lands.
  ffmpeg([
    "-i", gif,
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos",
    "-c:v", "libx264", "-crf", "26", "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
    mp4,
  ])
  ffmpeg(["-i", gif, "-frames:v", "1", "-c:v", "libwebp", "-quality", "85", webp])

  before += fs.statSync(gif).size
  after += fs.statSync(mp4).size + fs.statSync(webp).size
  console.log(
    `  ${slug}: ${mb(gif)} MB gif → ${mb(mp4)} MB mp4 + ${mb(webp)} MB poster`,
  )
}

for (const { file, line, url } of targets) {
  const slug = byUrl.get(url)
  const lines = fs.readFileSync(file, "utf8").split("\n")
  lines[line] = `cover: ${OUT_REL}/${slug}.webp`
  lines.splice(line + 1, 0, `coverVideo: ${OUT_REL}/${slug}.mp4`)
  fs.writeFileSync(file, lines.join("\n"))
}

fs.rmSync(tmp, { recursive: true, force: true })
console.log(
  `\n[convert-covers] ${byUrl.size} covers in ${targets.length} documents — ` +
    `${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`,
)
