# Vault Guide — room-for-me content pipeline

Drop your Obsidian files into the right folder and they appear on the site automatically.

---

## File locations

| Vault folder | Site URL | Page layout |
|---|---|---|
| `content/blog/*.md` | `/blog` + `/blog/[slug]` | Grouped by label, detail page with TOC |
| `content/blog/[folder]/index.md` | `/blog/[folder]` | Same — Obsidian folder notes supported |
| `content/creations/*.md` | `/creations` + `/creations/[slug]` | Project card grid + detail |

Both accept `.md` (plain markdown) and `.mdx` (markdown + React components).

Filename (without extension) becomes the URL slug:
```
content/blog/my-post.md          → /blog/my-post
content/blog/Deep Learning/index.md → /blog/Deep Learning
content/creations/my-app.md     → /creations/my-app
```

---

## Blog frontmatter

```yaml
---
title: "Your Post Title"
description: "One-sentence summary shown on cards and in <meta>."
label: lesson-note          # see label reference below
tags: [Algorithm, Python]
date: 2026-01-15
cover: /images/blog/my-cover.jpg   # optional — 16:9 image
draft: false                        # true → hidden everywhere
language: mn                        # optional — mn | ja | en
---
```

### `label` values

| Value | Section on /blog | Shows on /notes |
|---|---|---|
| `lesson-note` | Lesson Note | ✓ |
| `note` | Note | ✓ |
| `essay` | Essay | — |
| `project-log` | Project Log | — |
| `internship` | Internship | — |
| `book-review` | Book Review | — |
| `contest` | Contest | — |

Posts with `label: lesson-note` or `label: note` also appear at `/notes`.

### Field → UI mapping

| Field | Where it appears |
|---|---|
| `title` | Card heading, page `<h1>`, browser tab |
| `description` | Card body text, `<meta name="description">` |
| `label` | Section header on /blog, tag badge on card |
| `tags[]` | Chips in post header (each → /tags/[tag]) + graph nodes |
| `date` | Post header formatted as "January, 2026" |
| `cover` | 16:9 image in card + top of detail page |
| `draft: true` | Hides from all listings, not pre-rendered |

---

## Creation frontmatter

```yaml
---
title: "Project Name"
description: "What it is and what it does."
tags: [nextjs, webgl, typescript]
date: 2026-06-11
cover: /images/creations/my-project.jpg   # optional
demo: https://my-project.vercel.app       # optional → "Live Demo →" sidebar button
repo: https://github.com/you/repo         # optional → "Source Code →" sidebar button
draft: false
---
```

---

## Markdown syntax (works in .md and .mdx)

```markdown
## Section Title          ← appears in Chapters sidebar TOC

**bold**, _italic_, `code`

> blockquote

- bullet list

[link text](https://url)

![alt text](/images/blog/diagram.png)
```

Fenced code blocks are syntax-highlighted (tokyo night theme):
````markdown
```typescript
const greet = (name: string) => `Hello, ${name}`
```
````
Supported languages: `typescript` `tsx` `javascript` `css` `html` `json` `bash` `python` `rust`

---

## MDX components (.mdx files only)

**CodeSnippet** — file header + copy button:
```mdx
<CodeSnippet lang="tsx" title="Button.tsx" lineNumbers code={`
const Button = ({ label }: { label: string }) => (
  <button>{label}</button>
)
`} />
```

**Math** — LaTeX via KaTeX:
```mdx
<Math>f(x) = \int_{-\infty}^{\infty} \hat{f}(\xi)\, e^{2\pi i \xi x}\, d\xi</Math>
```

**Tweet** — embed by tweet ID:
```mdx
<Tweet id="1234567890123456789" />
```

---

## Images

Put images under `public/images/`:
```
public/images/
  blog/           ← blog post covers and inline images
  creations/      ← project covers
  profile.webp    ← about page photo
```

Reference in frontmatter: `cover: /images/blog/my-image.jpg`
Reference in body: `![alt](/images/blog/my-image.png)`

> **Obsidian image syntax `![[filename.png]]` is not supported** — use standard markdown image syntax instead.

---

## Obsidian folder notes

Notes that live inside a folder (with attachments) are supported if the main note is named `index.md`:

```
content/blog/
  My Research/
    index.md          ← main note → appears at /blog/My Research
    diagram.png       ← attachment (not rendered directly, use public/images/ for images)
```

Chapter files in the same folder (e.g., `1章.md`, `2章.md`) are **not** auto-loaded as separate posts unless they have their own frontmatter at the top level. Move them to the root blog directory if you want them as individual posts.

---

## What doesn't work (Obsidian-specific syntax)

| Obsidian feature | What to use instead |
|---|---|
| `![[image.png]]` wiki image | `![alt](/images/blog/image.png)` |
| `[[note name]]` wiki link | `[note name](/blog/note-name)` |
| `#Tag` inline hashtags | frontmatter `tags:` array |
| `#Csharp/dotNet` slash tags | Remove `/` — use `CsharpDotNet` |
| Inline `#` frontmatter tags | Move to YAML frontmatter block |

---

## Quick reference

```
blog note      → content/blog/slug.md
               → label: lesson-note | note | essay | project-log | internship | ...
               → required: title, description, label, tags[], date

folder note    → content/blog/folder-name/index.md
               → same frontmatter rules

creation       → content/creations/slug.md
               → required: title, description, tags[], date
               → optional: cover, demo, repo

## in body     → auto TOC entry in Chapters sidebar
tags:          → chips + /tags graph nodes + /tags/[tag] page
cover:         → 16:9 media slot in card + detail header
draft: true    → hidden from all listings
```
