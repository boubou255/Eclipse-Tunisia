import { useI18n } from '../../i18n/I18nContext.jsx';
import { useBooking } from '../../state/BookingContext.jsx';
import { useFlow } from '../../state/useFlow.js';
import StepLayout from '../StepLayout.jsx';
import ChoiceCard from '../ui/ChoiceCard.jsx';

export default function StyleStep() {
  const { t } = useI18n();
  const { booking, dispatch } = useBooking();
  const { goNext, goBack } = useFlow();

  const options = [
    { id: 'calm', icon: '🏖️' },
    { id: 'explore', icon: '🧭' },
  ];

  return (
    <StepLayout title={t('style.title')} subtitle={t('style.subtitle')} onBack={goBack} onNext={goNext} canNext={!!booking.style}>
      <fieldset>
        <legend className="sr-only">{t('style.title')}</legend>
        <div className="grid gap-5 md:grid-cols-2">
          {options.map((o) => (
            <ChoiceCard
              key={o.id}
              name="style"
              value={o.id}
              icon={o.icon}
              selected={booking.style === o.id}
              onSelect={() => dispatch({ type: 'setStyle', style: o.id })}
              title={t(`style.${o.id}.title`)}
              text={t(`style.${o.id}.text`)}
            />
          ))}
        </div>
      </fieldset>
    </StepLayout>
  );
}
