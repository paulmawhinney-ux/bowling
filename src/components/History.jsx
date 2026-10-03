import { useState } from 'react';
import ScoreSheet from './ScoreSheet';
import { computeAverages } from '../lib/storage';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function History({ history, onBack }) {
  const [openId, setOpenId] = useState(null);
  const averages = computeAverages(history);

  const header = (
    <div className="history-header">
      <h1 className="history-title">GAME HISTORY</h1>
      <button type="button" className="back-btn" onClick={onBack}>
        ← Back
      </button>
    </div>
  );

  if (history.length === 0) {
    return (
      <div className="history-screen">
        {header}
        <div className="empty-history">
          <p>No games saved yet.</p>
          <p className="empty-history-sub">Finish a game to see it show up here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-screen">
      {header}

      <section className="averages-section">
        <h2 className="section-label">
          Average (last {history.length} game{history.length > 1 ? 's' : ''})
        </h2>
        <div className="averages-list">
          {averages.map((a) => (
            <div className="average-row" key={a.name}>
              <span className="average-name">{a.name}</span>
              <span className="average-value">{a.average}</span>
              <span className="average-games">{a.gamesPlayed}g</span>
            </div>
          ))}
        </div>
      </section>

      <section className="games-section">
        <h2 className="section-label">Recent games</h2>
        {history.map((game) => {
          const open = openId === game.id;
          return (
            <div className="history-game-card" key={game.id}>
              <button
                type="button"
                className="history-game-summary"
                onClick={() => setOpenId(open ? null : game.id)}
                aria-expanded={open}
              >
                <span className="history-game-date">{formatDate(game.date)}</span>
                <span className="history-game-scores">
                  {game.players.map((p) => `${p.name} ${p.finalScore}`).join(' · ')}
                </span>
                <span className="history-game-chevron">{open ? '▾' : '▸'}</span>
              </button>
              {open && (
                <div className="history-game-detail">
                  {game.players.map((p, i) => (
                    <ScoreSheet key={i} name={p.name} frames={p.frames} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
