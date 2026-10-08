export type TonePreset =
  | "click"
  | "menu-open"
  | "search"
  | "success"
  | "error"
  | "cart-add"
  | "notification";

type ToneStep = {
  frequency: number;
  duration: number;
  delay?: number;
  type?: OscillatorType;
};

const presets: Record<TonePreset, ToneStep[]> = {
  click: [
    { frequency: 520, duration: 0.045 },
  ],
  "menu-open": [
    { frequency: 420, duration: 0.055 },
    { frequency: 620, duration: 0.07, delay: 0.035 },
  ],
  search: [
    { frequency: 460, duration: 0.05 },
    { frequency: 700, duration: 0.07, delay: 0.035 },
  ],
  success: [
    { frequency: 520, duration: 0.07 },
    { frequency: 660, duration: 0.08, delay: 0.055 },
    { frequency: 820, duration: 0.12, delay: 0.065 },
  ],
  error: [
    { frequency: 260, duration: 0.09 },
    { frequency: 190, duration: 0.13, delay: 0.07 },
  ],
  "cart-add": [
    { frequency: 440, duration: 0.055 },
    { frequency: 660, duration: 0.065, delay: 0.04 },
    { frequency: 880, duration: 0.09, delay: 0.045 },
  ],
  notification: [
    { frequency: 660, duration: 0.07 },
    { frequency: 880, duration: 0.11, delay: 0.075 },
  ],
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (typeof window === "undefined") {
    throw new Error("AudioContext is only available in the browser.");
  }

  audioContext ??= new AudioContext();
  return audioContext;
}

export async function unlockAudio(): Promise<void> {
  if (typeof window === "undefined") return;

  const context = getAudioContext();

  if (context.state === "suspended") {
    await context.resume();
  }
}

export function playTone(
  preset: TonePreset,
  volume: number,
): void {
  if (typeof window === "undefined") return;

  const context = getAudioContext();
  const now = context.currentTime;
  const safeVolume = Math.max(0, Math.min(1, volume));

  for (const step of presets[preset]) {
    const start = now + (step.delay ?? 0);
    const end = start + step.duration;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = step.type ?? "sine";
    oscillator.frequency.setValueAtTime(step.frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, safeVolume * 0.16),
      start + 0.008,
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      end,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(start);
    oscillator.stop(end + 0.01);
  }
}
