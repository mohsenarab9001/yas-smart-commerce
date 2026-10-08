"use client";

import { useEffect, useState } from "react";
import YasSearch from "../home/YasSearch";
import type { Locale } from "../../lib/i18n/config";

const OPEN_EVENT = "yas-open-search";

type GlobalSearchProps = {
  locale: Locale;
};

export default function GlobalSearch({
  locale,
}: GlobalSearchProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      setOpen(true);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener(OPEN_EVENT, handleOpen);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-3 backdrop-blur-xl sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={locale === "fa" ? "جستجوی YAS" : "YAS Search"}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setOpen(false);
        }
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            aria-label={locale === "fa" ? "بستن جستجو" : "Close search"}
            onClick={() => setOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-xl text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <YasSearch locale={locale} />
      </div>
    </div>
  );
}

export { OPEN_EVENT as YAS_OPEN_SEARCH_EVENT };
