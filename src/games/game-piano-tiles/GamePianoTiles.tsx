import { useCallback, useEffect, useState } from 'react';
import { PianoStage } from './PianoStage';
import { SongSelector } from './SongSelector';
import { PIANO_SONGS } from './songs';
import {
  loadAllRecords,
  loadSavedDifficulty,
  saveDifficulty,
  saveSongResult,
} from './storage';
import type { Difficulty, GameResults, SongDefinition, SongRecord } from './types';

export function GamePianoTiles() {
  const [difficulty, setDifficulty] = useState<Difficulty>(() => loadSavedDifficulty());
  const [records, setRecords] = useState<Record<string, SongRecord>>(() => loadAllRecords());
  const [selectedSong, setSelectedSong] = useState<SongDefinition | null>(null);
  const [customAudioMap, setCustomAudioMap] = useState<Record<string, string>>({});

  // Libère les URLs blobs locales lors du démontage
  useEffect(() => {
    return () => {
      Object.values(customAudioMap).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeDifficulty = useCallback((nextDiff: Difficulty) => {
    setDifficulty(nextDiff);
    saveDifficulty(nextDiff);
  }, []);

  const handleAttachAudio = useCallback((songId: string, file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCustomAudioMap((prev) => {
      if (prev[songId]) {
        URL.revokeObjectURL(prev[songId]);
      }
      return { ...prev, [songId]: objectUrl };
    });
  }, []);

  const handleFinish = useCallback(
    (results: GameResults) => {
      if (!selectedSong) return;
      const updated = saveSongResult(
        selectedSong.id,
        difficulty,
        results.score,
        results.maxCombo,
        results.stars
      );
      setRecords(updated);
    },
    [difficulty, selectedSong]
  );

  const currentSongIndex = selectedSong
    ? PIANO_SONGS.findIndex((s) => s.id === selectedSong.id)
    : -1;
  const hasNextSong = currentSongIndex >= 0 && currentSongIndex < PIANO_SONGS.length - 1;

  const handleNextSong = useCallback(() => {
    if (currentSongIndex >= 0 && currentSongIndex < PIANO_SONGS.length - 1) {
      setSelectedSong(PIANO_SONGS[currentSongIndex + 1]);
    }
  }, [currentSongIndex]);

  if (!selectedSong) {
    return (
      <SongSelector
        difficulty={difficulty}
        onChangeDifficulty={handleChangeDifficulty}
        records={records}
        customAudioMap={customAudioMap}
        onAttachAudio={handleAttachAudio}
        onSelectSong={setSelectedSong}
      />
    );
  }

  return (
    <PianoStage
      key={`${selectedSong.id}-${difficulty}`}
      song={selectedSong}
      difficulty={difficulty}
      customAudioUrl={customAudioMap[selectedSong.id]}
      hasNextSong={hasNextSong}
      onFinish={handleFinish}
      onBackToList={() => setSelectedSong(null)}
      onNextSong={handleNextSong}
    />
  );
}
