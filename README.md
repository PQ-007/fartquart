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

**Authoring:** copy a file from [`content/templates/`](content/templates/) and fill it in. The full guide (in Mongolian) is `content/vault-guide.md`; the field reference is [`content/templates/README.md`](content/templates/README.md).

## Translations

A post can exist in several languages without changing its URL. Write **one file per language**, giving each the **same `translation-key`** plus its own `lang` (`en` / `mn` / `ja`):

```yaml
# hello-world.md            # hello-world-en.md
lang: mn                    lang: en
translation-key: hello      translation-key: hello
```

How the logic resolves which version to show:

- **Listings collapse** each translation group to **one card** — the variant matching the reader's language, falling back to the *original* (a file with no `lang`), then the site default (`en`), then the first. This applies to `/blog`, `/notes`, related posts, the home featured row + latest feed, and the tag graph — so the same content never shows two or three times.
- A **"Also in" switcher** in the post's right sidebar links the language variants; the current one is highlighted.
- **SEO** — `hreflang` alternates between the variants plus a canonical are emitted automatically.
- Posts **without** a `translation-key` are standalone and always shown as-is.

The active locale is read from a `locale` cookie server-side ([`src/lib/locale.ts`](src/lib/locale.ts)); the root layout seeds `LanguageProvider` with it so server render and client agree (no flash). Client listings re-collapse live when you switch language; the home page and graph update on the next load. Core logic: [`src/lib/translations.ts`](src/lib/translations.ts) (`collapseTranslations`, `localizePost`, `pickVariant`) with `lang`/`translation-key` parsed in [`src/lib/content.ts`](src/lib/content.ts) (`getTranslationSiblings`).

## Features

- **Content pipeline** — `gray-matter` frontmatter + `next-mdx-remote` RSC; custom MDX components: `CodeBlock` (Shiki, Tokyo Night), `CloudImage`, `Tweet`, `Sandpack`, `Math` (KaTeX), `YouTube`, `Video`
- **Code blocks** — fenced blocks auto-highlight; an info string with a filename (` ```Character.py `) shows the filename as a label and infers the language from the extension
- **i18n** — English / Mongolian / Japanese UI, switchable live ([`src/lib/i18n.ts`](src/lib/i18n.ts), `LanguageProvider`)
- **Content translations** — multiple language versions per post via `translation-key`; listings collapse to the reader's language with fallback, per-post "Also in" switcher, `hreflang` (see [Translations](#translations))
- **Theme** — dark/light, set server-side from a cookie so there's no flash on reload
- **Tag graph** — an Obsidian-style force-directed graph of tags ↔ posts ↔ creations at `/tags` (d3)
- **Reading UX** — reading-progress bar, scroll-spy chapters sidebar, mobile ToC, related posts, copy-link-to-heading
- **SEO** — `metadataBase`, per-page OpenGraph/Twitter cards, branded fallback share image (`/og` via `next/og`), `sitemap.xml`, `robots.txt`, `BlogPosting`/`WebSite` JSON-LD, RSS at `/feed.xml`
- **Vault images** — `content/resources/` is synced into `public/resources/` at dev/build ([`scripts/copy-resources.mjs`](scripts/copy-resources.mjs)) so frontmatter covers like `resources/images/foo.jpg` and Obsidian `![[embed.png]]` ship as static assets on any host
- **Background music** — an optional `music:` frontmatter field (a YouTube link or audio file) shows a minimal floating player on the post

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
| `/resources/*` | Vault images/videos, served statically from `public/` (synced from `content/resources/`) |

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
  vault-guide.md         full authoring guide (Mongolian)

src/
  app/                   App Router routes, sitemap.ts, robots.ts, og/route.tsx
  lib/                   content.ts, translations.ts, locale.ts, seo.ts, site.ts, url.ts,
                         i18n.ts, toc.ts, mdx-options.ts, resources.ts, shiki.ts
  components/            shared UI (Nav, Footer, PostPreview, ActivityFeed, TranslationSwitcher, …)
  components/post/       MDX building blocks (CodeBlock, Math, Chapters, VocabReview, Footnote, …)
scripts/                 copy-resources.mjs (vault → public sync)
```
