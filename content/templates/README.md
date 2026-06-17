# Templates

Copy a file from here into the right folder, then fill in the frontmatter. This file isn't published (only `blog/`, `book-notes/`, `lesson-notes/`, and `creations/` are scanned). The full walkthrough lives in `content/Агуулгын удирдамж.md`.

## Which template?

| I'm writing… | Copy | Into |
| --- | --- | --- |
| A post / essay | `article.md` or `essay.md` | `content/blog/` |
| A project update | `project-log.md` | `content/blog/` |
| An internship writeup | `internship.md` | `content/blog/` |
| A contest recap | `contest.md` | `content/blog/` |
| A single book review | `book-review.md` | `content/blog/` |
| Book notes (chapters) | `book-note/` (whole folder) | `content/book-notes/[book]/` |
| Course notes (lessons) | `lesson-note/` (whole folder) | `content/lesson-notes/[course]/` |

For folder types, rename the folder to the book/course title; keep `index.md` and add one file per chapter/lesson.

## Frontmatter fields

| Field | Used by | Notes |
| --- | --- | --- |
| `title` | all | Required. |
| `date` | all | `YYYY-MM-DD`. Drives ordering. |
| `label` | index files | One of the labels above (chapter files don't need it). |
| `description` | all | Shown on cards and as the meta/OG description. |
| `tags` | all | List; each becomes a node in the `/tags` graph. Case-sensitive. |
| `cover` | optional | Path like `resources/images/folder/cover.jpg` (or an absolute URL). `.gif` works. |
| `draft` | all | `true` hides it from the site. Start drafts as `true`. |
| `author` | book-review, book-note | Author name. |
| `rating` | book-review, book-note | 1–5, decimals allowed (e.g. `4.5`). |
| `genre`, `pages` | book-review, book-note | Shown in the book header. |
| `new-word` | chapter / lesson files | Vocabulary list → flip-to-reveal review widget in the sidebar. |
| `music` | optional | Background track — a YouTube link or an audio file (`resources/audio/song.mp3`). |
| `lang` | optional | Post language: `en` / `mn` / `ja`. Only needed when you write translations. |
| `translation-key` | optional | Shared key linking translations of the same post (see below). |

`read time` is computed automatically from word count — don't set it.

## Translations

To publish a post in more than one language, make **one file per language** and give them the **same `translation-key`** plus their own `lang`:

```yaml
# my-trip.md
title: My Trip to Tokyo
lang: en
translation-key: tokyo-trip
```
```yaml
# токио-аялал.md
title: Токио аялал
lang: mn
translation-key: tokyo-trip
```

The site then shows **one card** per group (the variant matching the reader's language, falling back to the original), and a small **"Also in: EN · МН"** switcher on the post linking the versions. Search engines get `hreflang` tags automatically. Posts without a `translation-key` are standalone — nothing changes.

## `new-word` format

```yaml
new-word:
  - word: パーセプトロン
    definition: The earliest artificial-neuron algorithm.
  - "閾値: threshold value"   # shorthand: "word: definition"
```

## Naming chapters

Files in a `book-note` / `lesson-note` folder are sorted by **filename**.

- Book notes: `1章 Name.md`, `2章 Name.md` … (Japanese chapter style)
- Lesson notes: free-form topic names (`Inheritance.md`), or prefix with `01 `, `02 ` when order matters.
