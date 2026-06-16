// Sync the Obsidian vault's images/videos into public/ so they ship as static
// assets on any host (Vercel, Netlify, a plain Node server). Runs before dev
// and build. Incremental: only copies files that are new or newer than the copy.

import { cpSync, existsSync, mkdirSync, statSync } from "node:fs"
import { join } from "node:path"

const src = join(process.cwd(), "content", "resources")
const dest = join(process.cwd(), "public", "resources")

if (!existsSync(src)) {
  console.log("[copy-resources] no content/resources — skipping")
  process.exit(0)
}

mkdirSync(dest, { recursive: true })

cpSync(src, dest, {
  recursive: true,
  force: true,
  filter: (from, to) => {
    const st = statSync(from)
    if (st.isDirectory()) return true
    try {
      return st.mtimeMs > statSync(to).mtimeMs
    } catch {
      return true // destination doesn't exist yet
    }
  },
})

console.log("[copy-resources] synced content/resources → public/resources")
