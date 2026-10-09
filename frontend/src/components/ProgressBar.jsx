import { useI18n } from '../i18n/I18nContext.jsx';

export default function ProgressBar({ steps, current, onJump, maxReachable }) {
  const { t } = useI18n();
  const index = steps.indexOf(current);
  const pct = ((index + 1) / steps.length) * 100;

  return (
    <nav aria-label={t('steps.progress', { current: index + 1, total: steps.length })} className="mx-auto max-w-6xl px-4 pt-5">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{t('steps.progress', { current: index + 1, total: steps.length })}</span>
        <span className="font-semibold text-corona-300">{t(`steps.${current}`)}</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={index + 1}
        aria-valuetext={t(`steps.${current}`)}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-corona-500 to-corona-200 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-3 hidden gap-1 md:flex">
        {steps.map((s, i) => {
          const done = i < index;
          const active = i === index;
          const reachable = i <= maxReachable;
          return (
            <li key={s} className="flex-1">
              <button
                type="button"
                disabled={!reachable || active}
                onClick={() => onJump(s)}
                aria-current={active ? 'step' : undefined}
                className={`w-full truncate rounded-md px-1 py-1 text-xs transition ${
                  active ? 'font-semibold text-corona-300' : done ? 'text-slate-200 hover:text-white' : 'text-slate-500'
                }`}
              >
                {i + 1}. {t(`steps.${s}`)}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
