import { FRAMES } from '../utils/frames'

export default function FrameSelector({ selected, onSelect }) {
  return (
    <div className="frame-selector">
      {FRAMES.map((f) => (
        <button
          key={f.id}
          className={`frame-card ${selected === f.id ? 'active' : ''}`}
          onClick={() => onSelect(f.id)}
          type="button"
        >
          <span className={`frame-preview frame-preview--${f.layout}`}>
            {f.slots.map((s, i) => (
              <span
                key={i}
                className="frame-preview-slot"
                style={{
                  left: `${s.x * 100}%`,
                  top: `${s.y * 100}%`,
                  width: `${s.w * 100}%`,
                  height: `${s.h * 100}%`,
                  transform: `rotate(${s.rot}deg)`,
                }}
              />
            ))}
          </span>
          <span className="frame-card-label">{f.label}</span>
          <span className="frame-card-sub">{f.shots} shot{f.shots > 1 ? 's' : ''}</span>
        </button>
      ))}
    </div>
  )
}
