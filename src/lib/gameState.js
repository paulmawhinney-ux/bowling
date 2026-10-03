// Pure game-state logic for a live game, kept out of the components so it can be
// reasoned about (and tested) on its own.
//
// state = { players: [{ name, frames }], active: number, log: number[] }
//   active - index of the player whose turn it is
//   log    - the player index for every roll, in order (powers "undo")

import {
  emptyFrames,
  addRoll,
  removeLastRoll,
  editRoll,
  currentFrame,
  isFrameDone,
  isGameOver,
  countRolls,
} from './scoring';

export function createGame(names) {
  return {
    players: names.map((name) => ({ name, frames: emptyFrames() })),
    active: 0,
    log: [],
  };
}

// Next player (after `from`, wrapping) who still has frames to bowl.
function nextPlayer(players, from) {
  const n = players.length;
  for (let step = 1; step <= n; step++) {
    const candidate = (from + step) % n;
    if (!isGameOver(players[candidate].frames)) return candidate;
  }
  return from;
}

function withFrames(players, index, frames) {
  return players.map((p, i) => (i === index ? { ...p, frames } : p));
}

function removeLastOccurrence(list, value) {
  const at = list.lastIndexOf(value);
  return at === -1 ? list : [...list.slice(0, at), ...list.slice(at + 1)];
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'roll': {
      const { players, active } = state;
      const frameIndex = currentFrame(players[active].frames);
      if (frameIndex < 0) return state;

      let frames;
      try {
        frames = addRoll(players[active].frames, frameIndex, action.pins);
      } catch {
        return state; // illegal roll: ignore
      }
      const nextPlayers = withFrames(players, active, frames);
      const turnOver = isFrameDone(frames[frameIndex], frameIndex);
      return {
        players: nextPlayers,
        active: turnOver ? nextPlayer(nextPlayers, active) : active,
        log: [...state.log, active],
      };
    }

    case 'undo': {
      if (state.log.length === 0) return state;
      const who = state.log[state.log.length - 1];
      const frames = removeLastRoll(state.players[who].frames);
      return {
        players: withFrames(state.players, who, frames),
        active: who,
        log: state.log.slice(0, -1),
      };
    }

    case 'skip':
      return { ...state, active: nextPlayer(state.players, state.active) };

    case 'edit': {
      const { playerIdx, frameIdx, rollIdx, pins } = action;
      const before = state.players[playerIdx].frames;
      let frames;
      try {
        frames = editRoll(before, frameIdx, rollIdx, pins);
      } catch {
        return state;
      }
      const players = withFrames(state.players, playerIdx, frames);

      // An edit can only remove rolls; keep the undo log in step with that.
      let log = state.log;
      for (let dropped = countRolls(before) - countRolls(frames); dropped > 0; dropped--) {
        log = removeLastOccurrence(log, playerIdx);
      }
      // If the edit re-opened a game while the turn sits on a finished player, move on.
      const active = isGameOver(players[state.active].frames)
        ? nextPlayer(players, state.active)
        : state.active;
      return { players, active, log };
    }

    default:
      return state;
  }
}
