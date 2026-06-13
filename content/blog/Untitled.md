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

````text

const Button = ({ label }: { label: string }) => (

<button>{label}</button>

)


```

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