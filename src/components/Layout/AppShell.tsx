import { useState, type ReactNode } from 'react';
import { Menu, Volume2, VolumeX } from 'lucide-react';
import type { GameDefinition } from '../../types/game';
import { useSound } from '../../context/SoundContext';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  games: GameDefinition[];
  activeGame: GameDefinition;
  onSelectGame: (id: string) => void;
  children: ReactNode;
}

export function AppShell({ games, activeGame, onSelectGame, children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { isMuted, toggleMute, playClick } = useSound();

  return (
    <div className="flex min-h-dvh w-full bg-[#FFF8EE] text-[#2D241E] overflow-x-hidden">
      <Sidebar
        games={games}
        activeGameId={activeGame.id}
        onSelectGame={onSelectGame}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((c) => !c)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre haute compacte uniquement en mode portrait / petits écrans */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-amber-200/70 bg-white/80 px-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => {
              playClick();
              setIsMobileOpen(true);
            }}
            aria-label="Ouvrir le menu des jeux"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-950 hover:bg-amber-200 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {activeGame.icon}
            </span>
            <span className="font-display text-xl font-bold text-amber-950">
              {activeGame.name}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition active:scale-95 focus-visible:outline-2 focus-visible:outline-orange-500 ${
              isMuted
                ? 'bg-stone-100 text-stone-500'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </header>

        {/* Zone principale du jeu */}
        <main className="flex flex-1 flex-col items-center justify-center p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
