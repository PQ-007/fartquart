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
