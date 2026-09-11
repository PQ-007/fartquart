"use client"

import dynamic from "next/dynamic"
import type { ComponentProps } from "react"
import type { Sandpack as SandpackComponent } from "@codesandbox/sandpack-react"

// The CodeSandbox bundler UI is ~650KB. Imported statically it lands in the
// chunk every MDX page shares, so posts that embed nothing still pay for it —
// load it only where a <Sandpack> actually renders. The type import above is
// erased at build time, so it costs nothing.
const SandpackReact = dynamic(
  () => import("@codesandbox/sandpack-react").then((m) => m.Sandpack),
  { ssr: false },
)

type SandpackProps = ComponentProps<typeof SandpackComponent>

export const Sandpack = ({
  template = "react-ts",
  theme,
  options,
  ...props
}: SandpackProps) => (
  <div className="sandpack-outer">
    <SandpackReact
      template={template}
      theme={theme ?? "dark"}
      options={{
        editorHeight: 420,
        showLineNumbers: true,
        ...options,
      }}
      {...props}
    />
  </div>
)
