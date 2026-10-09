/** Gradient placeholder until real photos are available. */
export default function PhotoPlaceholder({ hue = 40, label, className = '' }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(circle at 70% 30%, hsla(${hue},80%,65%,0.55), transparent 45%),
          linear-gradient(135deg, hsl(${(hue + 200) % 360},45%,18%), hsl(${hue},55%,28%))`,
      }}
    >
      <div aria-hidden="true" className="absolute right-6 top-5 h-10 w-10 rounded-full bg-night-950 shadow-corona" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night-950/80 to-transparent" />
    </div>
  );
}
