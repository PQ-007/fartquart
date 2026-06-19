export type Locale = "en" | "mn" | "ja"
export const defaultLocale: Locale = "en"
export const locales: Locale[] = ["en", "mn", "ja"]

export const localeLabels: Record<Locale, string> = {
  en: "ENGLISH",
  mn: "МОНГОЛ",
  ja: "日本語",
}

const dict = {
  en: {
    nav: {
      home: "Home",
      blog: "Blog",
      notes: "Notes",
      creations: "Creations",
      about: "About",
    },
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
      builtWith: "There is no value in anything until it is finished.",
      copied: "Copied!",
      scrollHint: "scroll to zoom · drag to pan · click to open",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      related: "Related",
      newWords: "New Words",
      review: "Review",
      reveal: "Tap to reveal",
      readIn: "Also in",
      search: "Search",
      searchPlaceholder: "Search posts, notes, creations…",
      searchEmpty: "No results",
      searchHint: "↑↓ to navigate · ↵ to open · esc to close",
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
        "Hi! This is a personal space for creations, writings, and things worth remembering.",
    },
    about: {
      greeting: "Hello,",
      experience: "Experience",
      more: "More",
      bio1: "My name is Bilguuntushig.",
      bio2: "I'm a computer science student interested in game development, hardware with bio integration, linguistics, and history.",
      bio3: "Ex nihilo nihil fit, Audentes fortuna iuvat.",
      moreBody:
        "This is a space for sharing thoughts, projects, and experiments. Feel free to reach out!",
      blogLink: "personal blog",
    },
    creations: { heading: "Creations" },
    graph: { hub: "hub", tag: "tag", blog: "blog", creation: "creation" },
    tag: { item: "item", items: "items" },
    settings: {
      title: "Settings",
      theme: "Theme",
      language: "Language",
      dark: "Dark",
      light: "Light",
    },
    notFound: {
      message: "This page could not be found.",
      back: "Back Home",
    },
  },

  mn: {
    nav: {
      home: "Нүүр",
      blog: "Блог",
      notes: "Тэмдэглэл",
      creations: "Бүтээлүүд",
      about: "Миний тухай",
    },
    ui: {
      allTags: "Бүх тэг",
      readPost: "Унших",
      viewCreation: "Харах",
      continueReading: "Үргэлжлүүлэх",
      view: "Харах",
      liveDemo: "Демо",
      sourceCode: "Код",
      latestVisit: "Сүүлийн зочин",
      getInTouch: "Холбоо барих",
      builtWith: "“There is no value in anything until it is finished.” ",
      copied: "Хуулагдлаа!",
      scrollHint: "гүйлгэж томруул · чирж нүүлгэ · дар нээ",
      lightMode: "Цайвар горим",
      darkMode: "Харанхуй горим",
      related: "Холбоотой",
      newWords: "Шинэ үгс",
      review: "Давтах",
      reveal: "Дарж харах",
      readIn: "Өөр хэлээр",
      search: "Хайх",
      searchPlaceholder: "Пост, тэмдэглэл, бүтээл хайх…",
      searchEmpty: "Үр дүн алга",
      searchHint: "↑↓ сонгох · ↵ нээх · esc хаах",
    },
    blog: {
      "book-review": "Номын сэтгэгдэл",
      "book-note": "Номын тэмдэглэл",
      internship: "Дадлага",
      "project-log": "Төслийн тэмдэглэл",
      contest: "Уралдаан",
      essay: "Эсээ",
      article: "Нийтлэл",
      "lesson-note": "Хичээлийн тэмдэглэл",
    },
    home: {
      intro:
        "There is no magic, just abstraction layers built on top of one another...",
    },
    about: {
      greeting: "Сайн уу,",
      experience: "Туршлага",
      more: "Бусад",
      bio1: "Намайг А.Билгүүнтүшиг гэдэг.",
      bio2: "Компьютерын ухаанаар сурдаг. Видео тоглоомын хөгжүүлэлт, био суурьтай hardware, хэл судлал, түүх сонирхдог.",
      bio3: "Ex nihilo nihil fit, Audentes fortuna iuvat.",
      moreBody:
        "Энд би бүтээл, санаа, туршилтаа хуваалцдаг. Холбогдохыг хүсвэл чөлөөтэй хандаарай!",
      blogLink: "хувийн блог",
    },
    creations: { heading: "Бүтээлүүд" },
    graph: { hub: "гол", tag: "тэг", blog: "блог", creation: "бүтээл" },
    tag: { item: "зүйл", items: "зүйл" },
    settings: {
      title: "Тохиргоо",
      theme: "Сэдэв",
      language: "Хэл",
      dark: "Харанхуй",
      light: "Цайвар",
    },
    notFound: {
      message: "Хуудас олдсонгүй.",
      back: "Нүүр хуудас руу",
    },
  },

  ja: {
    nav: {
      home: "ホーム",
      blog: "ブログ",
      notes: "ノート",
      creations: "制作物",
      about: "私について",
    },
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
      builtWith: "There is no value in anything until it is finished.",
      copied: "コピー済み",
      scrollHint: "スクロールで拡大・ドラッグで移動・クリックで開く",
      lightMode: "ライトモード",
      darkMode: "ダークモード",
      related: "関連記事",
      newWords: "新しい単語",
      review: "復習",
      reveal: "タップして表示",
      readIn: "他の言語",
      search: "検索",
      searchPlaceholder: "記事・ノート・制作物を検索…",
      searchEmpty: "結果なし",
      searchHint: "↑↓ で移動 · ↵ で開く · esc で閉じる",
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
        "この空間は、制作物・記事・記録をまとめた個人サイトです。",
    },
    about: {
      greeting: "こんにちは、",
      experience: "経歴",
      more: "その他",
      bio1: "私の名前はビルグントゥシグです。",
      bio2: "ゲーム開発、バイオインテグレーションを伴うハードウェア、言語学、歴史に興味のあるコンピュータサイエンスの学生です。",
      bio3: "Ex nihilo nihil fit, Audentes fortuna iuvat.",
      moreBody:
        "ここでは思考やプロジェクトを共有しています。気軽に連絡してください！",
      blogLink: "個人ブログ",
    },
    creations: { heading: "制作物" },
    graph: { hub: "ハブ", tag: "タグ", blog: "ブログ", creation: "制作" },
    tag: { item: "件", items: "件" },
    settings: {
      title: "設定",
      theme: "テーマ",
      language: "言語",
      dark: "ダーク",
      light: "ライト",
    },
    notFound: {
      message: "ページが見つかりません。",
      back: "ホームへ",
    },
  },
} as const

type Dict = typeof dict.en

type PathsOf<T, Prefix extends string = ""> = T extends string
  ? Prefix
  : {
      [K in keyof T]: PathsOf<
        T[K],
        Prefix extends "" ? `${string & K}` : `${Prefix}.${string & K}`
      >
    }[keyof T]

export type TKey = PathsOf<Dict>

export function t(locale: Locale, key: string): string {
  const parts = key.split(".")
  let cur: unknown = dict[locale]

  for (const p of parts) {
    cur = (cur as Record<string, unknown>)?.[p]
  }

  if (typeof cur === "string") return cur

  // fallback to en
  cur = dict.en
  for (const p of parts) {
    cur = (cur as Record<string, unknown>)?.[p]
  }

  return typeof cur === "string" ? cur : key
}