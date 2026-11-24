import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { soundEngine } from '../utils/soundEngine';

const MUTE_STORAGE_KEY = 'jeux-enfant:muted';

interface SoundContextValue {
  isMuted: boolean;
  toggleMute: () => void;
  playClick: () => void;
  playSlide: () => void;
  playMerge: (value: number) => void;
  playWin: () => void;
  playGameOver: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    soundEngine.setMuted(isMuted);
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    } catch {
      // Ignore storage errors (private mode / quota)
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      if (!next) {
        soundEngine.playClick();
      }
      return next;
    });
  }, []);

  const playClick = useCallback(() => soundEngine.playClick(), []);
  const playSlide = useCallback(() => soundEngine.playSlide(), []);
  const playMerge = useCallback((value: number) => soundEngine.playMerge(value), []);
  const playWin = useCallback(() => soundEngine.playWin(), []);
  const playGameOver = useCallback(() => soundEngine.playGameOver(), []);

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        toggleMute,
        playClick,
        playSlide,
        playMerge,
        playWin,
        playGameOver,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return ctx;
}
