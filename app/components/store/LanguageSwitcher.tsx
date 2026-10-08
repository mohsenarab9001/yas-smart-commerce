"use client";

import { useEffect, useState } from "react";
import type { Locale } from "../../lib/i18n/config";

type LanguageSwitcherProps = {
  locale: Locale;
};

type LanguageChoice = Locale | "auto";

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const [choice, setChoice] = useState<LanguageChoice>(locale);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith("yas-locale="));

    if (!cookie) {
      setChoice("auto");
      return;
    }

    const value = cookie.split("=")[1];

    if (value === "fa" || value === "en") {
      setChoice(value);
    } else {
      setChoice("auto");
    }
  }, [locale]);

  function changeLanguage(nextChoice: LanguageChoice) {
    if (saving || nextChoice === choice) return;

    setSaving(true);

    if (nextChoice === "auto") {
      document.cookie = "yas-locale=; Path=/; Max-Age=0; SameSite=Lax";
    } else {
      document.cookie = `yas-locale=${nextChoice}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }

    window.location.reload();
  }

  return (
    <div
      className="flex items-center rounded-2xl border border-white/10 bg-white/[0.06] p-1"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => changeLanguage("auto")}
        aria-pressed={choice === "auto"}
        disabled={saving}
        className={`rounded-xl px-2.5 py-2 text-xs font-bold transition ${
          choice === "auto"
            ? "bg-white/10 text-white"
            : "text-white/55 hover:bg-white/10 hover:text-white"
        }`}
      >
        خودکار
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("fa")}
        aria-pressed={choice === "fa"}
        disabled={saving}
        className={`rounded-xl px-2.5 py-2 text-xs font-bold transition ${
          choice === "fa"
            ? "bg-white/10 text-white"
            : "text-white/55 hover:bg-white/10 hover:text-white"
        }`}
      >
        فارسی
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        aria-pressed={choice === "en"}
        disabled={saving}
        className={`rounded-xl px-2.5 py-2 text-xs font-bold transition ${
          choice === "en"
            ? "bg-white/10 text-white"
            : "text-white/55 hover:bg-white/10 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
