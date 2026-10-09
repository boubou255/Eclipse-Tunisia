import { useI18n } from '../i18n/I18nContext.jsx';
import { useSelection } from '../state/useSelection.js';
import Price from './ui/Price.jsx';

/** Live total (announced politely to screen readers). */
export default function PriceSummaryBox({ compact = false }) {
  const { t } = useI18n();
  const { quote, pricing } = useSelection();
  if (!quote) return null;
  return (
    <div className={`rounded-2xl border border-corona-400/40 bg-corona-400/10 ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-xs uppercase tracking-wider text-corona-200">{t('details.livePrice')}</p>
      <div aria-live="polite" aria-atomic="true">
        <Price tnd={quote.totalTND} eurRate={pricing.eurRate} size={compact ? 'md' : 'lg'} />
      </div>
      <p className="mt-1 text-xs text-slate-400">{t('sum.adultsChildren', { a: quote.adults, c: quote.children })}</p>
    </div>
  );
}
