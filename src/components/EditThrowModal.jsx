import { useEffect } from 'react';
import { FRAME_COUNT, pinsStanding, pinLabel } from '../lib/scoring';

// Pick a new value for one recorded roll. Only legal values are offered: the
// count is limited to the pins that were standing at that point in the frame.
export default function EditThrowModal({ rolls, frameIndex, rollIndex, onSave, onCancel }) {
  const standing = pinsStanding(rolls.slice(0, rollIndex), frameIndex);
  const options = Array.from({ length: standing + 1 }, (_, i) => i);
  const current = rolls[rollIndex];
  const isTenth = frameIndex === FRAME_COUNT - 1;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="edit-modal-overlay" onClick={onCancel}>
      <div
        className="edit-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal-title">
          Edit frame {frameIndex + 1}
          {isTenth ? ` · roll ${rollIndex + 1}` : ''}
        </div>
        <div className="edit-modal-current">
          Current: <strong>{current}</strong> {current === 1 ? 'pin' : 'pins'}
        </div>
        <div className="edit-modal-grid">
          {options.map((pins) => (
            <button
              type="button"
              key={pins}
              className={`pin-btn ${pins === standing && pins > 0 ? 'pin-btn--strike' : ''} ${
                pins === current ? 'pin-btn--current' : ''
              }`}
              onClick={() => onSave(pins)}
              aria-label={`${pins} ${pins === 1 ? 'pin' : 'pins'}`}
            >
              {pinLabel(pins, standing)}
            </button>
          ))}
        </div>
        <div className="edit-modal-note">
          If later rolls in this frame no longer fit, they are cleared. If that leaves the frame
          unfinished, later frames are cleared too.
        </div>
        <button type="button" className="edit-modal-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
