import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';

/**
 * Common wrapper for every step: focusable title (focus moves here on step change
 * for screen-reader / keyboard users), content and a Back / Continue bar.
 */
export default function StepLayout({ title, subtitle, children, onBack, onNext, canNext = true, nextLabel, wide = false, hideNext = false, aside }) {
  const { t } = useI18n();
  const headingRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    headingRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // each step is its own component → runs once per step

  return (
    <section aria-labelledby="step-title">
      <div className={`mx-auto animate-fadeUp px-4 pb-28 pt-6 ${wide ? 'max-w-6xl' : 'max-w-5xl'}`}>
        <h1 id="step-title" ref={headingRef} tabIndex={-1} className="text-3xl font-bold text-white focus:outline-none sm:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-slate-300">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[1050] border-t border-white/10 bg-night-950/90 backdrop-blur">
        <div className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 ${wide ? 'max-w-6xl' : 'max-w-5xl'}`}>
          <button type="button" className="btn-ghost" onClick={onBack}>
            <span aria-hidden="true">←</span> {t('nav.back')}
          </button>
          {aside}
          {!hideNext && (
            <button type="button" className="btn-primary" onClick={onNext} disabled={!canNext}>
              {nextLabel || t('nav.continue')} <span aria-hidden="true">→</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
