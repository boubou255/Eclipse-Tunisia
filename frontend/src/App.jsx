import { useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext.jsx';
import { BookingProvider, useBooking } from './state/BookingContext.jsx';
import { DataProvider, useData } from './state/DataContext.jsx';
import { useFlow } from './state/useFlow.js';
import { maxReachableIndex } from './state/completion.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import Landing from './components/steps/Landing.jsx';
import StyleStep from './components/steps/StyleStep.jsx';
import PaceStep from './components/steps/PaceStep.jsx';
import SpotStep from './components/steps/SpotStep.jsx';
import ToursStep from './components/steps/ToursStep.jsx';
import DetailsStep from './components/steps/DetailsStep.jsx';
import StartStep from './components/steps/StartStep.jsx';
import TravelersStep from './components/steps/TravelersStep.jsx';
import CheckoutStep from './components/steps/CheckoutStep.jsx';
import ThankYou from './components/steps/ThankYou.jsx';

const STEP_COMPONENTS = {
  style: StyleStep,
  pace: PaceStep,
  spot: SpotStep,
  tours: ToursStep,
  details: DetailsStep,
  start: StartStep,
  travelers: TravelersStep,
  checkout: CheckoutStep,
};

function Flow() {
  const { booking } = useBooking();
  const data = useData();
  const { t } = useI18n();
  const { steps, goTo } = useFlow();

  const ready = data.status === 'ready';
  const maxIdx = ready ? maxReachableIndex(steps, booking, data) : 0;
  const stepIdx = steps.indexOf(booking.step);

  // Guard: a restored/unknown step whose prerequisites are missing → jump to the first incomplete step.
  useEffect(() => {
    if (!ready || booking.step === 'landing' || booking.step === 'thanks') return;
    if (stepIdx === -1 || stepIdx > maxIdx) goTo(steps[stepIdx === -1 ? 0 : maxIdx]);
  }, [ready, booking.step, stepIdx, maxIdx, steps, goTo]);

  if (booking.step === 'landing') return <Landing />;
  if (booking.step === 'thanks') return <ThankYou />;

  if (data.status === 'loading') {
    return <p className="p-10 text-center text-slate-400" role="status">…</p>;
  }
  if (data.status === 'error') {
    return (
      <p className="p-10 text-center text-rose-300" role="alert">
        {t('sum.error')}
      </p>
    );
  }

  const Step = STEP_COMPONENTS[booking.step];
  if (!Step) return null;
  return (
    <>
      <ProgressBar steps={steps} current={booking.step} maxReachable={maxIdx} onJump={goTo} />
      <Step key={booking.step} />
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <DataProvider>
        <BookingProvider>
          <Header />
          <main id="main">
            <Flow />
          </main>
          <Footer />
        </BookingProvider>
      </DataProvider>
    </I18nProvider>
  );
}
