export type Locale = "en" | "mn" | "ja"
export const defaultLocale: Locale = "en"
export const locales: Locale[] = ["en", "mn", "ja"]
export const localeLabels: Record<Locale, string> = { en: "EN", mn: "МН", ja: "日" }

const dict = {
  en: {
    nav: { home: "Home", blog: "Blog", notes: "Notes", creations: "Creations", about: "About" },
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
      related: "Related",
      newWords: "New Words",
      review: "Review",
      reveal: "Tap to reveal",
    },
    blog: {
      "book-review": "Book Review",
      "book-note": "Book Notes",
      internship: "Internship",
      "project-log": "Project Log",
      contest: "Contest",
      essay: "Essay",
      article: "Article",
      "lesson-note": "Lesson Note",
    },
    home: {
      intro:
        "Hi! I'm Bilguun. This is my room — a space for my creations, writings, and things I find worth remembering.",
    },
    about: {
      greeting: "Hello,",
      experience: "Experience",
      more: "More",
      bio1: "I'm Bilguun, a software engineer from Ulaanbaatar, Mongolia.",
      bio2: "I build web and mobile apps — with a particular interest in creative interfaces, 3D graphics, and tools that feel alive to use.",
      bio3: "Currently learning Japanese and building Ivo, a dictionary and flashcard app designed to stay out of the way.",
      moreBody: "I also write about programming, language learning, and other random stuff on my personal blog. If you want to chat or collaborate on something, feel free to reach out!",
      blogLink: "my personal blog",
    },
    creations: { heading: "Creations" },
    graph: { hub: "hub", tag: "tag", blog: "blog", creation: "creation" },
    tag: { item: "item", items: "items" },
    settings: { title: "Settings", theme: "Theme", language: "Language", dark: "Dark", light: "Light" },
    notFound: { message: "This page could not be found.", back: "Back Home" },
  },
  mn: {
    nav: { home: "Нүүр", blog: "Блог", notes: "Тэмдэглэл", creations: "Бүтээлүүд", about: "Миний тухай" },
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
      related: "Холбоотой",
      newWords: "Шинэ үгс",
      review: "Давтах",
      reveal: "Дарж харах",
    },
    blog: {
      "book-review": "Номын сэтгэгдэл",
      "book-note": "Номын тэмдэглэл",
      internship: "Дадлага",
      "project-log": "Төслийн тэмдэглэл",
      contest: "Уралдаан",
      essay: "Эссэ",
      article: "Нийтлэл",
      "lesson-note": "Хичээлийн тэмдэглэл",
    },
    home: {
      intro:
        "Сайн уу! Би Билгүүн. Энэ бол миний өрөө — бүтээл, бичвэр, санахад үнэ цэнэтэй зүйлсийн минь зай.",
    },
    about: {
      greeting: "Сайн уу,",
      experience: "Туршлага",
      more: "Бусад",
      bio1: "Би Билгүүн, Улаанбаатараас ирсэн программ хангамжийн инженер.",
      bio2: "Би веб болон мобайл апп хөгжүүлдэг — бүтээлч интерфейс, 3D график, хэрэглэхэд амьд мэт мэдрэгдэх хэрэгслүүдэд онцгой сонирхолтой.",
      bio3: "Одоогоор Япон хэл сурч, толь бичиг болон флэшкард апп болох Ivo-г хөгжүүлж байна.",
      moreBody: "Мөн хувийн блог дээрээ програмчлал, хэл сурах болон бусад сонирхолтой зүйлсийн тухай бичдэг. Хэрэв ярилцах эсвэл хамтран ажиллахыг хүсвэл чөлөөтэй холбоо барьж болно!",
      blogLink: "хувийн блог",
    },
    creations: { heading: "Бүтээлүүд" },
    graph: { hub: "гол", tag: "тэг", blog: "блог", creation: "бүтээл" },
    tag: { item: "зүйл", items: "зүйл" },
    settings: { title: "Тохиргоо", theme: "Гэрэл горим", language: "Хэл", dark: "Харанхуй", light: "Цайвар" },
    notFound: { message: "Хуудас олдсонгүй.", back: "Нүүр хуудас руу" },
  },
  ja: {
    nav: { home: "ホーム", blog: "ブログ", notes: "ノート", creations: "制作物", about: "について" },
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
      related: "関連記事",
      newWords: "新しい単語",
      review: "復習",
      reveal: "タップして表示",
    },
    blog: {
      "book-review": "書評",
      "book-note": "読書ノート",
      internship: "インターン",
      "project-log": "プロジェクト",
      contest: "コンテスト",
      essay: "エッセイ",
      article: "記事",
      "lesson-note": "授業ノート",
    },
    home: {
      intro:
        "こんにちは！ビルグンです。ここは私の部屋 ― 制作物、記事、心に残るものたちの空間です。",
    },
    about: {
      greeting: "こんにちは、",
      experience: "経歴",
      more: "その他",
      bio1: "ビルグンです。モンゴルのウランバートル出身のソフトウェアエンジニアです。",
      bio2: "ウェブ・モバイルアプリを開発しています。クリエイティブなUI、3Dグラフィックス、使っていて生き生きと感じるツールに特に関心があります。",
      bio3: "現在、日本語を学びながら、邪魔にならない設計の辞書・フラッシュカードアプリ「Ivo」を開発中です。",
      moreBody: "個人ブログでは、プログラミングや語学学習などについても書いています。話したいことやコラボしたいことがあれば、気軽に連絡してください！",
      blogLink: "個人ブログ",
    },
    creations: { heading: "制作物" },
    graph: { hub: "ハブ", tag: "タグ", blog: "ブログ", creation: "制作" },
    tag: { item: "件", items: "件" },
    settings: { title: "設定", theme: "テーマ", language: "言語", dark: "ダーク", light: "ライト" },
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
