import { AnimatePresence, motion } from 'framer-motion';
import { ShieldCheck, Sparkles, X } from 'lucide-react';
import type { GradeLevel } from '../../context/GradeContext';
import { useSound } from '../../context/SoundContext';
import { TELEPORTER_COST, UPGRADE_DEFS, UPGRADE_KEYS } from './constants';
import type { PlayerState, UpgradeKey } from './types';
import { getStats, getUpgradeCost } from './world';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: PlayerState;
  grade: GradeLevel;
  onBuyUpgrade: (key: UpgradeKey) => void;
  onRepairHull: () => void;
  onBuyTeleporter: () => void;
}

export function ShopModal({
  isOpen,
  onClose,
  player,
  grade,
  onBuyUpgrade,
  onRepairHull,
  onBuyTeleporter,
}: ShopModalProps) {
  const { playClick } = useSound();
  const stats = getStats(player.upgrades, grade);
  const hullMissing = Math.max(0, Math.ceil(stats.maxHull - player.hull));
  const repairCost = Math.max(0, Math.round(hullMissing * (grade === '1re' ? 1 : 2)));
  const teleportCost = grade === '1re' ? Math.round(TELEPORTER_COST * 0.6) : TELEPORTER_COST;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="motherload-shop-title"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            className="relative z-10 flex w-full max-w-2xl max-h-[88dvh] flex-col rounded-3xl bg-[#FFFDF9] p-4 sm:p-6 shadow-2xl border-4 border-amber-300 overflow-hidden"
          >
            {/* En-tête */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <span className="text-3xl" aria-hidden="true">
                  🛠️
                </span>
                <div>
                  <h3 id="motherload-shop-title" className="font-display text-2xl font-bold text-amber-950">
                    Atelier de Mars
                  </h3>
                  <p className="text-xs font-bold text-amber-800/75">
                    Améliore ta foreuse pour atteindre le Coffre du Noyau !
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-2xl bg-amber-100 px-3.5 py-1.5 font-display text-lg font-bold text-amber-950 border border-amber-300">
                  💰 {player.money} $
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onClose();
                  }}
                  aria-label="Fermer l'atelier"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-95 transition"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
              {/* 5 améliorations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {UPGRADE_KEYS.map((key) => {
                  const def = UPGRADE_DEFS[key];
                  const level = player.upgrades[key];
                  const cost = getUpgradeCost(key, level, grade);
                  const isMax = cost === null;
                  const canAfford = cost !== null && player.money >= cost;

                  return (
                    <div
                      key={key}
                      className="flex flex-col justify-between gap-2.5 rounded-2xl bg-amber-50/70 p-3.5 border-2 border-amber-200/80"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{def.icon}</span>
                          <div>
                            <p className="font-display text-base font-bold text-amber-950">
                              {def.name}
                            </p>
                            <p className="text-[11px] font-semibold text-amber-900/70">
                              {def.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 5 niveaux visuels */}
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((pip) => (
                          <span
                            key={pip}
                            className={`h-2.5 flex-1 rounded-full ${
                              pip <= level ? 'bg-orange-500' : 'bg-amber-200'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        disabled={isMax || !canAfford}
                        onClick={() => onBuyUpgrade(key)}
                        className={`h-11 w-full rounded-xl font-display text-sm font-bold transition active:scale-95 ${
                          isMax
                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                            : canAfford
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm hover:brightness-105'
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        {isMax ? '✨ Niveau MAX' : `Améliorer · ${cost} $`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Réparation coque & Téléporteur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-sky-50 p-3.5 border-2 border-sky-200">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-7 w-7 text-sky-600 shrink-0" />
                    <div>
                      <p className="font-display text-sm font-bold text-sky-950">
                        Réparer la coque
                      </p>
                      <p className="text-[11px] font-bold text-sky-800/70">
                        {Math.round(player.hull)} / {stats.maxHull} PV
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={hullMissing === 0 || player.money < repairCost}
                    onClick={onRepairHull}
                    className={`h-11 rounded-xl px-4 font-display text-sm font-bold transition active:scale-95 ${
                      hullMissing === 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : player.money >= repairCost
                        ? 'bg-sky-500 text-white hover:bg-sky-600'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {hullMissing === 0 ? 'Intacte ✓' : `${repairCost} $`}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-2xl bg-purple-50 p-3.5 border-2 border-purple-200">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="h-7 w-7 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-display text-sm font-bold text-purple-950">
                        Téléporteur ({player.teleporters})
                      </p>
                      <p className="text-[11px] font-bold text-purple-800/70">
                        Retour instantané en surface
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={player.money < teleportCost}
                    onClick={onBuyTeleporter}
                    className={`h-11 rounded-xl px-4 font-display text-sm font-bold transition active:scale-95 ${
                      player.money >= teleportCost
                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    +1 · {teleportCost} $
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
