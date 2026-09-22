import { BACKGROUNDS } from '../utils/backgrounds'

export default function BackgroundSelector({ selected, onSelect }) {
  return (
    <div className="bg-selector">
      {BACKGROUNDS.map((b) => (
        <button
          key={b.id}
          type="button"
          className={`bg-swatch ${selected === b.id ? 'active' : ''}`}
          style={{ background: b.swatch }}
          onClick={() => onSelect(b.id)}
          aria-label={b.label}
          title={b.label}
        />
      ))}
    </div>
  )
}
