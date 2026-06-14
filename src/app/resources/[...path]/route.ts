import fs from "fs"
import path from "path"

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params
  const baseDir = path.join(process.cwd(), "content", "resources")
  const filePath = path.resolve(baseDir, ...segments)

  // Guard against path traversal (e.g. encoded "../") escaping the resources dir.
  if (filePath !== baseDir && !filePath.startsWith(baseDir + path.sep)) {
    return new Response("Forbidden", { status: 403 })
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return new Response("Not found", { status: 404 })
  }

  const ext = path.extname(filePath).slice(1).toLowerCase()
  const contentType = MIME[ext] ?? "application/octet-stream"
  const file = fs.readFileSync(filePath)

  return new Response(file, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
