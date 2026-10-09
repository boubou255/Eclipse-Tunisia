import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import StepLayout from '../StepLayout.jsx';
import ChoiceCard from '../ui/ChoiceCard.jsx';

export const PACE_ICONS = { slow: '🐢', medium: '🚙', fast: '⚡' };

export default function PaceStep() {
  const { t } = useI18n();
  const { booking, dispatch } = useBooking();
  const { goNext, goBack } = useFlow();

  return (
    <StepLayout title={t('pace.title')} subtitle={t('pace.subtitle')} onBack={goBack} onNext={goNext} canNext={!!booking.pace}>
      <fieldset>
        <legend className="sr-only">{t('pace.title')}</legend>
        <div className="grid gap-5 md:grid-cols-3">
          {['slow', 'medium', 'fast'].map((p) => (
            <ChoiceCard
              key={p}
              name="pace"
              value={p}
              icon={PACE_ICONS[p]}
              selected={booking.pace === p}
              onSelect={() => dispatch({ type: 'setPace', pace: p })}
              title={t(`pace.${p}.title`)}
              text={t(`pace.${p}.text`)}
            />
          ))}
        </div>
      </fieldset>
    </StepLayout>
  );
}
