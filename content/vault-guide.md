---
title: Vault Guide
date: 2026-07-06
label: article
description: Сайтад агуулга нэмэх бүрэн заавар — директор, label, frontmatter, MDX компонент, ном, хичээл, project-log тэмдэглэл.
tags:
  - meta
draft: true
---

> Энэ файл `content/` хавтасны үндэст байрладаг тул сайтад **нийтлэгдэхгүй** — зөвхөн өөрийн лавлах заавар. Шинэ агуулга үүсгэхдээ `content/templates/` доторх загвар файлыг хуулж аваад бөглө (тэнд бас богино `README.md` бий).

## Директорийн бүтэц

Хавтасны нэрний өмнө дараалал заасан тоон угтвар (`0000-`, `1000-`, гэх мэт) байж болно — код автоматаар тайлж танина (жишээ нь `0000-blog` ч, зүгээр `blog` ч ажиллана). Одоогийн vault-д ийм угтвар ашигласан:

```
content/
  0000-blog/                 → /blog дээр гарна
  1000-creations/            → /creations дээр гарна
  1500-project-notes/[нэр]/  → /creations/[slug] дээр "Project Log" болж хавсарна (өөрийн хуудасгүй)
    index.md                 → project-nickname-аар creation-той холбогдоно
    01-devlog-....md         → лог бичлэг тус бүр
  2000-book-notes/[номын нэр]/ → /notes дээр гарна (бүлэгтэй)
    index.md                 → номын нүүр хуудас
    1章 ....md               → бүлэг тус бүр
  3000-lesson-notes/[курсын нэр]/ → /notes дээр гарна (хичээлтэй)
    index.md                 → курсын нүүр хуудас
    01 Хичээл нэр.md         → хичээл тус бүр
  resources/images/          → нүүр зургууд (cover) энд хадгална
  templates/                 → хуулж ашиглах загвар файлууд
```

`content/4000-private/`, `content/5000-videos/`, `content/archieve/`, `content/Excalidraw/`, `content/.trash/` зэрэг бусад хавтас нь Obsidian-ий дотоод хэрэглээ — сайтад ямар ч холбоогүй, скан хийгддэггүй.

---

## Огнооны талбарууд

Хуучин файлууд ганцхан `date` талбар ашигладаг байсан бол одоо гурван талбартай:

| Талбар | Утга |
|---|---|
| `createdAt` | Бичиж эхэлсэн огноо — зөвхөн мэдээллийн зорилготой |
| `publishedAt` | Эрэмбэ болон харагдах огноог тодорхойлно; хоосон бол `createdAt`-аас авна |
| `updatedAt` | Нийтэлсний дараа мэдэгдэхүйц засвар хийвэл тавина — огнооны хажууд "Updated" гэж гарна |
| `date` | Хуучин формат — `createdAt`/`publishedAt`/`updatedAt` байхгүй үед nэн умчаар ашиглагдана, одоо ч бүрэн ажиллана |

Шинэ файлд `createdAt` + `publishedAt` хосыг ашигла, `date`-ийг зөвхөн хуучин файлд хэвээр үлдээ.

---

## Label — агуулгын төрөл

`label` талбар нь агуулгыг **хаана** харагдах, **ямар** хэлбэртэй байхыг тодорхойлно.

| Label | Хаана гарна | Файл байршил | Хэлбэр |
|---|---|---|---|
| `article` | /blog | `content/blog/` | Нэг файл |
| `essay` | /blog | `content/blog/` | Нэг файл |
| `internship` | /blog | `content/blog/` | Нэг файл |
| `contest` | /blog | `content/blog/` | Нэг файл |
| `book-review` | /blog/[slug] | `content/blog/` | Нэг файл, номын тусгай загвар |
| `book-note` | /notes | `content/book-notes/[нэр]/` | Хавтас, бүлэгтэй |
| `lesson-note` | /notes | `content/lesson-notes/[нэр]/` | Хавтас, хичээлтэй |
| `project-log` | /creations/[slug] | `content/project-notes/[нэр]/` | Хавтас, creation-д хавсаргана (`/blog`-д гарахгүй) |

`/blog` хуудас дараах дарааллаар эрэмбэлэгдэнэ: **article → essay → internship → contest**. (`project-log` нь `/blog`-д огт гарахгүй тул энэ жагсаалтад ороогүй.)

---

## Blog пост — frontmatter

`content/blog/` дотор `.md` эсвэл `.mdx` файл үүсгэнэ.

```md
---
title: Гарчиг
description: Товч тайлбар (карт дээр харагдана)
createdAt: 2026-01-10
publishedAt: 2026-01-15
updatedAt:
label: essay
tags:
  - TagНэр
cover: resources/images/folder/cover.jpg
music:
lang:
translation-key:
draft: false
---
```

- `draft: true` тавьвал сайтад **харагдахгүй** — бичиж байх үед тохиромжтой.
- `cover` нь заавал биш. Тавихгүй бол өнгөт градиент автоматаар үүснэ.
- `.gif` нүүр зураг дэмжигдэнэ.
- `music` нь заавал биш — YouTube линк эсвэл аудио файл (`resources/audio/song.mp3`).
- `lang` / `translation-key` нь орчуулгатай пост дээр ашиглана (доор тайлбарласан).

---

## Book review — номын шүүмж

Нэг файл, `content/blog/` дотор. Нээхэд нүүр зураг, одны үнэлгээ, зохиолч, жанр, хуудасны тоог харуулсан **тусгай номын загвар** гарна.

```md
---
title: Clean Code
description: Товч тайлбар
author: Robert C. Martin
rating: 4
genre: Software Engineering
pages: 431
createdAt: 2026-01-10
publishedAt: 2026-01-15
label: book-review
cover: resources/images/book-covers/clean-code.jpg
tags:
  - engineering
---
```

`rating` нь 1–5 (бутархай болно, ж: 4.5). Олон бүлэгтэй уншсан номыг бол доорх **book-note**-оор хий.

---

## Book note — номын тэмдэглэл (бүлэгтэй)

`/notes` дээр гарна. `content/book-notes/[номын нэр]/` хавтас дотор байрлана.

**`index.md`** — номын нүүр хуудас (бүлгүүдийн жагсаалт энд харагдана):

```md
---
title: ゼロから作る Deep Learning 1
description: Номын тухай товч танилцуулга
author: 斎藤 康毅
rating: 5
genre: Deep Learning
pages: 318
createdAt: 2025-09-10
publishedAt: 2025-09-13
label: book-note
cover: resources/images/book-covers/deep-learning-1.jpg
tags:
  - python
  - jp
---
Номын тухай товч танилцуулга...
```

**Бүлгийн файл** — `1章 нэр.md` (файлын нэрээр эрэмбэлэгдэнэ):

```md
---
title: 1章 — Гарчиг
createdAt: 2025-09-28
publishedAt: 2025-10-01
new-word:
  - word: パーセプトロン
    definition: Хиймэл нейроны анхдагч алгоритм.
  - word: 閾値 — Threshold
    definition: Нейрон галлах босго утга.
draft: false
---
Бүлгийн агуулга...
```

Бүлгүүдийн хооронд автоматаар **← Өмнөх / Дараах →** навигаци үүснэ. Баруун sidebar-т гарчгийн жагсаалт, агуулга дахь гадаад линкүүд **Sources**, мөн доорх **New Words** хэсэг харагдана.

`new-word` талбар хоёр форматтай:

```yaml
new-word:
  - word: Үг
    definition: Тодорхойлолт.
  - "Үг: Тодорхойлолт"
```

New Words хэсэгт үг дээр дарвал тодорхойлолт нь нээгдэнэ. **Review** товчоор флэшкарт горимд бүгдийг давтаж болно.

---

## Lesson note — хичээлийн тэмдэглэл

`/notes` дээр гарна. `content/lesson-notes/[курсын нэр]/` хавтас дотор. Book-note-той ижил бүтэцтэй боловч нүүрэн дээр **16:9 өргөн зураг** гарна.

**`index.md`** — курсын нүүр:

```md
---
title: Object Oriented Programming
description: OOP-ийн үндсэн ойлголтууд
createdAt: 2026-01-28
publishedAt: 2026-02-01
label: lesson-note
cover: resources/images/folder/cover.jpg
tags:
  - cs
---
Курсын товч танилцуулга...
```

**Хичээлийн файл** — `Inheritance.md` гэх мэт сэдвийн нэрээр, эсвэл дараалал чухал бол `01 Нэр.md` гэж тоогоор эхэлж болно (файлын нэрээр эрэмбэлэгдэнэ):

```md
---
title: 01 — Inheritance
createdAt: 2026-02-01
publishedAt: 2026-02-03
new-word:
  - word: 
    definition: 
draft: false
---
Хичээлийн агуулга...
```

---

## Project log — бүтээлийн явцын тэмдэглэл (бүлэгтэй)

Аль нэг creation-ийн хөгжүүлэлтийн явцыг бичих зориулалттай. `content/project-notes/[нэр]/` хавтас дотор байрлана.

`index.md` нь **өөрийн хуудас (route) үүсгэдэггүй** — book-note/lesson-note-ийн `index.md`-ээс ялгаатай. Уншигчийн харах цорын ганц "нүүр" бол холбогдсон creation-ийн `/creations/[slug]` хуудас өөрөө — тэр хуудас нь мэдээж index. `project-notes`-ийн `index.md` нь зөвхөн (1) `project-nickname`-аар аль creation-той холбогдохыг заах, (2) `title`/`description`/`category`/`tags`-ыг тухайн creation рүү дамжуулах metadata файл. Ингэснээр `/creations/[slug]` дээр **"Project Log"** хэсэг гарч, лог бичлэг бүр `/creations/[slug]/log/[entry]` дээр өөрийн хуудастай болно.

**`index.md`**:

```md
---
title: Ivo — Build Log
description: Ivo-г хөгжүүлж буй явцын тэмдэглэл
createdAt: 2026-06-14
publishedAt: 2026-06-14
cover: resources/images/covers/spinning-donut.gif
label: project-log
category: software
tags:
  - mobile-app
draft: false
project-nickname: ivo
---
Товч танилцуулга...
```

- `project-nickname` нь `content/creations/` доторх аль нэг creation-ий **slug**-тай яг таарч байх ёстой (жишээ дээр `ivo.md` → slug `ivo`). Таарахгүй бол лог хаана ч гарахгүй.
- `category` нь заавал биш — creation өөрөө `category` тавиагүй бол project-log-оос уламжлана.

**Лог бичлэг** — `01-devlog-0.md` гэх мэт (файлын нэрээр эрэмбэлэгдэнэ, дараалал чухал бол тоогоор эхэл):

```md
---
title: Devlog 0 — Setup
createdAt: 2026-06-14
publishedAt: 2026-06-14
draft: false
---
Энэ удаагийн ахиц...
```

---

## Creation — бүтээл

`/creations` дээр гарна. `content/creations/` дотор `.md` эсвэл `.mdx`.

```md
---
title: Ivo
description: Японы толь бичиг апп
createdAt: 2026-05-28
publishedAt: 2026-06-01
tags: [mobile, swift, ios]
cover: resources/images/folder/cover.jpg
category: software
demo: https://example.com
repo: https://github.com/user/ivo
youtube: dQw4w9WgXcQ
draft: false
---
```

`youtube` талбар байвал нүүрэнд бичлэг тоглуулагч, байхгүй бол `cover` зураг харагдана. `category` нь `hardware`, `software`, `web`, `3dmodel`, `game`, `robot`, `iot` дундаас нэг байх ёстой — `/creations` хуудсан дээр шүүлтүүр, мөн пилл болж харагдана. Хавсаргасан project-log байвал түүний tag-ууд ч нэмэгдэнэ.

`content/templates/creation.md`-г хуулж аваад бөглөнө.

---

## Орчуулга (Translations)

Нэг постыг олон хэл дээр нийтлэхийн тулд **хэл тус бүрт тусдаа файл** үүсгэж, аль алинд нь **ижил `translation-key`** өгнө:

```yaml
# my-trip.md
title: My Trip to Tokyo
lang: en
translation-key: tokyo-trip
```

```yaml
# tokio-ayalal.md
title: Токио аялал
lang: mn
translation-key: tokyo-trip
```

Сайт дээр эдгээр нь **нэг карт** болж харагдана (уншигчийн хэлэнд тохирох хувилбар, байхгүй бол эх хувилбар), постонд **"Also in: EN · МН"** сэлгэгч гарна. `translation-key`-гүй пост энгийнээрээ ажиллана — юу ч өөрчлөгдөхгүй.

---

## Код блок

Стандарт markdown fence ашиглана — автоматаар өнгөөр ялгана.

**Зөвхөн хэл зааж өгөх:**

````md
```python
print("Hello")
```
````

**Файлын нэрээр label харуулах** (өргөтгөлөөс хэл нь автоматаар тодорхойлогдоно):

````md
```Character.py
class Character:
    def __init__(self):
        self.health = 100
```
````

Дэмжигдсэн хэл: `tsx`, `ts`, `jsx`, `js`, `css`, `html`, `json`, `bash`, `python`, `rust`, `go`, `java`, `c`, `cpp`.

---

## MDX компонентууд

Зөвхөн `.mdx` өргөтгөлтэй файлд ажиллана.

```mdx
<YouTube id="dQw4w9WgXcQ" />
<Video src="/videos/demo.mp4" />
```

**Математик** (LaTeX, `.md`-д ч ажиллана):

```md
$$
y = \begin{cases} 0 & (x \leq \theta) \\ 1 & (x > \theta) \end{cases}
$$
```

Мөр дунд: `$x_1 + x_2$`

---

## Зураг

Нүүр зураг (`cover`) болон агуулга доторх зургийг `content/resources/images/` дотор хадгална. Frontmatter-т замыг `resources/`-оос эхлүүлж бичнэ:

```yaml
cover: resources/images/folder/cover.jpg
```

Агуулга дотор стандарт markdown:

```md
![Тайлбар](resources/images/folder/diagram.png)
```

Зургийг дарвал lightbox-д томоор нээгдэнэ.

---

## Tags

`tags` массивын утга бүр `/tags` графт зангилаа болж харагдана. `label`-ийн нэр автоматаар tag-д тооцогдоно. Том/жижиг үсэг ялгана — `Engineering` ба `engineering` нь өөр tag гэдгийг санаарай, тул tag бичихдээ **kebab-case** (жижиг үсэг, үг хооронд зураас, ж: `mobile-app`, `data-structures`) ашигла.

---

## Контент нэмэх товч дараалал

1. `content/templates/` доторх тохирох загварыг хуулж, зөв хавтаст байрлуул (creation-д загвар алга — шууд гараар бич).
2. Frontmatter бөглө — `title`, `description`, `publishedAt` (эсвэл `date`), `label` (index/single файлд) заавал.
3. `draft: true`-аар эхэл.
4. Нүүр зургийг `resources/images/`-д хийж, `cover` замыг зөв зааж өг.
5. Project-log бичиж байгаа бол `project-nickname`-аа creation-ий slug-тай тааруул.
6. Бичиж дуусаад `draft: false` болго.
