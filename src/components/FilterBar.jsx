import { FILTERS } from '../utils/filters'

export default function FilterBar({ selected, onSelect }) {
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          className={`filter-chip ${selected === f.id ? 'active' : ''}`}
          onClick={() => onSelect(f.id)}
          type="button"
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
