"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n";

type Props = {
  t: Dictionary;
  totalityAt: string;
  locale: string;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};

/** Seeded star field so server and client render the same positions. */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  return { x: `${(r(1) * 100).toFixed(2)}%`, y: `${(r(2) * 100).toFixed(2)}%`, s: r(3) < 0.12 ? "2px" : "1px", o: (0.35 + r(4) * 0.65).toFixed(2) };
});

/** Corona streamers: [angle, length, width, opacity]. Longest along the solar equator. */
const STREAMERS: [number, number, number, number][] = [
  [-8, 430, 9, 0.22], [4, 380, 7, 0.18], [172, 440, 9, 0.22], [186, 360, 7, 0.16],
  [-34, 270, 6, 0.14], [30, 300, 6, 0.14], [148, 290, 6, 0.14], [212, 260, 6, 0.12],
  [-62, 220, 5, 0.1], [62, 230, 5, 0.1], [118, 210, 5, 0.1], [242, 220, 5, 0.1],
  [-90, 200, 4, 0.08], [90, 190, 4, 0.08],
];

function useCountdown(target: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(target).getTime();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

export default function EclipseHero({ t, totalityAt, locale }: Props) {
  const section = useRef<HTMLElement>(null);
  const left = useCountdown(totalityAt);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reduce.matches) {
        el.style.setProperty("--p", "1");
        return;
      }
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      const p = travel > 0 ? clamp(-rect.top / travel) : 1;
      // Contact happens at 85% of the scroll; the rest holds totality.
      const contact = smooth(0, 0.85, p);
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--moon", (1 - contact).toFixed(4));
      el.style.setProperty("--dark", smooth(0.55, 0.86, p).toFixed(4));
      el.style.setProperty("--cor", smooth(0.84, 0.92, p).toFixed(4));
      const ring = smooth(0.8, 0.85, p) * (1 - smooth(0.86, 0.9, p));
      el.style.setProperty("--ring", ring.toFixed(4));
      el.dataset.total = p > 0.86 ? "true" : "false";
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduce.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const days = left === null ? null : Math.floor(left / 86_400_000);
  const hours = left === null ? null : Math.floor((left % 86_400_000) / 3_600_000);
  const mins = left === null ? null : Math.floor((left % 3_600_000) / 60_000);
  const nf = new Intl.NumberFormat(locale);

  return (
    <section ref={section} className="hero" data-total="false" aria-labelledby="hero-title">
      <div className="hero-stage">
        <div className="hero-stars" aria-hidden="true">
          {STARS.map((s, i) => (
            <span key={i} style={{ insetInlineStart: s.x, top: s.y, width: s.s, height: s.s, opacity: s.o }} />
          ))}
        </div>

        <svg className="hero-sun" viewBox="-500 -500 1000 1000" aria-hidden="true">
          <defs>
            <radialGradient id="glow" r="0.5">
              <stop offset="0.28" stopColor="#fff8e6" stopOpacity="1" />
              <stop offset="0.34" stopColor="#fff2cc" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff2cc" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="corona" r="0.5">
              <stop offset="0.34" stopColor="#f6f8ff" stopOpacity="0.95" />
              <stop offset="0.4" stopColor="#dfe5ff" stopOpacity="0.5" />
              <stop offset="0.62" stopColor="#c9d1f5" stopOpacity="0.12" />
              <stop offset="1" stopColor="#c9d1f5" stopOpacity="0" />
            </radialGradient>
            <filter id="fibres" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="3" seed="7" />
              <feDisplacementMap in="SourceGraphic" scale="30" />
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>

          <g className="hero-glow">
            <circle r="480" fill="url(#glow)" />
          </g>

          <g className="hero-corona" filter="url(#fibres)">
            <circle r="400" fill="url(#corona)" />
            {STREAMERS.map(([a, len, w, o]) => (
              <ellipse key={a} rx={len} ry={w} fill="#eef1ff" opacity={o} transform={`rotate(${a})`} />
            ))}
          </g>

          <circle className="hero-disc" r="138" />
          <circle className="hero-prominence" r="141" />
          <circle className="hero-moon" r="141" />
          <circle className="hero-ring" r="24" cx="-96" cy="-102" />
        </svg>

        <div className="hero-copy">
          <h1 id="hero-title" className="display">{t.hero.title}</h1>
          <p className="hero-body">{t.hero.body}</p>
          <div className="hero-actions">
            <a className="button" href="#tours">{t.hero.cta}</a>
            <p className="hero-countdown" aria-live="off">
              <span className="hero-countdown-label">{t.hero.countdownLabel}</span>
              {days === null ? (
                <span>&nbsp;</span>
              ) : (
                <span>
                  <b>{nf.format(days)}</b> {t.hero.days} <b>{nf.format(hours!)}</b> {t.hero.hours} <b>{nf.format(mins!)}</b> {t.hero.minutes}
                </span>
              )}
            </p>
          </div>
        </div>

        <dl className="hero-facts">
          <div>
            <dt>{t.facts.date}</dt>
            <dd>{t.facts.dateValue}</dd>
          </div>
          <div>
            <dt>{t.facts.time}</dt>
            <dd>{t.facts.timeValue}</dd>
          </div>
          <div>
            <dt>{t.facts.duration}</dt>
            <dd>{t.facts.durationValue}</dd>
          </div>
          <div>
            <dt>{t.facts.altitude}</dt>
            <dd>{t.facts.altitudeValue}</dd>
          </div>
        </dl>

        <p className="hero-hint" aria-hidden="true">{t.hero.scrollHint}</p>
      </div>
    </section>
  );
}
