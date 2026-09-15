// Convert hotlinked remote GIF covers into self-hosted assets.
//
// A Giphy GIF cover costs several MB and can never be optimized: isGif() in
// src/lib/url.ts marks it `unoptimized`, which also bypasses the remotePatterns
// allowlist. This downloads each one and emits a pair, filed by extension under
// public/cover_mp4/ — generated media, so it lives outside the Obsidian vault
// and is served straight from public/ with no sync step:
//
//   webp/<slug>.webp  first frame — the poster shown until the loop is ready
//   mp4/<slug>.mp4    the animation — played by listing cards and post heroes
//
// Giphy keeps a higher-resolution `giphy-hd.mp4` rendition for some uploads
// (up to 1080p) alongside the ~480p `giphy.gif`. We probe for it and encode
// from whichever source is actually larger.
//
// then rewrites the frontmatter to `cover:` (poster) + `coverVideo:` (mp4).
// Re-runnable: covers already pointing at a local path are left alone, and every
// source URL is recorded in scripts/cover-sources.json so the assets can be
// regenerated after changing the encode settings.
//
//   node scripts/convert-covers.mjs             convert any new remote covers
//   node scripts/convert-covers.mjs --reencode  rebuild every asset from source
//                                               (after changing the encode settings)

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const root = process.cwd()
const CONTENT = path.join(root, "content")
const OUT_DIR = path.join(root, "public", "cover_mp4")
const OUT_REL = "cover_mp4"
// Build metadata, not a served asset — kept beside the script rather than in
// the output folder so it is never served.
const SOURCES = path.join(root, "scripts", "cover-sources.json")
const REENCODE = process.argv.includes("--reencode")
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

const probe = (target) => {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-select_streams", "v:0",
       "-show_entries", "stream=width,height", "-of", "csv=p=0", target],
      { encoding: "utf8", timeout: 30000, stdio: ["ignore", "pipe", "ignore"] },
    ).trim()
    const [w, h] = out.split(",").map(Number)
    return w && h ? { w, h } : null
  } catch {
    return null
  }
}

// A still cover (jpg/png/webp, or a one-frame gif) gets a poster and nothing
// else — encoding a single frame as a video would be pure waste, and the post
// would then claim a `coverVideo:` that never moves.
const isAnimated = (file) => {
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-select_streams", "v:0", "-count_frames",
       "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", file],
      { encoding: "utf8", timeout: 60000, stdio: ["ignore", "pipe", "ignore"] },
    ).trim()
    return Number(out) > 1
  } catch {
    return false
  }
}

/**
 * Giphy serves `giphy-hd.mp4` for some uploads — often 1080p where the GIF is
 * 480p. Returns whichever rendition has more pixels; a few GIFs are already
 * the larger of the two.
 */
const bestSource = (url) => {
  const id = url.match(/\/([A-Za-z0-9]{10,})\/giphy\.gif/)?.[1]
  const gif = { url, ext: "gif", ...(probe(url) ?? { w: 0, h: 0 }) }
  if (!id) return gif
  const hdUrl = `https://media.giphy.com/media/${id}/giphy-hd.mp4`
  const hd = probe(hdUrl)
  if (!hd || hd.w * hd.h <= gif.w * gif.h) return gif
  return { url: hdUrl, ext: "mp4", ...hd }
}

const mb = (p) => (fs.statSync(p).size / 1048576).toFixed(2)

const targets = []
for (const file of walk(CONTENT)) {
  const lines = fs.readFileSync(file, "utf8").split("\n")
  const i = lines.findIndex((l) => COVER_RE.test(l))
  if (i === -1) continue
  targets.push({ file, line: i, url: lines[i].match(COVER_RE)[1] })
}

const recorded = fs.existsSync(SOURCES)
  ? JSON.parse(fs.readFileSync(SOURCES, "utf8"))
  : {}

if (targets.length === 0 && !REENCODE) {
  console.log("[convert-covers] no remote covers left — nothing to do")
  console.log("  (pass --reencode to rebuild the existing assets from source)")
  process.exit(0)
}

for (const ext of ["mp4", "webp"]) {
  fs.mkdirSync(path.join(OUT_DIR, ext), { recursive: true })
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "covers-"))

// One asset per URL: translation variants of a post share a cover.
const byUrl = new Map()
const used = new Set()
if (REENCODE) {
  for (const [slug, url] of Object.entries(recorded)) {
    byUrl.set(url, slug)
    used.add(slug)
  }
}
for (const t of targets) {
  if (byUrl.has(t.url)) continue
  let slug = slugFor(t.file)
  while (used.has(slug)) slug = `${slug}-2`
  used.add(slug)
  byUrl.set(t.url, slug)
}

let before = 0
let after = 0
// Which slugs ended up with a video, so the frontmatter rewrite knows whether
// to add a `coverVideo:` line.
const animatedSlugs = new Set()

for (const [url, slug] of byUrl) {
  const best = bestSource(url)
  const src = path.join(tmp, `${slug}.${best.ext}`)
  const mp4 = path.join(OUT_DIR, "mp4", `${slug}.mp4`)
  const webp = path.join(OUT_DIR, "webp", `${slug}.webp`)

  const res = await fetch(best.url)
  if (!res.ok) {
    console.error(`[convert-covers] ${slug}: HTTP ${res.status} for ${best.url}`)
    process.exit(1)
  }
  fs.writeFileSync(src, Buffer.from(await res.arrayBuffer()))

  const animated = isAnimated(src)
  ffmpeg(["-i", src, "-frames:v", "1", "-c:v", "libwebp", "-quality", "92", webp])

  if (animated) {
    animatedSlugs.add(slug)
    // h264 needs even dimensions; faststart puts the moov atom up front so the
    // first frames play before the whole file lands.
    ffmpeg([
      "-i", src,
      "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos",
      // Quality is worth bytes here, but a few grainy loops encode enormously at
      // a flat CRF — hence the ceiling, scaled to the source resolution.
      "-c:v", "libx264", "-crf", "22", "-preset", "slow",
      "-maxrate", best.w >= 720 ? "2000k" : "1200k",
      "-bufsize", best.w >= 720 ? "4000k" : "2400k",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
      mp4,
    ])
  } else if (fs.existsSync(mp4)) {
    // A cover that used to be animated and is now a still — drop the stale video.
    fs.rmSync(mp4)
  }

  before += fs.statSync(src).size
  after += fs.statSync(webp).size + (animated ? fs.statSync(mp4).size : 0)
  const out = probe(animated ? mp4 : webp)
  console.log(
    `  ${slug.padEnd(28)} ${best.ext === "mp4" ? "hd" : "  "} ` +
      `${best.w}x${best.h} → ${out?.w}x${out?.h}  ` +
      (animated
        ? `${mb(mp4)} MB mp4 + ${mb(webp)} MB poster`
        : `${mb(webp)} MB still`),
  )
}

for (const [url, slug] of byUrl) recorded[slug] = url
fs.writeFileSync(SOURCES, JSON.stringify(recorded, null, 2) + "\n")

for (const { file, line, url } of targets) {
  const slug = byUrl.get(url)
  const lines = fs.readFileSync(file, "utf8").split("\n")
  lines[line] = `cover: ${OUT_REL}/webp/${slug}.webp`
  if (animatedSlugs.has(slug)) {
    lines.splice(line + 1, 0, `coverVideo: ${OUT_REL}/mp4/${slug}.mp4`)
  }
  fs.writeFileSync(file, lines.join("\n"))
}

fs.rmSync(tmp, { recursive: true, force: true })
console.log(
  `\n[convert-covers] ${byUrl.size} covers in ${targets.length} documents — ` +
    `${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(1)} MB`,
)
