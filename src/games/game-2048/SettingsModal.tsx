import { AnimatePresence, motion } from 'framer-motion';
import { Check, Volume2, VolumeX, X } from 'lucide-react';
import { useSound } from '../../context/SoundContext';
import { THEME_OPTIONS } from './tileTheme';
import type { ThemeId } from './types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (theme: ThemeId) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}: SettingsModalProps) {
  const { isMuted, toggleMute, playClick } = useSound();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fond semi-transparent */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-amber-950/40 backdrop-blur-xs"
          />

          {/* Fenêtre de paramètres */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="relative z-10 w-full max-w-lg rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-2xl border-4 border-amber-200 max-h-[90dvh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-amber-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" aria-hidden="true">
                  ⚙️
                </span>
                <h2 id="settings-title" className="font-display text-2xl font-bold text-amber-950">
                  Paramètres de 2048
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onClose();
                }}
                aria-label="Fermer les paramètres"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sélection du thème */}
            <div className="mt-5">
              <h3 className="font-display text-lg font-bold text-amber-950 mb-3">
                Style des tuiles
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEME_OPTIONS.map((option) => {
                  const isSelected = option.id === currentTheme;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        playClick();
                        onSelectTheme(option.id);
                      }}
                      className={`relative flex flex-col items-start rounded-2xl p-3.5 text-left transition-all active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-orange-500 ${
                        isSelected
                          ? 'bg-amber-100/90 ring-3 ring-orange-400 shadow-sm'
                          : 'bg-white border-2 border-amber-100 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-amber-950">
                          {option.name}
                        </span>
                        {isSelected && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white">
                            <Check className="h-4 w-4 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-semibold text-amber-900/70">
                        {option.description}
                      </p>

                      {/* Aperçu des tuiles */}
                      <div className="mt-3 flex items-center gap-1.5">
                        {option.previewIcons.map((item, idx) => {
                          const previewColors = [
                            'bg-[#FEF3C7] text-[#78350F]',
                            'bg-[#FDBA74] text-[#7C2D12]',
                            'bg-[#F87171] text-white',
                            'bg-[#FACC15] text-[#713F12]',
                          ];
                          return (
                            <span
                              key={idx}
                              className={`flex h-9 w-9 items-center justify-center rounded-xl font-display font-bold shadow-xs ${previewColors[idx]} ${
                                option.id === 'numbers' ? 'text-xs' : 'text-lg'
                              }`}
                            >
                              {item}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Réglage du son */}
            <div className="mt-5 pt-4 border-t border-amber-100 flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-base font-bold text-amber-950">
                  Effets sonores
                </p>
                <p className="text-xs font-semibold text-amber-900/70">
                  Petits sons joyeux lors des fusions
                </p>
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className={`flex h-12 items-center gap-2 rounded-2xl px-4 font-bold transition active:scale-95 focus-visible:outline-2 focus-visible:outline-orange-500 ${
                  isMuted
                    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                }`}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                <span>{isMuted ? 'Coupé' : 'Activé'}</span>
              </button>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className="h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 font-display text-lg font-bold text-white shadow-md shadow-orange-200 hover:brightness-105 active:scale-95 transition focus-visible:outline-2 focus-visible:outline-orange-500"
              >
                C'est parti !
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
