"use client";
import { useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";
import { useAudio } from "../../lib/audio/AudioProvider";
import type { Locale } from "../../lib/i18n/config";
import { understandSearchQuery } from "../../lib/ai/service";
import { searchProducts } from "../../lib/search/engine";
import type { SearchResult } from "../../lib/search/types";

type YasSearchProps = {
  locale: Locale;
};

const content = {
  fa: {
    label: "YAS AI",
    title: "هر چیزی که می‌خواهی پیدا کن",
    placeholder: "مثلاً یک لپ‌تاپ برای بازی تا ۵۰ میلیون می‌خوام...",
    helper: "هرآنچه می‌خواهی بنویس؛ یاس منظور تو را می‌فهمد.",
    examples: [
      "لپ‌تاپ مناسب بازی و کار",
      "هدفون خوب برای ورزش",
      "هدیه برای تولد",
    ],
    search: "جستجوی هوشمند",
    typing: "در حال آماده‌سازی درخواست...",
  },
  en: {
    label: "YAS AI",
    title: "Find anything you need",
    placeholder: "For example: I need a gaming laptop under $1,000...",
    helper: "Write anything you want; YAS understands what you mean.",
    examples: [
      "A laptop for gaming and work",
      "Good headphones for workouts",
      "A birthday gift",
    ],
    search: "Smart search",
    typing: "Preparing your request...",
  },
} as const;

export default function YasSearch({ locale }: YasSearchProps) {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchRequestRef = useRef(0);

  const t = content[locale === "en" ? "en" : "fa"];
  const { play } = useAudio();

  useEffect(() => {
    const handleFocusSearch = () => {
      inputRef.current?.focus();
    };

    window.addEventListener("yas-focus-search", handleFocusSearch);

    return () => {
      window.removeEventListener("yas-focus-search", handleFocusSearch);
    };
  }, []);

  const handleSearch = async (value = query, withSound = false) => {
    const trimmedQuery = value.trim();

    if (!trimmedQuery) {
      setResult(null);
      inputRef.current?.focus();
      return;
    }

    if (withSound) {
      play("search");
    }

    setIsProcessing(true);

    window.requestAnimationFrame(() => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      const rect = input.getBoundingClientRect();
      const headerOffset = window.innerWidth < 640 ? 88 : 104;
      const targetTop = Math.max(
        0,
        window.scrollY + rect.top - headerOffset,
      );

      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    });

    const requestId = ++searchRequestRef.current;

    try {
      const intent = understandSearchQuery(trimmedQuery, locale);
      const searchResult = searchProducts(intent.searchQuery);

      if (requestId === searchRequestRef.current) {
        setResult(searchResult);
      }
    } catch (error) {
      console.error("[YAS SEARCH ERROR]", error);

      if (withSound) {
        play("error");
      }

      setResult({
        query: trimmedQuery,
        locale,
        items: [],
        total: 0,
        page: 1,
        pageSize: 12,
        totalPages: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResult(null);
      setIsProcessing(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void handleSearch(trimmedQuery);
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (value.trim().length === 0) {
      setResult(null);
    }
  };

  const handleExample = (example: string) => {
    setQuery(example);
    void handleSearch(example);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <section
      id="yas-search"
      className="scroll-mt-24 border-t border-white/[0.06] px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/[0.16] via-white/[0.05] to-blue-500/[0.12] p-5 shadow-2xl shadow-violet-950/20 sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-bold tracking-[0.14em] text-violet-200">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />
              {t.label}
            </div>

            <h2 className="max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {t.title}
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
              {t.helper}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleSearch(query, true);
                  }
                }}
                type="text"
                placeholder={t.placeholder}
                aria-label={t.title}
                className="h-[84px] w-full rounded-[24px] border border-white/10 bg-[#0d1016] px-6 text-xl font-bold tracking-wide text-white outline-none transition-all duration-300 placeholder:text-base placeholder:font-medium placeholder:text-white/35 focus:border-violet-300/80 focus:bg-[#0b0e14] focus:ring-4 focus:ring-violet-500/25 focus:shadow-[0_0_35px_rgba(139,92,246,0.22)] sm:px-8 sm:text-2xl sm:placeholder:text-lg"
              />

              <div className="min-h-8 px-1">
                {isProcessing && (
                  <div className="flex items-center gap-2 text-sm font-medium text-violet-200">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200/25 border-t-violet-200" aria-hidden="true" />
                    <span>{t.typing}</span>
                  </div>
                )}

                {!isProcessing && result && result.items.length > 0 && (
                  <div
                    className="mt-2 overflow-hidden rounded-[20px] border border-white/10 bg-[#0b0e14]/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
                    role="listbox"
                    aria-label={locale === "fa" ? "نتایج جستجو" : "Search results"}
                  >
                    {result.items.slice(0, 6).map((item) => (
                      <button
                        key={item.productId}
                        type="button"
                        role="option"
                        className="flex w-full items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 text-right transition hover:bg-violet-400/[0.08] last:border-b-0"
                        onClick={() => {
                          play("click");
                          router.push(`/product/${item.productId}`);
                        }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold text-white">
                            {item.name}
                          </span>
                          <span className="mt-1 block text-xs text-white/45">
                            {item.categoryName}
                          </span>
                        </span>

                        {item.price && (
                          <span className="shrink-0 text-sm font-black text-violet-200">
                            {item.price.amount.toLocaleString()} {item.price.currency}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => void handleSearch(query, true)}
                className="h-[76px] w-full rounded-[22px] bg-gradient-to-r from-violet-500 to-blue-500 px-7 text-base font-bold text-white shadow-lg shadow-violet-500/20 transition duration-300 hover:scale-[1.01] hover:shadow-violet-500/30 active:scale-[0.98] sm:text-lg"
              >
                {t.search} ✓
              </button>
              </div>


            {result && (
              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-white/70">
                    {result.total > 0
                      ? `${result.total} ${locale === "fa" ? "نتیجه پیدا شد" : "results found"}`
                      : locale === "fa"
                        ? "نتیجه‌ای پیدا نشد"
                        : "No results found"}
                  </span>
                  {result.total > 0 && (
                    <span className="text-xs text-white/40">
                      {result.query}
                    </span>
                  )}
                </div>

                {result.items.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {result.items.map((item) => (
                      <article
                        key={item.productId}
                        className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-4 transition hover:border-violet-400/30 hover:bg-white/[0.06]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-white">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-white/45">
                              {item.categoryName}
                            </p>
                          </div>

                          {item.price && (
                            <div className="shrink-0 text-left">
                              <div className="text-base font-black text-white">
                                {item.price.amount.toLocaleString()}
                              </div>
                              <div className="text-[11px] uppercase text-white/40">
                                {item.price.currency}
                              </div>
                            </div>
                          )}
                        </div>

                        {item.sku && (
                          <div className="mt-3 text-xs text-white/35">
                            SKU: {item.sku}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-2.5">
              {t.examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExample(example)}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white/65 transition duration-200 hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white active:scale-95"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
