import { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import Game from './components/Game';
import History from './components/History';
import { loadHistory, saveGame } from './lib/storage';
import './App.css';

export default function App() {
  const [view, setView] = useState('setup'); // 'setup' | 'game' | 'history'
  const [playerNames, setPlayerNames] = useState([]);
  const [history, setHistory] = useState(loadHistory);

  function startGame(names) {
    setPlayerNames(names);
    setView('game');
  }

  function finishGame(game) {
    setHistory(saveGame(game));
    setView('history');
  }

  return (
    <div className="app-root">
      {view === 'setup' && (
        <PlayerSetup onStart={startGame} onViewHistory={() => setView('history')} />
      )}
      {view === 'game' && (
        <Game
          playerNames={playerNames}
          onFinish={finishGame}
          onCancel={() => setView('setup')}
        />
      )}
      {view === 'history' && <History history={history} onBack={() => setView('setup')} />}
    </div>
  );
}
