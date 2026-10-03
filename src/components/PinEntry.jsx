import { pinLabel } from '../lib/scoring';

// Buttons for 0..standing. The button that clears the rack reads "X" (strike)
// or "/" (spare), matching what will appear on the scoresheet.
export default function PinEntry({ standing, onEnter, onUndo, canUndo }) {
  const options = Array.from({ length: standing + 1 }, (_, i) => i);

  return (
    <div className="pin-entry">
      <div className="pin-entry-label">
        Pins knocked down <span className="pin-entry-max">({standing} standing)</span>
      </div>
      <div className="pin-entry-grid">
        {options.map((pins) => (
          <button
            type="button"
            key={pins}
            className={`pin-btn ${pins === standing && pins > 0 ? 'pin-btn--strike' : ''}`}
            onClick={() => onEnter(pins)}
            aria-label={`${pins} ${pins === 1 ? 'pin' : 'pins'}`}
          >
            {pinLabel(pins, standing)}
          </button>
        ))}
      </div>
      <button type="button" className="undo-btn" onClick={onUndo} disabled={!canUndo}>
        ↩ Undo last throw
      </button>
    </div>
  );
}
