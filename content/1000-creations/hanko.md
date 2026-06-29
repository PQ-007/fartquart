---
title: Hanko
description: 10ten Japanese Reader-тэй хамт ажилладаг япон үг цээжлэх browser extension ба Next.js + Supabase дагалдах вэбсайт. Уншиж байхдаа үгээ багцдаа хадгалаад, монгол орчуулгатайгаар Anki руу экспортолно.
category: project
tags:
  - supabase
  - browser-extension
  - anki
  - japanese
  - nextjs
publishedAt: 2026-06-21
demo: https://hanko-amber.vercel.app
repo: https://github.com/PQ-007/hanko
cover: resources/images/hanko-cover.png
---
## Хийх сэдэл

Би япон хэл сурахдаа 10ten Japanese Reader extension байнга ашигладаг текст
дээр hover хийхэд утга, дуудлагыг нь шууд харуулдаг гайхалтай хэрэгсэл. Гэхдээ
түүнд **үгээ хадгалах** боломж байдаггүй. Уншиж байхдаа таалагдсан үгээ хаа нэгтээ
тэмдэглээд, дараа нь **Anki**-д оруулах гэхээр гар ажиллагаа их гардаг байлаа.

Тиймээс 10ten-тэй адилхан гэхдээ үгээ хадгалж болох extension хийхээр шийдсэн. 

Гол шаардлага гурван зүйл байсан:
1. Уншиж байхдаа нэг товшилтоор үгээ багцдаа хадгалах.
2. Утгыг нь **монгол хэл** рүү автоматаар орчуулах.
3. Эцэст нь жинхэнэ **`.apkg`** файл болгон Anki руу экспортлох.

Нэр нь **Hanko** (判子 — япон тамга) дажгүй сонсогдоод байсан болохоор сонгосон юм. Уриа нь *Verba non Acta* (үйлдэл биш үг л чухал тэрийг тэмдэглэнэ гэдэг санаа.).

---

## Архитектур

Систем гурван хэсэгтэй:

- **Browser extension** (`chrome/`, `firefox/`) — Manifest V3, build алхамгүй цэвэр
  JS. Текст сонгох, хадгалах, локал багц.
- **Вэбсайт** (`web/`) — Next.js (App Router) + Tailwind. Багц удирдах, засах,
  экспортлох UI.
- **Supabase** — Postgres + Auth (Google) + Row Level Security + Storage.

Supabase-ийн REST API, RLS, Authentication нь бүгдийг хийнэ. Extension нь Supabase руу **шууд** хандана (RLS нь хэрэглэгч бүрийг зөвхөн өөрийн мөрөнд хязгаарлана), вэб нь зөвхөн сервер логик шаардсан зүйлд (`.apkg` үүсгэх, орчуулга) API route ашиглана.

```
src/        extension гол код (sync модуль, config жишээ)
chrome/     Chrome build (service worker)
firefox/    Firefox build (scripts background)
web/        Next.js + Supabase вэб
supabase/   migration файлууд (decks / words / folders, RLS)
```

---

## Extension: үг хадгалах

Хэрэглэгч текст сонгоод баруун товч эсвэл `Alt+Shift+S` дарахад жижиг цонх гарч
ирнэ. Background script нь Jisho-ийн API руу хандаж дуудлага, утгыг автоматаар
бөглөнө (хуудасны Content-Security-Policy-аас зайлсхийхийн тулд lookup-ийг
content script биш, background дотор хийдэг).

Нэг сонирхолтой асуудал: **Firefox-ийн дотоод PDF viewer** web extension-ээс content script оруулахыг зөвшөөрдөггүй. Тиймээс PDF болон `file://` хуудсан дээр overlay гарч чаддаггүй. Үүнийг **тусдаа жижиг цонх** (`save.html`) нээж шийдсэн. 

```js
Promise.resolve(ctx.tabs.sendMessage(tab.id, { type: 'SHOW_SAVE_OVERLAY', text }))
  .catch(() => openSaveWindow(text)); // PDF / file дээрх fallback
```

---

## Толь бичгийн хэлбэрт оруулах (普通形)

Япон хэлэнд үйл үг олон хэлбэрт хувирдаг. Хэрэглэгч `担っています` гэдэг хэлбэртэй үг сонговол картдаа **үндсэн толь бичгийн хэлбэр** `担う`-г хадгална.

```ts
const jp = entry.japanese?.[0] ?? {};
const reading = jp.reading ?? "";
// Толгой хэлбэр: ханз бичлэг → slug → дуудлага
const word = jp.word ?? entry.slug ?? reading ?? "";
```

Ингэснээр `担っています → 担う`, `食べました → 食べる`, `高かった → 高い` болж
автоматаар хөрвөнө.

---

## Орчуулга: Англи → Монгол

Эхэндээ **bolor-toli**-ийн API-г холбохыг оролдсон ч тэр нь generate-лсан api token тааруулдаг эд  байх шиг байсан. Эцэст нь **jisho.org** api-аар япон → англи, **Google Translate**-ийн api-аар англи → **монгол** гэсэн дамжлагыг сонгосон. Орчуулга нь зөвхөн сервер тал дээр явагдана.

**Англи утгыг засаад Enter дарвал** монгол орчуулга шууд шинэчлэгдэнэ **монголыг засахад буцаагаад орчуулдаггүй** (нэг чиглэлийн логик).
Өмнө орчуулсан англи өөрчлөгдөөгүй бол дахин орчуулахгүй — ингэснээр гараар
засварласан монгол утгыг дарж бичихгүй:

```ts
function onMeaningBlur() {
  const text = meaning.trim();
  if (text && text !== lastEn.current) translate(text); // зөвхөн өөрчлөгдсөн үед
}
```

---

## Вэбсайт: багц | deck удирдах

Вэб нь **хар-цагаан** цэвэрхэн загвартай. Гол боломжууд:

- **Карт / Жагсаалт** харах. Карт нь дээр нь hover хийхэд **эргэдэг**
  (flashcard): урд талд япон үг + дуудлага, ард талд монгол + англи утга. CSS 3D
  `transform-style: preserve-3d` + `backface-visibility: hidden`-оор хийсэн.
- **Хавтас** — folder→deck модны бүтэцтэй sidebar. Багцыг **чирч** (drag & drop)
  хавтас руу оруулах/гаргах.
- **Үг засах modal** — англи засахад монгол автоматаар шинэчлэгдэх, Jisho-оос
  дахин хайх товчтой.
- **Хайлт** — үг/дуудлага/англи/монголоор бүх багцаас debounce-той хайна.
- **Шинэчлэх** товч — extension-ээр нэмсэн үгсийг дахин ачаална.

`web/` нь компонентоор цэгцтэй салгагдсан: `_lib/` (Supabase client, монгол текст
`T`, төрлүүд), `_components/` (Sidebar, DeckHeader, DeckDetail, WordRow,
WordEditModal, AddWordForm, SearchResults).

---

## Синк: Олон төхөөрөмж

Хамгийн төвөгтэй хэсэг нь extension-ий нэвтрэлт байсан. Эхэндээ
`identity.launchWebAuthFlow` ашигласан ч Firefox дээр найдваргүй байв. Эцэст нь
илүү бат бөх аргад шилжсэн:

1. Extension вэбийн `/extension/connect` хуудсыг энгийн табд нээнэ.
2. Хэрэглэгч Google-ээр нэвтэрнэ.
3. Тэр хуудас session-ийг `window.postMessage`-ээр **content-script гүүр**-т
   дамжуулна.
4. Content script нь background руу дамжуулж storage-д хадгална.

Энэ нь Chrome, Firefox хоёрт ижил ажиллана. Нэвтэрсний дараа extension Supabase руу шууд хандаж багцуудаа синк хийнэ; нэвтрээгүй үед зөвхөн локалаар
(`storage.local`) ажиллана. Устгалыг **tombstone** (`deleted: true`) болон
`updated_at`-аар «last-write-wins» зарчмаар шийднэ.

---

## Anki `.apkg` үүсгэх

`.apkg` нь үнэндээ SQLite сан (`collection.anki2`) + media-г нэг zip болгосон
хэлбэр. Гадны муудсан wrapper-аас хамаарахгүйн тулд `sql.js` (WASM) + `JSZip`-ээр genanki-тэй ижил бүтцийг **өөрсдөө** угсарсан:

```ts
const SQL = await getSql();           // sql.js, WASM-ийг fs-ээс уншина
const db = new SQL.Database();
db.run(SCHEMA_SQL);                    // col / notes / cards / revlog / graves
// ... notes + cards оруулаад ...
const zip = new JSZip();
zip.file("collection.anki2", db.export());
zip.file("media", JSON.stringify(media));
return zip.generateAsync({ type: "uint8array" });
```

> **Анхаарах:** Turbopack нь `require.resolve("sql.js")`-ийг виртуал ID болгож
> хувиргадаг тул WASM файлыг бодит зам (`process.cwd()`)-аар хайж олох хэрэгтэй
> болсон. Vercel дээр `outputFileTracingIncludes`-оор WASM-ийг bundle-д оруулна.

Үг бүрд **дуудлагын аудио** (TTS) үүсгээд `.apkg`-д `[sound:...]` болгон
шигтгэдэг тул карт нь дуутайгаар импортлогддог.

---

## Дүгнэлт

Hanko бол өдөр тутмын жинхэнэ хэрэгцээнээс төрсөн төсөл — би өөрөө япон уншиж байхдаа ашиглахын тулд хийсэн. Хамгийн их сурсан зүйл маань:

- **Supabase RLS** ашиглавал синк серверийг бараг бичихгүйгээр олон төхөөрөмж
  хооронд найдвартай синк хийж болдог.
- Browser extension платформын **хязгаарлалтууд** (PDF viewer, Firefox vs
  Chrome API ялгаа) нь хамгийн их цаг авдаг — fallback-уудыг сайн бодох хэрэгтэй.
- Жижиг UX нарийвчлал (普通形 хөрвүүлэлт, нэг чиглэлийн орчуулга, эргэдэг карт) нь надад үнэхээр хэрэгтэй байсан.

