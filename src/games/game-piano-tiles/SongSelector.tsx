import { useRef, useState } from 'react';
import { Music, Play, Sparkles, Star, Upload } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { DIFFICULTY_CONFIGS } from './engine';
import { KPOP_SONGS } from './songs';
import { getSongRecord } from './storage';
import type { Difficulty, GroupTheme, SongDefinition, SongRecord } from './types';

interface SongSelectorProps {
  difficulty: Difficulty;
  onChangeDifficulty: (diff: Difficulty) => void;
  records: Record<string, SongRecord>;
  customAudioMap: Record<string, string>;
  onAttachAudio: (songId: string, file: File) => void;
  onSelectSong: (song: SongDefinition) => void;
}

type GroupFilter = 'all' | GroupTheme;

const GROUP_STYLES: Record<GroupTheme, { badge: string; border: string; iconBg: string; playBg: string }> = {
  huntrx: {
    badge: 'bg-amber-400/20 text-amber-200 border border-amber-400/40',
    border: 'border-amber-400/35 hover:border-cyan-300/70',
    iconBg: 'bg-gradient-to-br from-amber-400 via-pink-500 to-cyan-400',
    playBg: 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950',
  },
  saja: {
    badge: 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/40',
    border: 'border-fuchsia-500/35 hover:border-rose-400/70',
    iconBg: 'bg-gradient-to-br from-fuchsia-600 via-rose-500 to-indigo-600',
    playBg: 'bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white',
  },
  pop: {
    badge: 'bg-sky-400/20 text-sky-200 border border-sky-400/40',
    border: 'border-purple-400/35 hover:border-pink-300/70',
    iconBg: 'bg-gradient-to-br from-pink-400 via-purple-500 to-teal-400',
    playBg: 'bg-gradient-to-r from-pink-400 to-purple-500 text-white',
  },
};

export function SongSelector({
  difficulty,
  onChangeDifficulty,
  records,
  customAudioMap,
  onAttachAudio,
  onSelectSong,
}: SongSelectorProps) {
  const { playClick } = useSound();
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUploadSongId = useRef<string | null>(null);

  const filteredSongs =
    groupFilter === 'all'
      ? KPOP_SONGS
      : KPOP_SONGS.filter((song) => song.group === groupFilter);

  const totalStars = KPOP_SONGS.reduce(
    (sum, song) => sum + getSongRecord(records, song.id, difficulty).stars,
    0
  );
  const maxStars = KPOP_SONGS.length * 3;

  const triggerUpload = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    playClick();
    pendingUploadSongId.current = songId;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const songId = pendingUploadSongId.current;
    if (file && songId) {
      onAttachAudio(songId, file);
    }
    e.target.value = '';
  };

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4 rounded-3xl bg-gradient-to-b from-[#13092B] via-[#1C0D3F] to-[#0E0720] p-4 sm:p-6 text-white shadow-2xl border-2 border-fuchsia-500/30">
      {/* Input caché pour import MP3 optionnel */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* En-tête Concert KPop Demon Hunters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-cyan-400 text-3xl shadow-lg shadow-fuchsia-500/30">
            🎹
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Piano Tiles
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-fuchsia-500/25 px-2.5 py-0.5 text-xs font-extrabold text-amber-200 border border-amber-300/40">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                KPop Demon Hunters
              </span>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-purple-200/80">
              Choisis une chanson parmi les 13 titres du film et touche les tuiles en rythme !
            </p>
          </div>
        </div>

        {/* Compteur total d'étoiles */}
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 border border-amber-300/30">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <span className="font-display text-lg font-bold text-amber-200">
            {totalStars} / {maxStars}
          </span>
        </div>
      </div>

      {/* Contrôles : Difficulté + Filtre par groupe */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Sélecteur de difficulté */}
        <div
          role="group"
          aria-label="Difficulté"
          className="flex items-center gap-1.5 rounded-2xl bg-white/8 p-1.5 border border-white/10"
        >
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((diffId) => {
            const cfg = DIFFICULTY_CONFIGS[diffId];
            const active = difficulty === diffId;
            return (
              <button
                key={diffId}
                type="button"
                onClick={() => {
                  playClick();
                  onChangeDifficulty(diffId);
                }}
                className={`flex flex-1 sm:flex-none flex-col items-center rounded-xl px-3.5 py-1.5 min-h-[44px] transition-all focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  active
                    ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 text-slate-950 font-extrabold shadow-md'
                    : 'text-purple-100/80 hover:bg-white/10 font-bold'
                }`}
              >
                <span className="font-display text-sm leading-none">{cfg.label}</span>
                <span className="text-[10px] leading-tight opacity-85">{cfg.subtitle}</span>
              </button>
            );
          })}
        </div>

        {/* Filtres par groupe */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'all', label: `Toutes (${KPOP_SONGS.length})` },
              { id: 'huntrx', label: '✨ HUNTR/X' },
              { id: 'saja', label: '🔥 Saja Boys' },
              { id: 'pop', label: '💖 TWICE & OST' },
            ] as Array<{ id: GroupFilter; label: string }>
          ).map((tab) => {
            const active = groupFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  playClick();
                  setGroupFilter(tab.id);
                }}
                className={`h-10 rounded-xl px-3 text-xs font-extrabold transition focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                  active
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'bg-white/8 text-purple-100/80 hover:bg-white/15'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des 13 chansons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[58dvh] overflow-y-auto pr-1">
        {filteredSongs.map((song) => {
          const style = GROUP_STYLES[song.group];
          const record = getSongRecord(records, song.id, difficulty);
          const hasCustomMp3 = Boolean(customAudioMap[song.id]);

          return (
            <div
              key={song.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                playClick();
                onSelectSong(song);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  playClick();
                  onSelectSong(song);
                }
              }}
              className={`group flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 border-2 transition-all cursor-pointer hover:bg-white/[0.11] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-cyan-400 ${style.border}`}
            >
              {/* Icône thématique */}
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-md transition-transform group-hover:scale-105 ${style.iconBg}`}
              >
                {song.icon}
              </div>

              {/* Infos chanson */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-base font-bold text-white truncate">
                    {song.title}
                  </h3>
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${style.badge}`}>
                    {song.artist}
                  </span>
                  <span className="text-[11px] font-bold text-purple-200/70">
                    {song.bpm} BPM
                  </span>
                </div>

                {/* Étoiles gagnées + meilleur score */}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex items-center gap-0.5" aria-label={`${record.stars} sur 3 étoiles`}>
                    {[1, 2, 3].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${
                          n <= record.stars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  {record.bestScore > 0 && (
                    <span className="text-[11px] font-bold text-cyan-200/90">
                      {record.bestScore} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Boutons droite : MP3 optionnel + Jouer */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105 ${style.playBg}`}
                >
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </span>

                <button
                  type="button"
                  onClick={(e) => triggerUpload(e, song.id)}
                  title="Importer un fichier MP3 local pour cette chanson (optionnel)"
                  className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                    hasCustomMp3
                      ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
                      : 'bg-white/8 text-purple-200/70 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {hasCustomMp3 ? (
                    <>
                      <Music className="h-3 w-3" /> MP3 ✓
                    </>
                  ) : (
                    <>
                      <Upload className="h-3 w-3" /> MP3
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
