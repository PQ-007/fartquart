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
  const filePath = path.join(process.cwd(), "content", "resources", ...segments)

  if (!fs.existsSync(filePath)) {
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
