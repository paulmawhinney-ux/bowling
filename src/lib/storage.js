// Game history, saved in this browser's localStorage.
// A saved game: { id, date, players: [{ name, frames, finalScore }] }

import { FRAME_COUNT } from './scoring';

// Distinct from the 6-pin app's key: GitHub Pages sites under one username share
// a browser origin, so sharing a key would mix the two apps' histories.
const STORAGE_KEY = 'tenpin-bowling-history-v1';
const MAX_GAMES = 4;

function isValidGame(game) {
  return (
    game &&
    typeof game.id === 'string' &&
    typeof game.date === 'string' &&
    Array.isArray(game.players) &&
    game.players.every(
      (p) =>
        typeof p.name === 'string' &&
        typeof p.finalScore === 'number' &&
        Array.isArray(p.frames) &&
        p.frames.length === FRAME_COUNT
    )
  );
}

export function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isValidGame) : [];
  } catch {
    return [];
  }
}

export function saveGame(game) {
  const updated = [game, ...loadHistory()].slice(0, MAX_GAMES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Storage full or blocked: the game is still shown for this session.
  }
  return updated;
}

// Average per player across the saved games. Names match ignoring case.
export function computeAverages(history) {
  const byName = new Map();
  for (const game of history) {
    for (const player of game.players) {
      const key = player.name.trim().toLowerCase();
      const entry = byName.get(key) ?? { name: player.name, sum: 0, count: 0 };
      entry.sum += player.finalScore;
      entry.count += 1;
      byName.set(key, entry);
    }
  }
  return [...byName.values()]
    .map(({ name, sum, count }) => ({
      name,
      average: Math.round((sum / count) * 10) / 10,
      gamesPlayed: count,
    }))
    .sort((a, b) => b.average - a.average);
}
