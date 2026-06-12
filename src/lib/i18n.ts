export type Locale = "en" | "mn" | "ja"
export const defaultLocale: Locale = "en"
export const locales: Locale[] = ["en", "mn", "ja"]
export const localeLabels: Record<Locale, string> = { en: "EN", mn: "МН", ja: "日" }

const dict = {
  en: {
    nav: { home: "Home", blog: "Blog", creations: "Creations", about: "About" },
    ui: {
      allTags: "All Tags",
      readPost: "Read Post",
      viewCreation: "View Creation",
      continueReading: "Continue Reading",
      view: "View",
      liveDemo: "Live Demo",
      sourceCode: "Source Code",
      latestVisit: "Latest Visit",
      getInTouch: "Get In Touch",
      builtWith: "Built with curiosity",
      copied: "Copied!",
      scrollHint: "scroll to zoom · drag to pan · click to open",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
    },
    blog: {
      "book-review": "Book Review",
      internship: "Internship",
      "project-log": "Project Log",
      contest: "Contest",
      essay: "Essay",
      note: "Note",
    },
    home: {
      intro:
        "Hi! I'm Bilguun. This is my room — a space for my creations, writings, and things I find worth remembering.",
    },
    about: {
      greeting: "Hello,",
      experience: "Experience",
    },
    creations: { heading: "Creations" },
    graph: { tag: "tag", blog: "blog", creation: "creation" },
    tag: { item: "item", items: "items" },
    notFound: { message: "This page could not be found.", back: "Back Home" },
  },
  mn: {
    nav: { home: "Нүүр", blog: "Блог", creations: "Бүтээлүүд", about: "Миний тухай" },
    ui: {
      allTags: "Бүх тэг",
      readPost: "Уншах",
      viewCreation: "Харах",
      continueReading: "Үргэлжлүүлэх",
      view: "Харах",
      liveDemo: "Демо",
      sourceCode: "Код",
      latestVisit: "Сүүлийн зочин",
      getInTouch: "Холбоо барих",
      builtWith: "Сониуч зантайгаар бүтсэн",
      copied: "Хуулагдлаа!",
      scrollHint: "гүйлгэж томруул · чирж нүүлгэ · дар нээ",
      lightMode: "Цайвар горим",
      darkMode: "Харанхуй горим",
    },
    blog: {
      "book-review": "Номын сэтгэгдэл",
      internship: "Дадлага",
      "project-log": "Төслийн тэмдэглэл",
      contest: "Уралдаан",
      essay: "Эссэ",
      note: "Тэмдэглэл",
    },
    home: {
      intro:
        "Сайн уу! Би Билгүүн. Энэ бол миний өрөө — бүтээл, бичвэр, санахад үнэ цэнэтэй зүйлсийн минь зай.",
    },
    about: {
      greeting: "Сайн уу,",
      experience: "Туршлага",
    },
    creations: { heading: "Бүтээлүүд" },
    graph: { tag: "тэг", blog: "блог", creation: "бүтээл" },
    tag: { item: "зүйл", items: "зүйл" },
    notFound: { message: "Хуудас олдсонгүй.", back: "Нүүр хуудас руу" },
  },
  ja: {
    nav: { home: "ホーム", blog: "ブログ", creations: "制作物", about: "について" },
    ui: {
      allTags: "全タグ",
      readPost: "読む",
      viewCreation: "見る",
      continueReading: "続きを読む",
      view: "開く",
      liveDemo: "デモ",
      sourceCode: "コード",
      latestVisit: "最近の訪問",
      getInTouch: "お問い合わせ",
      builtWith: "好奇心で作った",
      copied: "コピー済み",
      scrollHint: "スクロールで拡大・ドラッグで移動・クリックで開く",
      lightMode: "ライトモード",
      darkMode: "ダークモード",
    },
    blog: {
      "book-review": "書評",
      internship: "インターン",
      "project-log": "プロジェクト",
      contest: "コンテスト",
      essay: "エッセイ",
      note: "メモ",
    },
    home: {
      intro:
        "こんにちは！ビルグンです。ここは私の部屋 ― 制作物、記事、心に残るものたちの空間です。",
    },
    about: {
      greeting: "こんにちは、",
      experience: "経歴",
    },
    creations: { heading: "制作物" },
    graph: { tag: "タグ", blog: "ブログ", creation: "制作" },
    tag: { item: "件", items: "件" },
    notFound: { message: "ページが見つかりません。", back: "ホームへ" },
  },
} as const

type Dict = typeof dict.en
type PathsOf<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T]: PathsOf<T[K], Prefix extends "" ? `${string & K}` : `${Prefix}.${string & K}`>
    }[keyof T]

export type TKey = PathsOf<Dict>

export function t(locale: Locale, key: string): string {
  const parts = key.split(".")
  let cur: unknown = dict[locale]
  for (const p of parts) cur = (cur as Record<string, unknown>)?.[p]
  if (typeof cur === "string") return cur
  // fallback to en
  cur = dict.en
  for (const p of parts) cur = (cur as Record<string, unknown>)?.[p]
  return typeof cur === "string" ? cur : key
}
