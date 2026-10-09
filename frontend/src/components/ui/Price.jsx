import { useI18n } from '../../i18n/I18nContext.jsx';
import { formatMoney } from '../../lib/format.js';

/** Shows TND + EUR. */
export default function Price({ tnd, eurRate, size = 'md' }) {
  const { lang } = useI18n();
  const big = size === 'lg';
  return (
    <span className="inline-flex flex-col leading-tight">
      <span className={`font-display font-bold text-corona-300 ${big ? 'text-3xl' : 'text-xl'}`}>{formatMoney(tnd, 'TND', lang)}</span>
      <span className="text-sm text-slate-400">≈ {formatMoney(tnd / eurRate, 'EUR', lang)}</span>
    </span>
  );
}
