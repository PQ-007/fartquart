"use client"

import { useT } from "./LanguageProvider"

export const HomeHero = () => {
  const t = useT()
  return <p>{t("home.intro")}</p>
}
