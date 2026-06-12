import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import os from "os"

const STORE = path.join(os.tmpdir(), "joshw-replica-last-visit.json")
const FALLBACK = "California, USA"

type Visit = { location: string; at: number }

const readLast = (): Visit | null => {
  try {
    return JSON.parse(fs.readFileSync(STORE, "utf8")) as Visit
  } catch {
    return null
  }
}

const lookupLocation = async (ip: string | null): Promise<string> => {
  if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.")) {
    return FALLBACK
  }
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return FALLBACK
    const data = (await res.json()) as {
      city?: string
      region_code?: string
      country_name?: string
    }
    if (data.city && data.region_code) return `${data.city}, ${data.region_code}`
    if (data.city && data.country_name) return `${data.city}, ${data.country_name}`
    return FALLBACK
  } catch {
    return FALLBACK
  }
}

export const GET = async (req: NextRequest) => {
  const previous = readLast()

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")

  const location = await lookupLocation(ip)
  try {
    fs.writeFileSync(STORE, JSON.stringify({ location, at: Date.now() }))
  } catch {
    // best-effort persistence; ignore write failures
  }

  return NextResponse.json({ location: previous?.location ?? location })
}
