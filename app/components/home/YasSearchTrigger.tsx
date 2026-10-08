"use client";

import { YAS_OPEN_SEARCH_EVENT } from "../search/GlobalSearch";

type YasSearchTriggerProps = {
  label: string;
};

export default function YasSearchTrigger({
  label,
}: YasSearchTriggerProps) {
  function handleClick() {
    window.dispatchEvent(new Event(YAS_OPEN_SEARCH_EVENT));
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={handleClick}
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg text-white/80 transition hover:border-violet-400/30 hover:bg-white/10 hover:text-white active:scale-95"
    >
      <span aria-hidden="true">⌕</span>
    </button>
  );
}
