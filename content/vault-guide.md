---
title: Vault Guide
date: 2026-06-14
label: article
description: Сайтад агуулга нэмэх бүрэн заавар — директор, label, frontmatter, MDX компонент, ном ба хичээлийн тэмдэглэл.
tags:
  - Meta
draft: true
---

> Энэ файл `content/` хавтасны үндэст байрладаг тул сайтад **нийтлэгдэхгүй** — зөвхөн өөрийн лавлах заавар. Шинэ агуулга үүсгэхдээ `content/templates/` доторх загвар файлыг хуулж аваад бөглө.

## Директорийн бүтэц

```
content/
  blog/                    → /blog дээр гарна
  book-notes/[номын нэр]/   → /notes дээр гарна (бүлэгтэй)
    index.md               → номын нүүр хуудас
    1章 ....md             → бүлэг тус бүр
  lesson-notes/[курсын нэр]/ → /notes дээр гарна (хичээлтэй)
    index.md               → курсын нүүр хуудас
    Хичээл нэр.md          → хичээл тус бүр
  creations/               → /creations дээр гарна
  resources/images/        → нүүр зургууд (cover) энд хадгална
```

---

## Label — агуулгын төрөл

`label` талбар нь агуулгыг **хаана** харагдах, **ямар** хэлбэртэй байхыг тодорхойлно.

| Label | Хаана гарна | Файл байршил | Хэлбэр |
|---|---|---|---|
| `article` | /blog | `content/blog/` | Нэг файл |
| `essay` | /blog | `content/blog/` | Нэг файл |
| `project-log` | /blog | `content/blog/` | Нэг файл |
| `internship` | /blog | `content/blog/` | Нэг файл |
| `contest` | /blog | `content/blog/` | Нэг файл |
| `book-review` | /blog/[slug] | `content/blog/` | Нэг файл, номын тусгай загвар |
| `book-note` | /notes | `content/book-notes/[нэр]/` | Хавтас, бүлэгтэй |
| `lesson-note` | /notes | `content/lesson-notes/[нэр]/` | Хавтас, хичээлтэй |

`/blog` хуудас дараах дарааллаар эрэмбэлэгдэнэ: **article → essay → project-log → internship → contest**.

---

## Blog пост — frontmatter

`content/blog/` дотор `.md` эсвэл `.mdx` файл үүсгэнэ.

```md
---
title: Гарчиг
date: 2026-01-15
label: essay
description: Товч тайлбар (карт дээр харагдана)
tags:
  - TagНэр
cover: resources/images/folder/cover.jpg
draft: false
---
```

- `draft: true` тавьвал сайтад **харагдахгүй** — бичиж байх үед тохиромжтой.
- `cover` нь заавал биш. Тавихгүй бол өнгөт градиент автоматаар үүснэ.
- `.gif` нүүр зураг дэмжигдэнэ.

---

## Book review — номын шүүмж

Нэг файл, `content/blog/` дотор. Нээхэд нүүр зураг, одны үнэлгээ, зохиолч, жанр, хуудасны тоог харуулсан **тусгай номын загвар** гарна.

```md
---
title: Clean Code
date: 2026-01-15
label: book-review
author: Robert C. Martin
rating: 4
genre: Software Engineering
pages: 431
description: Товч тайлбар
cover: resources/images/book-covers/clean-code.jpg
tags:
  - Engineering
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
date: 2025-09-13
label: book-note
author: 斎藤 康毅
rating: 5
genre: Deep Learning
pages: 318
description: Номын тухай товч танилцуулга
cover: resources/images/book-covers/deep-learning-1.jpg
tags:
  - Python
  - JP
---
Номын тухай товч танилцуулга...
```

**Бүлгийн файл** — `1章 нэр.md` (файлын нэрээр эрэмбэлэгдэнэ):

```md
---
title: 1章 — Гарчиг
date: 2025-10-01
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
date: 2026-02-01
label: lesson-note
description: OOP-ийн үндсэн ойлголтууд
cover: resources/images/folder/cover.jpg
tags:
  - CS
---
Курсын товч танилцуулга...
```

**Хичээлийн файл** — `Inheritance.md` гэх мэт сэдвийн нэрээр, эсвэл дараалал чухал бол `01 Нэр.md` гэж тоогоор эхэлж болно (файлын нэрээр эрэмбэлэгдэнэ):

```md
---
title: Inheritance
date: 2026-02-03
new-word:
  - word: 
    definition: 
draft: false
---
Хичээлийн агуулга...
```

---

## Creation — бүтээл

`/creations` дээр гарна. `content/creations/` дотор `.md` эсвэл `.mdx`.

```md
---
title: Ivo
description: Японы толь бичиг апп
date: 2026-06-01
tags: [mobile, swift, ios]
cover: resources/images/folder/cover.jpg
demo: https://example.com
repo: https://github.com/user/ivo
youtube: dQw4w9WgXcQ
draft: false
---
```

`youtube` талбар байвал нүүрэнд бичлэг тоглуулагч, байхгүй бол `cover` зураг харагдана.

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

`tags` массивын утга бүр `/tags` графт зангилаа болж харагдана. `label`-ийн нэр автоматаар tag-д тооцогдоно. Том/жижиг үсэг ялгана — `Engineering` ба `engineering` нь өөр tag.

---

## Контент нэмэх товч дараалал

1. `content/templates/` доторх тохирох загварыг хуулж, зөв хавтаст байрлуул.
2. Frontmatter бөглө — `title`, `date`, `label`, `description` заавал.
3. `draft: true`-аар эхэл.
4. Нүүр зургийг `resources/images/`-д хийж, `cover` замыг зөв зааж өг.
5. Бичиж дуусаад `draft: false` болго.
