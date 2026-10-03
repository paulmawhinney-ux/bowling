import { useReducer, useState } from 'react';
import ScoreSheet from './ScoreSheet';
import PinEntry from './PinEntry';
import EditThrowModal from './EditThrowModal';
import { createGame, gameReducer } from '../lib/gameState';
import { currentFrame, isGameOver, pinsStanding, finalScore } from '../lib/scoring';

export default function Game({ playerNames, onFinish, onCancel }) {
  const [game, dispatch] = useReducer(gameReducer, playerNames, createGame);
  const [editing, setEditing] = useState(null); // { playerIdx, frameIdx, rollIdx } | null

  const { players, active, log } = game;
  const allDone = players.every((p) => isGameOver(p.frames));

  const activePlayer = players[active];
  const frameIndex = currentFrame(activePlayer.frames);
  const standing =
    frameIndex >= 0 ? pinsStanding(activePlayer.frames[frameIndex], frameIndex) : 0;

  function saveGame() {
    onFinish({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      players: players.map((p) => ({
        name: p.name,
        frames: p.frames,
        finalScore: finalScore(p.frames),
      })),
    });
  }

  function saveEdit(pins) {
    dispatch({ type: 'edit', ...editing, pins });
    setEditing(null);
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <h1 className="game-title">TEN PIN</h1>
        <button type="button" className="abandon-btn" onClick={onCancel}>
          Cancel game
        </button>
      </div>

      <div className="scoresheets-stack">
        {players.map((player, index) => (
          <ScoreSheet
            key={index}
            name={player.name}
            frames={player.frames}
            activeFrame={index === active ? frameIndex : -1}
            isActive={index === active && !allDone}
            onRollClick={(frameIdx, rollIdx) =>
              setEditing({ playerIdx: index, frameIdx, rollIdx })
            }
          />
        ))}
      </div>

      {!allDone && (
        <>
          <div className="current-turn-banner">
            <span className="current-turn-name">{activePlayer.name}&apos;s turn</span>
            <span className="current-turn-frame">Frame {frameIndex + 1}</span>
            {players.length > 1 && (
              <button
                type="button"
                className="skip-bowler-btn"
                onClick={() => dispatch({ type: 'skip' })}
              >
                Skip ⏭
              </button>
            )}
          </div>
          <PinEntry
            standing={standing}
            onEnter={(pins) => dispatch({ type: 'roll', pins })}
            onUndo={() => dispatch({ type: 'undo' })}
            canUndo={log.length > 0}
          />
        </>
      )}

      {allDone && (
        <div className="game-complete-panel">
          <div className="game-complete-title">Game complete!</div>
          <div className="final-scores-list">
            {players.map((player, index) => (
              <div className="final-score-row" key={index}>
                <span>{player.name}</span>
                <span className="final-score-value">{finalScore(player.frames)}</span>
              </div>
            ))}
          </div>
          <button type="button" className="save-game-btn" onClick={saveGame}>
            Save to history
          </button>
        </div>
      )}

      {editing && (
        <EditThrowModal
          rolls={players[editing.playerIdx].frames[editing.frameIdx]}
          frameIndex={editing.frameIdx}
          rollIndex={editing.rollIdx}
          onSave={saveEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
