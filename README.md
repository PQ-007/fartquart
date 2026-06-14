# bilguun.me

My personal site — *a room for my thoughts, creations, and curiosities.* Built on **Next.js 16** (App Router) with an **Obsidian vault** as the content source: I write Markdown/MDX in `content/`, commit, and the site renders it.

## Run it

```bash
npm install
npm run dev      # development on http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## How it works

Content lives in `content/` (an Obsidian vault). Each post is a Markdown/MDX file with YAML frontmatter. At build time [`src/lib/content.ts`](src/lib/content.ts) reads the vault with `gray-matter`, and pages render the body with `next-mdx-remote/rsc`.

A post's **`label`** decides where it appears and how it looks:

| Label | Appears on | Lives in | Shape |
| --- | --- | --- | --- |
| `article` | `/blog` | `content/blog/*.md` | Single file |
| `essay` | `/blog` | `content/blog/*.md` | Single file |
| `project-log` | `/blog` | `content/blog/*.md` | Single file |
| `internship` | `/blog` | `content/blog/*.md` | Single file |
| `contest` | `/blog` | `content/blog/*.md` | Single file |
| `book-review` | `/blog/[slug]` | `content/blog/*.md` | Single file, Goodreads-style page |
| `book-note` | `/notes` | `content/book-notes/[book]/` | Folder: `index.md` + `1章 …` chapters |
| `lesson-note` | `/notes` | `content/lesson-notes/[course]/` | Folder: `index.md` + lesson files |

Creations (apps/experiments) live in `content/creations/` and render at `/creations`.

`/blog` renders in the order: article → essay → project-log → internship → contest. Notes and lessons are directory-based: the `index.md` is the cover/overview and each sibling `.md` is a chapter, with auto prev/next navigation and a chapter sidebar. Chapter files can declare `new-word` vocabulary, surfaced as a flip-to-reveal review widget.

**Authoring:** copy a file from [`content/templates/`](content/templates/) and fill it in. The full guide (in Mongolian) is `content/Агуулгын удирдамж.md`; the field reference is [`content/templates/README.md`](content/templates/README.md).

## Features

- **Content pipeline** — `gray-matter` frontmatter + `next-mdx-remote` RSC; custom MDX components: `CodeBlock` (Shiki, Tokyo Night), `CloudImage`, `Tweet`, `Sandpack`, `Math` (KaTeX), `YouTube`, `Video`
- **Code blocks** — fenced blocks auto-highlight; an info string with a filename (` ```Character.py `) shows the filename as a label and infers the language from the extension
- **i18n** — English / Mongolian / Japanese, switchable live ([`src/lib/i18n.ts`](src/lib/i18n.ts), `LanguageProvider`)
- **Theme** — dark/light, set server-side from a cookie so there's no flash on reload
- **Tag graph** — an Obsidian-style force-directed graph of tags ↔ posts ↔ creations at `/tags` (d3)
- **Reading UX** — reading-progress bar, scroll-spy chapters sidebar, mobile ToC, related posts, copy-link-to-heading
- **SEO** — `metadataBase`, per-page OpenGraph/Twitter cards, branded fallback share image (`/og` via `next/og`), `sitemap.xml`, `robots.txt`, `BlogPosting`/`WebSite` JSON-LD, RSS at `/feed.xml`
- **Vault images** — frontmatter covers like `resources/images/foo.jpg` are served by a route handler at `/resources/[...path]` (with a path-traversal guard)

## Routes

| Route | Description |
| --- | --- |
| `/` | Hero + animated tag graph, featured creations/posts, latest activity grid |
| `/blog`, `/blog/[slug]` | Writing, grouped by label; book-reviews get a Goodreads-style header |
| `/notes`, `/notes/[slug]`, `/notes/[slug]/[chapter]` | Book & lesson notes (directory-based, chaptered) |
| `/creations`, `/creations/[slug]` | Apps, tools, experiments (cover/YouTube/demo/repo) |
| `/about` | Bio, experience timeline |
| `/tags`, `/tags/[tag]` | Interactive tag graph / posts by tag |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt`, `/og` | RSS, sitemap, robots, share image |
| `/api/last-visit` | Previous visitor's geolocation (the "Latest Visit" pill) |
| `/resources/[...path]` | Serves images from the vault's `content/resources/` |

## Structure

```
content/                 Obsidian vault (the CMS)
  blog/                  → /blog        (article, essay, project-log, internship, contest, book-review)
  book-notes/[book]/     → /notes       (index.md + 章 chapters)
  lesson-notes/[course]/ → /notes       (index.md + lesson files)
  creations/             → /creations
  resources/images/      cover images, served via /resources
  templates/             copy-to-author starters (+ README field reference)
  featured.json          slugs featured on the home page
  Агуулгын удирдамж.md    full authoring guide (Mongolian)

src/
  app/                   App Router routes, sitemap.ts, robots.ts, og/route.tsx
  lib/                   content.ts, seo.ts, site.ts, url.ts, i18n.ts, mdx-options.ts, shiki.ts
  components/            shared UI (Nav, Footer, PostPreview, ActivityFeed, BookCard, …)
  components/post/       MDX building blocks (CodeBlock, Math, Chapters, VocabReview, …)
```
