// Client-safe: no fs/path/gray-matter imports, so components that need the
// creation category vocabulary can import it without pulling content.ts
// (and Node's fs) into the browser bundle.

export type CreationCategory =
  | "hardware"
  | "software"
  | "web"
  | "3dmodel"
  | "game"
  | "robot"
  | "iot"

export const CREATION_CATEGORY_ORDER: CreationCategory[] = [
  "hardware",
  "software",
  "web",
  "3dmodel",
  "game",
  "robot",
  "iot",
]

export const CREATION_CATEGORY_LABEL: Record<CreationCategory, string> = {
  hardware: "Hardware",
  software: "Software",
  web: "Web",
  "3dmodel": "3D Model",
  game: "Game",
  robot: "Robot",
  iot: "IoT",
}

/** Accent color per category — tints the cover placeholder so uncovered
 *  creations still read as distinct instead of an identical blank card. */
export const CREATION_CATEGORY_COLOR: Record<CreationCategory, string> = {
  hardware: "#f59e0b",
  software: "#22c55e",
  web: "#3b82f6",
  "3dmodel": "#a855f7",
  game: "#ef4444",
  robot: "#06b6d4",
  iot: "#eab308",
}
