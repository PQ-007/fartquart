"use client"

import { Sandpack as SandpackReact } from "@codesandbox/sandpack-react"
import type { ComponentProps } from "react"

type SandpackProps = ComponentProps<typeof SandpackReact>

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
