---
title: Content Pipeline — Vault Guide
description: Reference for writing Obsidian notes that appear on this site.
label: note
draft: true
date: 2026-06-01
tags: []
---

# Content Pipeline: Vault → UI

  

This document is your reference for writing content in Obsidian and having it

appear in the site. Every field, every component, every connection is mapped

here. Once the implementation is done, drop files into the right folder and

everything wires up automatically.

  

---

  

## File Locations

  

| Drop your vault file here | It appears at | UI layout used |

|---|---|---|

| `content/blog/*.md` | `/blog` + `/blog/[slug]` | Blog listing grouped by label + post detail |

| `content/creations/*.md` | `/creations` + `/creations/[slug]` | Project card grid + project detail |

  

Both directories accept `.md` (plain markdown) and `.mdx` (markdown + React

components). Use `.md` for text-only posts. Use `.mdx` if you need

`<CodeSnippet>`, `<Math>`, `<Tweet>`, or `<Sandpack>` inside the body.

  

Filename (no extension) becomes the URL slug:

```

content/blog/my-internship-log.md → /blog/my-internship-log

content/creations/room-for-me.md → /creations/room-for-me

```

Naming rule: lowercase kebab-case, no spaces, no special characters.

  

---

  

## Blog Post Frontmatter

  

```yaml

---

title: "Reading Notes: The Design of Everyday Things"

description: "Norman's principles applied to software interfaces."

label: book-review

tags: [design, ux, books]

date: 2024-03-15

cover: /images/blog/design-everyday-things.jpg

draft: false

---

```

  

`cover` and `draft` are optional. All other fields are required.

  

### `label` values (controls section grouping on /blog)

  

| Value | Section header |

|---|---|

| `book-review` | Book Review |

| `internship` | Internship |

| `project-log` | Project Log |

| `contest` | Contest |

| `essay` | Essay |

| `note` | Note |

  

Add new labels freely — they auto-create new sections on the /blog page.

  

### Blog → UI connection map

  

| Field | Exactly where it appears |

|---|---|

| `title` | Card `<h1>` on /blog · Page `<h1>` on /blog/[slug] · Browser tab title |

| `description` | Card body paragraph · `<meta name="description">` |

| `label` | Section header on /blog (groups all posts with same label) · Tag badge on card |

| `tags[]` | Tag chips in post header (each links to /tags/[tag]) · Nodes in /tags graph · /tags/[tag] filtered list |

| `date` | Post detail header formatted as "March, 2024" |

| `cover` | 16:9 image in card top media region · 16:9 image at top of detail page |

| `draft: true` | Hidden from all listings and not pre-rendered |

  

---

  

## Creation (Project) Frontmatter

  

```yaml

---

title: "Room for Me"

description: "Personal site with WebGL background and Obsidian-style tag graph."

tags: [nextjs, webgl, typescript, design]

date: 2026-06-11

cover: /images/creations/room-for-me.jpg

demo: https://room-for-me.vercel.app

repo: https://github.com/bilguunpq/room-for-me

draft: false

---

```

  

`cover`, `demo`, `repo`, and `draft` are optional. Everything else required.

A creation with no `cover` renders a gradient placeholder in the card slot.

  

### Creations → UI connection map

  

| Field | Exactly where it appears |

|---|---|

| `title` | Card `<h1>` on /creations · Page `<h1>` on /creations/[slug] · Browser tab |

| `description` | Card body paragraph |

| `tags[]` | Tag chips in detail header · /tags graph · /tags/[tag] filtered list |

| `date` | Detail page header formatted date |

| `cover` | 16:9 image in card top (same slot Josh uses for video) · 16:9 image at top of detail page |

| `demo` | "Live Demo →" sliding-text button in right-side Chapters sidebar |

| `repo` | "Source Code →" sliding-text button in right-side Chapters sidebar |

| `draft: true` | Hidden everywhere |

  

---

  

## What the UI looks like

  

### /creations card (identical visual to Josh's PostPreview)

  

```

┌─────────────────────────────────┐

│ │

│ cover image 16:9 │ ← your `cover` value

│ (gradient placeholder if │ ← if no cover

│ no cover set) │

│ │

└─────────────────────────────────┘

Project Title ← `title`

Short description of the project. ← `description`

View Creation → ← SlidingText link to /creations/[slug]

```

  

### /creations/[slug] detail page

  

```

Large Project Title date here

[tag] [tag] [tag] ╔═══════════════════╗

║ Live Demo → ║ ← `demo`

┌──────────────────────────────┐ ║ Source Code → ║ ← `repo`

│ cover image 16:9 │ ╠═══════════════════╣

└──────────────────────────────┘ ║ ▓▓▓▓░░░░░░░░░░░░ ║ ← reading %

╠═══════════════════╣

Your MDX content here. ║ • Section One ║ ← ## headings

║ • Section Two ║ auto-extracted

## Section One ║ • Section Three ║ from body

Lorem ipsum... ╚═══════════════════╝

## Section Two

...

```

  

Right Chapters sidebar is auto-built from `## H2` headings in your body.

Scroll-spy highlights the active section. Progress bar fills as you read.

  

### /blog listing (grouped by label)

  

```

[book-review] All Tags →

┌──────────┐ ┌──────────┐

│ card │ │ card │ ← text-focused cards (cover optional)

└──────────┘ └──────────┘

  

[project-log] All Tags →

┌──────────┐

│ card │

└──────────┘

```

  

### /blog/[slug] detail page

  

Same layout as creation detail. If no `cover` is set, the media section is

omitted and the MDX body starts directly after the title/tags header.

  

---

  

## MDX Body: Components You Can Use

  

These are available inside any `.mdx` file body.

  

### Standard markdown (works in .md and .mdx)

  

```markdown

## Section Title ← registers as TOC entry in Chapters sidebar

### Subsection

  

**bold**, _italic_, `inline code`

  

> blockquote text

  

- bullet list

  

[link text](https://url)

```

  

### Fenced code blocks (auto syntax-highlighted via shiki/tokyo-night)

  

````markdown

```typescript

const greet = (name: string) => `Hello, ${name}`

```

````

  

Supported languages: `typescript` `tsx` `javascript` `jsx` `css` `html` `json` `bash`

  

### MDX components (`.mdx` files only)

  

**CodeSnippet** — code block with filename header, copy button, optional line numbers:

```mdx

<CodeSnippet

lang="tsx"

title="Button.tsx"

lineNumbers

code={`

const Button = ({ label }: { label: string }) => (

<button>{label}</button>

)

`} />

```

  

**Math** — LaTeX rendered by KaTeX:

```mdx

<Math>f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi)\, e^{2\pi i \xi x}\, d\xi</Math>

```

  

**Tweet** — embed by tweet ID (the number from the URL):

```mdx

<Tweet id="1234567890123456789" />

```

  

**Sandpack** — live code playground (heavy; only use when needed):

```mdx

import { Sandpack } from "@codesandbox/sandpack-react"

  

<Sandpack

template="react"

files={{ "/App.js": `export default () => <h1>Hello</h1>` }}

/>

```

  

---

  

## Images

  

Put images in `public/images/`:

  

```

public/

images/

blog/ ← blog post covers

creations/ ← project covers

profile.webp ← about page photo

```

  

Reference in frontmatter:

```yaml

cover: /images/creations/my-project.jpg

```

  

Reference in MDX body (plain markdown image):

```markdown

![alt text](/images/blog/diagram.png)

```

  

---

  

## The Full Pipeline

  

```

Your Obsidian file

content/creations/my-project.md

│

▼ gray-matter parses YAML header

│

├── frontmatter ──► getAllCreations()

│ │

│ ├──► /creations page

│ │ PostPreview-style card

│ │ (cover → <Image> in 16:9 slot)

│ │

│ └──► /creations/[slug] page

│ title + date + tag chips

│ cover image or no media

│

├── demo + repo ──────► Chapters sidebar

│ "Live Demo →" / "Source Code →"

│

├── MDX body ──────────► <MDXRemote> renders article

│ CodeSnippet, Math, Tweet etc

│

├── ## headings ────────► extractChapters() ──► Chapters TOC list

│ scroll-spy activates on read

│

└── tags[] ─────────────► getGraphData() ──► /tags node graph

node per tag (teal)

node per content (white)

edge: content ──► its tags

──► /tags/[tag] ──► filtered list

```

  

Same pipeline applies to `content/blog/*.md` with `/blog` routes.

  

---

  

## Code Changes That Make This Work

  

Everything in Josh's UI reuses unchanged. The only adaptation is in how

`PostPreview` and the detail page handle the media slot.

  

### Current behavior (Josh's content)

```

PostMeta.mainVideo = "projects/chess/chess-main-video" (required)

PostPreview → <VideoPlayer src={CDN + mainVideo + ".mp4"} />

```

  

### After change (your content)

```

PostMeta.mainVideo = optional → VideoPlayer (if present — Josh's content)

PostMeta.cover = optional → <Image src={cover} /> (your content)

(neither set) → gradient placeholder div

```

  

**Files that change:**

  

| File | What changes |

|---|---|

| `src/lib/content.ts` (new) | New types: `BlogMeta`, `CreationMeta`. `mainVideo` absent; `cover` optional |

| `src/components/PostPreview.tsx` | Media slot: `if mainVideo → VideoPlayer; else if cover → Image; else → placeholder` |

| `src/app/posts/[slug]/page.tsx` | Same media-slot logic in detail page |

| `src/components/Nav.tsx` | 4 items: Home / Blog / Creations / About |

| `src/components/Nav.module.css` | `width: calc(100% / 4)` for sliding indicator |

| `src/app/tags/page.tsx` | Replaced with `<TagGraph>` D3 canvas |

| `src/app/globals.css` | Accent `#2dd4bf`, hero gradient, tag pill colors |

| `src/components/Background.tsx` | GLSL blob colors → teal palette |

  

**New files:**

  

| File | Purpose |

|---|---|

| `src/lib/content.ts` | `getAllBlogPosts`, `getAllCreations`, `getGraphData`, etc |

| `src/app/blog/page.tsx` + CSS | Blog listing grouped by label |

| `src/app/blog/[slug]/page.tsx` + CSS | Blog post detail |

| `src/app/creations/page.tsx` + CSS | Creation grid |

| `src/app/creations/[slug]/page.tsx` + CSS | Creation detail |

| `src/components/TagGraph.tsx` + CSS | D3 canvas Obsidian-style node graph |

| `content/blog/hello-world.md` | Placeholder so build doesn't fail |

| `content/creations/first-creation.md` | Placeholder so build doesn't fail |

| `content/featured.json` | `{ "blogs": [...], "creations": [...] }` for home page |

  

**Deleted after migration:**

- `src/app/posts/` (entire directory, Josh's routes)

  

---

  

## Quick Reference Card

  

```

blog post → content/blog/slug.md

required: title, description, label, tags[], date

optional: cover (image path), draft

  

creation → content/creations/slug.md

required: title, description, tags[], date

optional: cover, demo, repo, draft

  

## in body → auto TOC entry in Chapters sidebar

demo: → "Live Demo →" in sidebar

repo: → "Source Code →" in sidebar

tags: → chips in header + /tags graph + /tags/[tag] list

cover: → 16:9 media slot in card + detail header

```