"use client";

import { useAudio } from "../../lib/audio/AudioProvider";

type AudioControlProps = {
  compact?: boolean;
};

export default function AudioControl({
  compact = false,
}: AudioControlProps) {
  const {
    settings,
    setEnabled,
    setVolume,
    play,
  } = useAudio();

  function handleToggle() {
    const nextEnabled = !settings.enabled;
    setEnabled(nextEnabled);

    if (nextEnabled) {
      play("click");
    }
  }

  function handleVolumeChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setVolume(Number(event.target.value));
  }

  return (
    <div
      className={
        compact
          ? "flex items-center gap-2"
          : "w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-4"
      }
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={settings.enabled}
        aria-label={
          settings.enabled
            ? "خاموش کردن صدای YAS"
            : "روشن کردن صدای YAS"
        }
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg transition hover:border-violet-400/30 hover:bg-white/10"
      >
        <span aria-hidden="true">
          {settings.enabled ? "🔊" : "🔇"}
        </span>
      </button>

      {!compact && (
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white/90">
                صدای YAS
              </p>
              <p className="mt-1 text-xs text-white/40">
                {settings.enabled
                  ? "صداهای رابط فعال است"
                  : "صداهای رابط خاموش است"}
              </p>
            </div>

            <span className="text-xs font-semibold text-violet-300">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={handleVolumeChange}
            disabled={!settings.enabled}
            aria-label="میزان صدای YAS"
            className="mt-4 w-full accent-violet-500 disabled:opacity-40"
          />
        </div>
      )}
    </div>
  );
}
