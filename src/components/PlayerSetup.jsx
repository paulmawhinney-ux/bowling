import { useState } from 'react';

const MAX_PLAYERS = 6;
const RACK_ROWS = [4, 3, 2, 1]; // the ten-pin triangle, back row first

export default function PlayerSetup({ onStart, onViewHistory }) {
  const [names, setNames] = useState(['']);

  const cleaned = names.map((n) => n.trim()).filter(Boolean);
  const canStart = cleaned.length > 0;

  const setName = (index, value) =>
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  const addPlayer = () =>
    setNames((prev) => (prev.length < MAX_PLAYERS ? [...prev, ''] : prev));
  const removePlayer = (index) => setNames((prev) => prev.filter((_, i) => i !== index));

  function handleSubmit(event) {
    event.preventDefault();
    if (canStart) onStart(cleaned);
  }

  return (
    <div className="setup-screen">
      <form className="setup-card" onSubmit={handleSubmit}>
        <div className="setup-pin-rack" aria-hidden="true">
          {RACK_ROWS.map((count) => (
            <div className="setup-pin-row" key={count}>
              {Array.from({ length: count }, (_, i) => (
                <span className="setup-pin" key={i} />
              ))}
            </div>
          ))}
        </div>
        <h1 className="setup-title">TEN PIN</h1>
        <p className="setup-subtitle">Rack &apos;em up. Who&apos;s bowling tonight?</p>

        <div className="player-inputs">
          {names.map((name, index) => (
            <div className="player-input-row" key={index}>
              <span className="player-input-number">{index + 1}</span>
              <input
                type="text"
                className="player-input"
                value={name}
                onChange={(e) => setName(index, e.target.value)}
                placeholder={`Player ${index + 1} name`}
                maxLength={20}
                autoComplete="off"
              />
              {names.length > 1 && (
                <button
                  type="button"
                  className="player-remove-btn"
                  onClick={() => removePlayer(index)}
                  aria-label={`Remove player ${index + 1}`}
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        {names.length < MAX_PLAYERS && (
          <button type="button" className="add-player-btn" onClick={addPlayer}>
            + Add another bowler
          </button>
        )}

        <button type="submit" className="start-game-btn" disabled={!canStart}>
          Start Game
        </button>

        <button type="button" className="view-history-link" onClick={onViewHistory}>
          View game history &amp; averages
        </button>
      </form>
    </div>
  );
}
