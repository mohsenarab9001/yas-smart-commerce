"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CartBadge from "../cart/CartBadge";
import YasSearchTrigger from "../home/YasSearchTrigger";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAudio } from "../../lib/audio/AudioProvider";
import { messages } from "../../lib/i18n/messages";

type StoreHeaderProps = {
  locale?: "fa" | "en";
};

const navItems: { href: string; key: "home" | "shop" | "categories" | "offers" }[] = [
  { href: "/", key: "home" },
  { href: "/shop", key: "shop" },
  { href: "/categories", key: "categories" },
  { href: "/offers", key: "offers" },
];

export default function StoreHeader({
  locale = "fa",
}: StoreHeaderProps) {
  const { settings, setEnabled, setVolume, play } = useAudio();
  const [soundOpen, setSoundOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const soundRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isRtl = locale === "fa";
  const t = messages[locale];

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        soundRef.current &&
        !soundRef.current.contains(target)
      ) {
        setSoundOpen(false);
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSoundOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  function toggleMenu() {
    setSoundOpen(false);
    setMenuOpen((current) => !current);
    play("menu-open");
  }

  function toggleSound() {
    const enabled = !settings.enabled;
    setEnabled(enabled);

    if (enabled) {
      play("click");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#181b22]/90 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div
            ref={menuRef}
            className="relative md:hidden"
          >
            <button
              type="button"
              aria-label={t.menu}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl text-white active:scale-95"
            >
              <span aria-hidden="true">
                {menuOpen ? "Ã—" : "â˜°"}
              </span>
            </button>

            {menuOpen && (
              <div
                className="absolute top-14 z-[60] w-72 max-w-[85vw] rounded-3xl border border-white/10 bg-[#181b22] p-2 shadow-2xl"
                style={isRtl ? { right: 0 } : { left: 0 }}
              >
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-sm font-bold text-white/75 hover:bg-white/[0.07] hover:text-white"
                  >
                    {t[item.key]}
                  </Link>
                ))}
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-bold text-white/75 hover:bg-white/[0.07] hover:text-white"
                >
                  {t.accountShort}
                </Link>

                <Link
                  href="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-2xl px-4 py-3 text-sm font-bold text-white/75 hover:bg-white/[0.07] hover:text-white"
                >
                  {t.cart}
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/"
            aria-label="YAS"
            onClick={() => setMenuOpen(false)}
            className="shrink-0 text-xl font-black tracking-[0.2em] text-white"
          >
            YAS
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white"
              >
                {t[item.key]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <YasSearchTrigger
            label={t.search}
          />
          <LanguageSwitcher locale={locale === "en" ? "en" : "fa"} />

          <div
            className="relative hidden sm:block"
            ref={soundRef}
          >
            <button
              type="button"
              aria-label={t.soundSettings}
              aria-expanded={soundOpen}
              onClick={() => {
                setMenuOpen(false);
                setSoundOpen((current) => !current);
              }}



              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg text-white/80 transition hover:border-violet-400/30 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <span aria-hidden="true">
                {settings.enabled ? "ðŸ”Š" : "ðŸ”‡"}
              </span>
            </button>

            {soundOpen && (
              <div
                className="absolute top-14 z-[60] w-64 rounded-3xl border border-white/10 bg-[#181b22] p-4 shadow-2xl"
                style={isRtl ? { right: 0 } : { left: 0 }}
              >
                <div className="flex items-center justify-between gap-3">
                    {t.siteSound}

                  <button
                    type="button"
                    aria-pressed={settings.enabled}
                    onClick={toggleSound}
                    className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/80 transition hover:bg-white/10 hover:text-white"
                  >
                    {settings.enabled
                      ? t.on
                      : t.off}
                  </button>
                </div>

                <label className="mt-4 block">
                  <span className="mb-2 block text-xs font-medium text-white/50">
                    {t.volume}{" "}
                    {Math.round(settings.volume * 100)}%
                  </span>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.volume}
                    onChange={(event) =>
                      setVolume(Number(event.target.value))
                    }
                    disabled={!settings.enabled}
                    className="w-full accent-violet-500 disabled:opacity-40"
                  />
                </label>
              </div>
            )}
          </div>
          <Link
            href="/account"
            aria-label={t.account}
            className="hidden h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white/80 transition hover:bg-white/10 hover:text-white sm:flex"
          >
            {t.accountShort}
          </Link>

          <Link
            href="/cart"
            aria-label={t.cart}
            className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg text-white/80 transition hover:border-violet-400/30 hover:bg-white/10 hover:text-white active:scale-95"
          >
            <span aria-hidden="true">ðŸ›’</span>
            <CartBadge />
          </Link>
          <button
            type="button"
            aria-label={t.toggleSound}
            aria-pressed={settings.enabled}
            onClick={toggleSound}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95 sm:hidden"
          >
            <span aria-hidden="true">
              {settings.enabled ? "ðŸ”Š" : "ðŸ”‡"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}























