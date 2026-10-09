import { useI18n } from '../../i18n/I18nContext.jsx';

const STYLES = {
  calm: 'border-sky-300/40 bg-sky-300/10 text-sky-200',
  slow: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
  medium: 'border-corona-300/40 bg-corona-300/10 text-corona-200',
  fast: 'border-rose-300/40 bg-rose-300/10 text-rose-200',
};
const ICONS = { calm: '🏖️', slow: '🐢', medium: '🚙', fast: '⚡' };

export default function PaceBadge({ pace }) {
  const { t } = useI18n();
  const key = pace || 'calm';
  const label = pace ? t(`pace.${pace}.title`) : t('pace.calm');
  return (
    <span className={`chip ${STYLES[key]}`}>
      <span aria-hidden="true">{ICONS[key]}</span> {label}
    </span>
  );
}
