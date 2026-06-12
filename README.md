# joshw.io replica

A full Next.js (App Router) replica of [joshw.io](https://www.joshw.io/) — Josh Warren's portfolio.

## Run it

```bash
npm install
npm run dev      # development on http://localhost:3000
npm run build    # production build (all pages prerendered)
npm start        # serve the production build
```

## Pages

| Route | Description |
| --- | --- |
| `/` | Hero (fixed, mix-blend-difference) + featured project previews |
| `/posts` | All posts grouped by `#project` / `#lab` |
| `/posts/[slug]` | 7 full MDX articles (chess, doodleverse, node-graph, scribble-ai, movie-app, recoil-devtools, dial) |
| `/about` | Bio, experience timeline, dog photo |
| `/tags` | All tags with post counts |
| `/tags/[tag]` | Posts filtered by tag |
| `/api/last-visit` | Stores/returns the previous visitor's geolocation (shown in the "Latest Visit" pill) |

## Features

- **Content**: the original post MDX (from [joshwrn/portfolio-posts](https://github.com/joshwrn/portfolio-posts)) rendered with `next-mdx-remote` — custom `CodeSnippet`, `CloudImage`, `Tweet`, `Sandpack`, and `Math` (KaTeX) components
- **Code highlighting**: shiki with the Tokyo Night theme, line numbers, copy buttons
- **Interactive sandboxes**: real `@codesandbox/sandpack-react` embeds in the dial / node-graph posts
- **Design**: the site's original CSS custom properties, animated WebGL gradient background, sliding-letter hover buttons, floating pill nav with active indicator, dark/light theme toggle (persisted), chapters scroll-spy sidebar with reading progress, live PST clock, shimmer loading states
- Project videos are served from the original CloudFront CDN

## Structure

- `content/posts/*.mdx` — post content + frontmatter
- `src/lib/posts.ts` — content loading/tag aggregation
- `src/components/` — shared UI (`Nav`, `Footer`, `PostPreview`, `Background`, …)
- `src/components/post/` — MDX building blocks
