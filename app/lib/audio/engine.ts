import type { AudioSettings, SoundEvent } from "./types";
import { playTone } from "./tone";

export type SoundMap = Partial<Record<SoundEvent, string>>;

function clampVolume(volume: number): number {
  return Math.max(0, Math.min(1, volume));
}

function playAudioFile(
  source: string,
  volume: number,
): void {
  const audio = new Audio(source);
  audio.volume = clampVolume(volume);

  void audio.play().catch(() => {
    // Browser autoplay policies may block playback.
  });
}

export function playSound(
  event: SoundEvent,
  settings: AudioSettings,
  sounds: SoundMap = {},
): void {
  if (
    !settings.enabled ||
    typeof window === "undefined"
  ) {
    return;
  }

  const source = sounds[event];

  try {
    if (source) {
      playAudioFile(source, settings.volume);
      return;
    }

    playTone(event, settings.volume);
  } catch {
    // Audio must never break the application UI.
  }
}
