"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  language?: "mn" | "en";
  onLanguageChange?: () => void;
  transparent?: boolean;
};

export function Header({ language = "mn", onLanguageChange, transparent = false }: Props) {
  const [open, setOpen] = useState(false);
  const text = language === "mn"
    ? { timeline: "Он цаг", map: "Газрын зураг", culture: "Өв соёл", game: "Тоглоом" }
    : { timeline: "Timeline", map: "Map", culture: "Culture", game: "Games" };

  return (
    <header className={`siteHeader ${transparent ? "headerTransparent" : ""}`}>
      <Link href="/" className="brand">
        <span className="brandSeal">ᠮ</span>
        <span><strong>SteppeQuest</strong><small>{language === "mn" ? "Монголын түүхэн аялал" : "Explore Mongolia"}</small></span>
      </Link>
      <button className="mobileMenu" type="button" onClick={() => setOpen((value) => !value)} aria-label="Menu">☰</button>
      <nav className={open ? "navOpen" : ""}>
        <Link href="/#timeline" onClick={() => setOpen(false)}>{text.timeline}</Link>
        <Link href="/#map" onClick={() => setOpen(false)}>{text.map}</Link>
        <Link href="/#culture" onClick={() => setOpen(false)}>{text.culture}</Link>
        <Link href="/#games" onClick={() => setOpen(false)}>{text.game}</Link>
      </nav>
      <div className="headerActions">
        {onLanguageChange && <button className="languageSwitch" onClick={onLanguageChange}>{language === "mn" ? "EN" : "MN"}</button>}
      </div>
    </header>
  );
}
