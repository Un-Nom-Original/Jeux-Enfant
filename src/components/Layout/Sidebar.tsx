import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { GAME_CATEGORIES, type GameCategory, type GameDefinition } from '../../types/game';
import { useSound } from '../../context/SoundContext';
import { useGrade } from '../../context/GradeContext';
import { useFullscreen } from '../../hooks/useFullscreen';
import { GradeBadgeToggle } from '../shared/GradeBadgeToggle';

interface SidebarProps {
  games: GameDefinition[];
  activeGameId: string;
  onSelectGame: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  games,
  activeGameId,
  onSelectGame,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { isMuted, toggleMute, playClick } = useSound();
  const { grade, toggleGrade } = useGrade();
  const { isFullscreen, isSupported: isFullscreenSupported, toggleFullscreen } = useFullscreen();
  const [closedCategories, setClosedCategories] = useState<Partial<Record<GameCategory, boolean>>>({});

  const toggleCategory = (catId: GameCategory) => {
    playClick();
    setClosedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleSelect = (game: GameDefinition) => {
    if (game.status !== 'ready') return;
    playClick();
    onSelectGame(game.id);
    onCloseMobile();
  };

  const renderContent = (compact: boolean, showCloseButton: boolean) => (
    <div className="flex h-full flex-col bg-white/95 backdrop-blur-md border-r-2 border-amber-100/90 shadow-sm">
      {/* En-tête du portail */}
      <div
        className={`flex items-center ${
          compact ? 'justify-center px-2' : 'justify-between px-4'
        } h-18 shrink-0 border-b border-amber-100`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl shadow-md shadow-orange-200">
            🎮
          </div>
          {!compact && (
            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold leading-tight text-amber-950 truncate">
                Jeux Enfant
              </h1>
              <p className="text-xs font-bold text-amber-700/80 truncate">
                {games.length} jeux disponibles
              </p>
            </div>
          )}
        </div>

        {showCloseButton && (
          <button
            type="button"
            onClick={() => {
              playClick();
              onCloseMobile();
            }}
            aria-label="Fermer le menu"
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Sélecteur global 1re année / 3e année */}
      <div className={`shrink-0 border-b border-amber-100 ${compact ? 'p-2 flex justify-center' : 'px-3 py-2.5'}`}>
        {compact ? (
          <button
            type="button"
            onClick={() => {
              playClick();
              toggleGrade();
            }}
            title={`Niveau : ${grade} année (cliquer pour changer)`}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-xl hover:bg-amber-200 active:scale-95 transition"
          >
            {grade === '1re' ? '🐣' : '🦁'}
          </button>
        ) : (
          <GradeBadgeToggle compact />
        )}
      </div>

      {/* Liste des jeux regroupés par catégories repliables (scroll indépendant) */}
      <nav aria-label="Liste des jeux par catégorie" className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {GAME_CATEGORIES.map((category) => {
          const categoryGames = games.filter((g) => g.category === category.id);
          if (categoryGames.length === 0) return null;
          const isCatClosed = !compact && Boolean(closedCategories[category.id]);

          return (
            <div key={category.id} className="space-y-1.5">
              {!compact ? (
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider hover:bg-amber-50 transition ${category.accentClass}`}
                >
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden="true">{category.icon}</span>
                    <span>{category.label}</span>
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] text-amber-900">
                      {categoryGames.length}
                    </span>
                  </span>
                  {isCatClosed ? (
                    <ChevronRight className="h-3.5 w-3.5 opacity-70" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                  )}
                </button>
              ) : (
                <div className="my-1 border-t border-amber-100/80 first:hidden" />
              )}

              {!isCatClosed &&
                categoryGames.map((game) => {
                const isActive = game.id === activeGameId;
                const isReady = game.status === 'ready';

                return (
                  <button
                    key={game.id}
                    type="button"
                    disabled={!isReady}
                    onClick={() => handleSelect(game)}
                    title={compact ? `${game.name} (${category.label})` : undefined}
                    className={`group relative flex w-full items-center ${
                      compact ? 'justify-center p-1.5' : 'gap-3 px-3 py-2.5'
                    } rounded-2xl text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-orange-500 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-100 to-orange-100/90 text-amber-950 shadow-sm ring-2 ring-orange-400/70'
                        : isReady
                        ? 'bg-amber-50/40 text-amber-900 hover:bg-amber-100/70 active:scale-[0.98]'
                        : 'bg-stone-100/70 text-stone-400 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl shadow-xs transition-transform ${
                        isReady ? `${game.accentBg} group-hover:scale-105` : 'bg-stone-200 grayscale'
                      }`}
                    >
                      {game.icon}
                    </span>

                    {!compact && (
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-bold truncate">
                            {game.name}
                          </span>
                          {isActive && (
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                          )}
                        </div>
                        <p className="text-[11px] font-semibold opacity-75 truncate">
                          {isReady ? game.shortDescription : 'Bientôt disponible'}
                        </p>
                      </div>
                    )}

                    {!compact && !isReady && (
                      <Lock className="h-4 w-4 shrink-0 text-stone-400" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Pied de menu : Son + Plein écran + Replier (desktop/paysage) */}
      <div
        className={`shrink-0 border-t border-amber-100 p-3 flex ${
          compact ? 'flex-col items-center gap-2' : 'items-center justify-between gap-2'
        }`}
      >
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          title={isMuted ? 'Activer le son' : 'Couper le son'}
          className={`flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-orange-500 ${
            compact ? 'h-11 w-11' : 'h-11 flex-1 px-3'
          } ${
            isMuted
              ? 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200/80'
          }`}
        >
          {isMuted ? <VolumeX className="h-5 w-5 shrink-0" /> : <Volume2 className="h-5 w-5 shrink-0" />}
          {!compact && <span className="text-xs font-extrabold">{isMuted ? 'Son coupé' : 'Son activé'}</span>}
        </button>

        {isFullscreenSupported && (
          <button
            type="button"
            onClick={() => {
              playClick();
              toggleFullscreen();
            }}
            aria-label={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
            title={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        )}

        {!showCloseButton && (
          <button
            type="button"
            onClick={() => {
              playClick();
              onToggleCollapse();
            }}
            aria-label={compact ? 'Déplier le menu' : 'Replier le menu'}
            title={compact ? 'Déplier le menu' : 'Replier le menu'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-900 hover:bg-amber-100 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
          >
            {compact ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Barre latérale fixe en paysage / grand écran (lg:) */}
      <aside
        className={`hidden lg:block lg:sticky lg:top-0 lg:h-screen shrink-0 transition-[width] duration-200 ease-out ${
          isCollapsed ? 'w-20' : 'w-68'
        }`}
      >
        {renderContent(isCollapsed, false)}
      </aside>

      {/* Tiroir coulissant en mode portrait / tablette verticale */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={onCloseMobile}
              className="absolute inset-0 bg-amber-950/35 backdrop-blur-xs"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="relative h-full w-72 max-w-[85vw]"
            >
              {renderContent(false, true)}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
