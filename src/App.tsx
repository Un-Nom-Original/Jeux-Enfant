import { Suspense, useState } from 'react';
import { AppShell } from './components/Layout/AppShell';
import { GradeProvider } from './context/GradeContext';
import { SoundProvider } from './context/SoundContext';
import { GAMES_REGISTRY } from './games/registry';

export function App() {
  const [activeGameId, setActiveGameId] = useState<string>(GAMES_REGISTRY[0].id);

  const activeGame =
    GAMES_REGISTRY.find((game) => game.id === activeGameId) ?? GAMES_REGISTRY[0];
  const ActiveComponent = activeGame.component;

  return (
    <SoundProvider>
      <GradeProvider>
        <AppShell
          games={GAMES_REGISTRY}
          activeGame={activeGame}
          onSelectGame={setActiveGameId}
        >
          <Suspense
            fallback={
              <div className="flex flex-col items-center gap-3 py-12 text-amber-900/70">
                <span className="text-4xl animate-bounce">🎮</span>
                <p className="font-display text-lg font-bold">Chargement du jeu...</p>
              </div>
            }
          >
            {ActiveComponent ? <ActiveComponent /> : null}
          </Suspense>
        </AppShell>
      </GradeProvider>
    </SoundProvider>
  );
}

export default App;
