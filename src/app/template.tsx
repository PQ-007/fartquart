import type { ReactNode } from "react"
import { PageVeil } from "@/components/PageVeil"

export default function Template({ children }: { children: ReactNode }) {
  return <PageVeil>{children}</PageVeil>
}
