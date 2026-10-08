"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AudioSettings, SoundEvent } from "./types";
import { defaultAudioSettings } from "./config";
import { unlockAudio } from "./tone";
import { playSound } from "./engine";

const STORAGE_KEY = "yas-audio-settings";

type AudioContextValue = {
  settings: AudioSettings;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  play: (event: SoundEvent) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<AudioSettings>(defaultAudioSettings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored) as Partial<AudioSettings>;

      setSettings({
        enabled:
          typeof parsed.enabled === "boolean"
            ? parsed.enabled
            : defaultAudioSettings.enabled,
        volume:
          typeof parsed.volume === "number"
            ? Math.max(0, Math.min(1, parsed.volume))
            : defaultAudioSettings.volume,
      });
    } catch {
      setSettings(defaultAudioSettings);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings),
      );
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
  }, [settings]);

  useEffect(() => {
    const unlock = () => {
      void unlockAudio();
    };

    window.addEventListener("pointerdown", unlock, {
      once: true,
      passive: true,
    });

    window.addEventListener("keydown", unlock, {
      once: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setSettings((current) => ({
      ...current,
      enabled,
    }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings((current) => ({
      ...current,
      volume: Math.max(0, Math.min(1, volume)),
    }));
  }, []);

  const play = useCallback(
    (event: SoundEvent) => {
      if (!settings.enabled) return;

      playSound(event, settings);
    },
    [settings.enabled, settings.volume],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      settings,
      setEnabled,
      setVolume,
      play,
    }),
    [settings, setEnabled, setVolume, play],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const context = useContext(AudioContext);

  if (!context) {
    throw new Error(
      "useAudio must be used inside AudioProvider.",
    );
  }

  return context;
}
