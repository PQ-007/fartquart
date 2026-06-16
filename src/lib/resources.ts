import fs from "fs"
import path from "path"

// Resolves Obsidian embed targets (`![[name.png]]`) to a web path. Obsidian
// references attachments by bare filename, so we index every file under
// content/resources by both its basename and its full relative path.

const RES_DIR = path.join(process.cwd(), "content", "resources")

let index: Map<string, string> | null = null

const buildIndex = (): Map<string, string> => {
  const map = new Map<string, string>()
  const walk = (dir: string) => {
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full)
        continue
      }
      const rel = path.relative(RES_DIR, full).split(path.sep).join("/")
      map.set(rel.toLowerCase(), rel)
      // First match wins for an ambiguous basename.
      const base = entry.name.toLowerCase()
      if (!map.has(base)) map.set(base, rel)
    }
  }
  if (fs.existsSync(RES_DIR)) walk(RES_DIR)
  return map
}

/** Resolve an embed target (filename or relative path) to a /resources URL, or null. */
export const resolveResourceUrl = (target: string): string | null => {
  if (!index) index = buildIndex()
  const cleaned = decodeURIComponent(target.trim()).toLowerCase()
  const rel = index.get(cleaned) ?? index.get(cleaned.split("/").pop() ?? cleaned)
  if (!rel) return null
  const encoded = rel.split("/").map(encodeURIComponent).join("/")
  return `/resources/${encoded}`
}
