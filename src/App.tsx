import { useState } from 'react';
import { AppShell } from './components/Layout/AppShell';
import { SoundProvider } from './context/SoundContext';
import { GAMES_REGISTRY } from './games/registry';

export function App() {
  const [activeGameId, setActiveGameId] = useState<string>(GAMES_REGISTRY[0].id);

  const activeGame =
    GAMES_REGISTRY.find((game) => game.id === activeGameId) ?? GAMES_REGISTRY[0];
  const ActiveComponent = activeGame.component;

  return (
    <SoundProvider>
      <AppShell
        games={GAMES_REGISTRY}
        activeGame={activeGame}
        onSelectGame={setActiveGameId}
      >
        {ActiveComponent ? <ActiveComponent /> : null}
      </AppShell>
    </SoundProvider>
  );
}

export default App;
