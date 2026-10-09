/** Big selectable card (radio semantics). */
export default function ChoiceCard({ selected, onSelect, title, text, icon, children, name, value }) {
  return (
    <label
      className={`card group relative flex cursor-pointer flex-col gap-3 p-6 transition hover:-translate-y-0.5 hover:border-corona-300/60 ${
        selected ? 'border-corona-300 ring-2 ring-corona-300/60' : ''
      }`}
    >
      <input type="radio" name={name} value={value} checked={selected} onChange={onSelect} className="sr-only peer" />
      <span className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:ring-2 peer-focus-visible:ring-corona-300" />
      {icon && (
        <span aria-hidden="true" className="text-4xl">
          {icon}
        </span>
      )}
      <span className="font-display text-xl font-semibold text-white">{title}</span>
      {text && <span className="text-slate-300">{text}</span>}
      {children}
      <span
        aria-hidden="true"
        className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border text-xs ${
          selected ? 'border-corona-300 bg-corona-400 text-night-950' : 'border-white/30'
        }`}
      >
        {selected ? '✓' : ''}
      </span>
    </label>
  );
}
