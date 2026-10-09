/** Accessible +/- number input. */
export default function Counter({ id, label, value, min = 0, max = 99, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" className="btn-ghost h-10 w-10 !p-0" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`${label} −1`}>
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          className="input w-16 text-center"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
          }}
        />
        <button type="button" className="btn-ghost h-10 w-10 !p-0" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`${label} +1`}>
          +
        </button>
      </div>
    </div>
  );
}
