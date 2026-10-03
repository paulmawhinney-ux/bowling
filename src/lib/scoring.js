// Standard (traditional) ten-pin bowling scoring.
//
// A game is stored as `frames`: an array of 10 arrays. Each inner array holds the
// pin counts rolled in that frame (raw numbers, never marks like "X" or "/").
// Everything else (frame state, bonuses, running totals, scoresheet marks) is
// derived from that one structure, so there is a single source of truth.
//
// Rules:
//   - 10 frames, 10 pins per rack, up to 2 rolls per frame.
//   - Strike (all 10 on the first roll): scores 10 + the next TWO rolls. Frame ends.
//   - Spare (all 10 over two rolls):     scores 10 + the next ONE roll.
//   - Open frame: scores the pins knocked down.
//   - 10th frame: a strike or spare earns bonus roll(s) (3 rolls max), and the rack
//     is reset whenever all 10 pins are cleared. The 10th frame scores the sum of
//     its own rolls.
//   - Perfect game: 12 strikes = 300.

export const PINS = 10;
export const FRAME_COUNT = 10;
const LAST = FRAME_COUNT - 1;

const sum = (list) => list.reduce((a, b) => a + b, 0);

export function emptyFrames() {
  return Array.from({ length: FRAME_COUNT }, () => []);
}

// Pins standing for the NEXT roll of a frame, given the rolls already made in it.
// In the 10th frame a cleared rack is re-set, so the count goes back to 10.
export function pinsStanding(rolls, frameIndex) {
  let standing = PINS;
  for (const pins of rolls) {
    standing -= pins;
    if (standing === 0 && frameIndex === LAST) standing = PINS;
  }
  return standing;
}

// Has this frame had all the rolls it is entitled to?
export function isFrameDone(rolls, frameIndex) {
  if (frameIndex < LAST) {
    return rolls[0] === PINS || rolls.length >= 2;
  }
  if (rolls.length === 3) return true;
  // After two rolls the 10th is over only if neither a strike nor a spare was made.
  return rolls.length === 2 && rolls[0] + rolls[1] < PINS;
}

// Index of the first unfinished frame, or -1 when the game is over.
export function currentFrame(frames) {
  return frames.findIndex((rolls, i) => !isFrameDone(rolls, i));
}

export function isGameOver(frames) {
  return currentFrame(frames) === -1;
}

export function countRolls(frames) {
  return frames.reduce((n, rolls) => n + rolls.length, 0);
}

// Record a roll. Returns a new frames array; throws if the roll is not legal.
export function addRoll(frames, frameIndex, pins) {
  const rolls = frames[frameIndex];
  if (isFrameDone(rolls, frameIndex)) {
    throw new Error(`Frame ${frameIndex + 1} is already complete`);
  }
  const standing = pinsStanding(rolls, frameIndex);
  if (!Number.isInteger(pins) || pins < 0 || pins > standing) {
    throw new Error(`Invalid roll: ${pins} (only ${standing} pins standing)`);
  }
  return frames.map((r, i) => (i === frameIndex ? [...r, pins] : r));
}

// Remove the most recently recorded roll in this game. Returns a new frames array.
export function removeLastRoll(frames) {
  for (let i = LAST; i >= 0; i--) {
    if (frames[i].length > 0) {
      return frames.map((r, idx) => (idx === i ? r.slice(0, -1) : r));
    }
  }
  return frames;
}

// Change one recorded roll. Later rolls in the same frame are kept if they are
// still legal and dropped from the first illegal one onward. If the edit leaves
// the frame unfinished, every later frame is cleared so the game stays consistent.
export function editRoll(frames, frameIndex, rollIndex, pins) {
  const original = frames[frameIndex];
  if (rollIndex < 0 || rollIndex >= original.length) {
    throw new Error('That roll has not been recorded yet');
  }
  const head = original.slice(0, rollIndex);
  if (!Number.isInteger(pins) || pins < 0 || pins > pinsStanding(head, frameIndex)) {
    throw new Error(`Invalid edit: ${pins}`);
  }

  const rebuilt = [...head, pins];
  for (const later of original.slice(rollIndex + 1)) {
    if (isFrameDone(rebuilt, frameIndex)) break;
    if (later > pinsStanding(rebuilt, frameIndex)) break;
    rebuilt.push(later);
  }

  const next = frames.map((r, i) => (i === frameIndex ? rebuilt : r));
  if (!isFrameDone(rebuilt, frameIndex)) {
    for (let i = frameIndex + 1; i < FRAME_COUNT; i++) next[i] = [];
  }
  return next;
}

// Running (cumulative) score after each frame. A frame is `null` until it can be
// scored, i.e. until it is finished and any strike/spare bonus rolls exist.
export function runningTotals(frames) {
  const flat = frames.flat();
  const totals = Array(FRAME_COUNT).fill(null);
  let start = 0;
  let total = 0;

  for (let i = 0; i < FRAME_COUNT; i++) {
    const rolls = frames[i];
    if (!isFrameDone(rolls, i)) break;

    let points;
    if (i === LAST) {
      points = sum(rolls);
    } else if (rolls[0] === PINS) {
      const bonus = flat.slice(start + 1, start + 3);
      if (bonus.length < 2) break;
      points = PINS + sum(bonus);
    } else if (rolls[0] + rolls[1] === PINS) {
      const bonus = flat[start + 2];
      if (bonus === undefined) break;
      points = PINS + bonus;
    } else {
      points = rolls[0] + rolls[1];
    }

    total += points;
    totals[i] = total;
    start += rolls.length;
  }
  return totals;
}

// Score so far (the last scorable running total).
export function finalScore(frames) {
  const scored = runningTotals(frames).filter((t) => t !== null);
  return scored.length ? scored[scored.length - 1] : 0;
}

// Scoresheet symbol for a roll, given how many pins were standing before it.
export function rollMark(pins, standingBefore) {
  if (pins === standingBefore) return standingBefore === PINS ? 'X' : '/';
  return pins === 0 ? '-' : String(pins);
}

// Label for an entry button: "X" for a strike, "/" for a spare, else the number.
export function pinLabel(pins, standing) {
  if (pins === standing && pins > 0) return standing === PINS ? 'X' : '/';
  return String(pins);
}

// The small boxes of a frame on a paper scoresheet: 2 per frame, 3 for the 10th.
// Each cell says which recorded roll (if any) it shows, so clicks can edit it.
// In frames 1-9 a strike is drawn in the second box, as on a real sheet.
export function frameCells(rolls, frameIndex) {
  const size = frameIndex === LAST ? 3 : 2;
  const cells = Array.from({ length: size }, () => ({ mark: '', rollIndex: null }));

  if (frameIndex < LAST && rolls[0] === PINS) {
    cells[1] = { mark: 'X', rollIndex: 0 };
    return cells;
  }
  rolls.forEach((pins, i) => {
    const before = pinsStanding(rolls.slice(0, i), frameIndex);
    cells[i] = { mark: rollMark(pins, before), rollIndex: i };
  });
  return cells;
}
