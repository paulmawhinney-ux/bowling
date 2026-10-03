import { FRAME_COUNT, frameCells, isFrameDone, runningTotals, finalScore } from '../lib/scoring';

// One bowler's paper-style scoresheet: 10 frames plus a total box.
// `onRollClick(frameIndex, rollIndex)` makes recorded rolls clickable for editing;
// leave it out for a read-only sheet (e.g. in history).
export default function ScoreSheet({ name, frames, activeFrame = -1, isActive = false, onRollClick }) {
  const totals = runningTotals(frames);
  const hasRolls = frames.some((rolls) => rolls.length > 0);

  return (
    <div className={`scoresheet ${isActive ? 'scoresheet--active' : ''}`}>
      <div className="scoresheet-name">{name}</div>
      <div className="scoresheet-grid">
        {frames.map((rolls, frameIndex) => {
          const classes = [
            'frame-box',
            frameIndex === FRAME_COUNT - 1 && 'frame-box--tenth',
            isActive && frameIndex === activeFrame && 'frame-box--active',
            isFrameDone(rolls, frameIndex) && 'frame-box--complete',
          ];
          return (
            <div key={frameIndex} className={classes.filter(Boolean).join(' ')}>
              <div className="frame-number">{frameIndex + 1}</div>
              <div className="frame-throws">
                {frameCells(rolls, frameIndex).map(({ mark, rollIndex }, cellIndex) => {
                  const editable = onRollClick && rollIndex !== null;
                  return (
                    <div
                      key={cellIndex}
                      className="throw-cell"
                      role={editable ? 'button' : undefined}
                      tabIndex={editable ? 0 : undefined}
                      aria-label={editable ? `Edit frame ${frameIndex + 1} roll ${rollIndex + 1}` : undefined}
                      onClick={editable ? () => onRollClick(frameIndex, rollIndex) : undefined}
                      onKeyDown={
                        editable
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onRollClick(frameIndex, rollIndex);
                              }
                            }
                          : undefined
                      }
                    >
                      {mark}
                    </div>
                  );
                })}
              </div>
              <div className="frame-score">{totals[frameIndex] ?? ''}</div>
            </div>
          );
        })}

        <div className="frame-box frame-box--total">
          <div className="frame-number">Total</div>
          <div className="total-score-value">{hasRolls ? finalScore(frames) : ''}</div>
        </div>
      </div>
    </div>
  );
}
