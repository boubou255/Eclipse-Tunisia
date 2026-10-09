import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n";
import { listPublishedTours } from "@/lib/tours";
import { formatDate, formatPrice } from "@/lib/format";
import { totalityAt } from "@/lib/site";
import EclipseHero from "@/components/EclipseHero";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const tours = await listPublishedTours(locale);

  return (
    <>
      <EclipseHero t={t} totalityAt={totalityAt.toISOString()} locale={locale} />

      <section id="why" className="why wrap">
        <h2 className="display section-title">{t.why.title}</h2>
        <div className="why-text">
          <p>{t.why.body1}</p>
          <p>{t.why.body2}</p>
          <p className="note">{t.facts.note}</p>
        </div>
        <PathMap />
      </section>

      <section id="tours" className="tours wrap">
        <div className="tours-head">
          <h2 className="display section-title">{t.tours.title}</h2>
          <p>{t.tours.intro}</p>
        </div>
        {tours.length === 0 ? (
          <p className="empty">{t.tours.empty}</p>
        ) : (
          <ol className="tour-list">
            {tours.map((tour) => {
              const end = new Date(tour.startDate.getTime() + (tour.durationDays - 1) * 86_400_000);
              return (
                <li key={tour.id}>
                  <Link href={`/${locale}/tours/${tour.slug}`} className="tour-row">
                    <span className="tour-dates display">
                      {formatDate(tour.startDate, locale, { day: "numeric", month: "short", year: undefined })}
                      <span className="tour-dates-end">– {formatDate(end, locale, { day: "numeric", month: "short", year: undefined })}</span>
                    </span>
                    <span className="tour-main">
                      <span className="tour-title">{tour.title}</span>
                      <span className="tour-summary">{tour.summary}</span>
                    </span>
                    <span className="tour-meta">
                      <span>{tour.durationDays} {t.tours.days}</span>
                      <span>{t.tours.viewingSite}: {tour.viewingSite}</span>
                      <span>{t.tours.totality}: {tour.totality}</span>
                    </span>
                    <span className="tour-price">
                      <span>{t.tours.from} <b>{formatPrice(tour.priceEur, locale)}</b> {t.tours.perPerson}</span>
                      <span className={tour.spotsLeft === 0 ? "spots spots-out" : tour.spotsLeft <= 6 ? "spots spots-low" : "spots"}>
                        {tour.spotsLeft === 0 ? t.tours.soldOut : fill(t.tours.spotsLeft, { n: tour.spotsLeft })}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section id="how" className="how wrap">
        <h2 className="display section-title">{t.how.title}</h2>
        <ol className="steps">
          {t.how.steps.map((s, i) => (
            <li key={i}>
              <span className="step-n display">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

/** Simplified outline of Tunisia with the approximate band of totality. Illustration only. */
function PathMap() {
  return (
    <figure className="pathmap" aria-hidden="true">
      <svg viewBox="0 0 400 720">
        <path className="pathmap-band" d="M-70 58 L458 227 L458 485 L-70 316 Z" />
        <path
          className="pathmap-land"
          d="M127.6 69.8 L167.2 53.7 L226.2 35.4 L255.2 45.1 L264.0 80.5 L290.4 64.4 L329.1 55.8 L334.4 80.5 L303.6 123.5 L290.4 128.8 L281.6 166.4 L293.9 190.0 L310.6 196.5 L330.9 225.5 L336.2 253.4 L321.2 279.1 L304.5 307.0 L246.4 354.3 L246.4 399.4 L277.2 418.7 L335.3 440.2 L345.0 478.8 L374.9 475.6 L365.2 547.5 L316.8 601.2 L264.0 654.9 L237.6 708.6 L140.8 708.6 L88.0 601.2 L70.4 547.5 L26.4 461.6 L20.2 413.3 L44.0 375.8 L83.6 289.9 L88.0 225.5 L88.0 118.1 Z"
        />
        <path className="pathmap-land" d="M347.6 295.2 L353.8 302.8 L338.8 316.7 L330.0 322.1 L330.0 311.3 Z" />
        <path className="pathmap-land" d="M303.6 399.4 L330.0 402.6 L330.0 418.7 L312.4 424.1 L301.0 413.3 Z" />
        <circle className="pathmap-city" cx="304.5" cy="307" r="5" />
        <text x="292" y="312" className="pathmap-label" textAnchor="end">Sfax</text>
        <text x="345" y="284" className="pathmap-label pathmap-small" textAnchor="middle">Kerkennah</text>
        <circle className="pathmap-city pathmap-city-out" cx="253.4" cy="85.9" r="4.5" />
        <text x="242" y="91" className="pathmap-label pathmap-small" textAnchor="end">Tunis 97%</text>
      </svg>
    </figure>
  );
}
