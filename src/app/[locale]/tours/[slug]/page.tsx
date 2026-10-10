import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n";
import { getPublishedTour } from "@/lib/tours";
import { formatDate, formatPrice } from "@/lib/format";
import BookingForm from "@/components/BookingForm";
import { paymentSettings, paymentsEnabled } from "@/lib/konnect";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const tour = await getPublishedTour(slug, locale);
  if (!tour) return {};
  return { title: `${tour.title} | Eclipse Tunisia`, description: tour.summary };
}

export default async function TourPage({ params, searchParams }: { params: Params; searchParams: Promise<{ booked?: string }> }) {
  const { locale, slug } = await params;
  const { booked } = await searchParams;
  if (!isLocale(locale)) notFound();
  const tour = await getPublishedTour(slug, locale);
  if (!tour) notFound();
  const t = getDictionary(locale);
  const end = new Date(tour.startDate.getTime() + (tour.durationDays - 1) * 86_400_000);

  return (
    <article className="tour-page">
      <header className="tour-hero" style={tour.imageUrl ? { ["--tour-image" as string]: `url("${tour.imageUrl}")` } : undefined} data-image={tour.imageUrl ? "true" : "false"}>
        <div className="wrap tour-hero-inner">
          <Link href={`/${locale}#tours`} className="back">{t.tour.back}</Link>
          <h1 className="display">{tour.title}</h1>
          <p className="tour-hero-summary">{tour.summary}</p>
          <dl className="tour-facts">
            <div>
              <dt>{t.tours.departure}</dt>
              <dd>{formatDate(tour.startDate, locale)} – {formatDate(end, locale)}</dd>
            </div>
            <div>
              <dt>{t.tours.viewingSite}</dt>
              <dd>{tour.viewingSite}</dd>
            </div>
            <div>
              <dt>{t.tours.totality}</dt>
              <dd>{tour.totality}</dd>
            </div>
            <div>
              <dt>{t.tours.from}</dt>
              <dd>{formatPrice(tour.priceEur, locale)} <small>{t.tours.perPerson}</small></dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="wrap tour-body">
        <div className="tour-content">
          {tour.description.split(/\n\s*\n/).map((p, i) => (
            <p key={i} className={i === 0 ? "lede" : undefined}>{p}</p>
          ))}

          {tour.itinerary.length > 0 && (
            <section>
              <h2 className="display">{t.tour.itinerary}</h2>
              <ol className="itinerary">
                {tour.itinerary.map((d, i) => (
                  <li key={i}>
                    <span className="itinerary-day">{fill(t.tour.day, { n: i + 1 })}</span>
                    <h3>{d.title}</h3>
                    {d.body && <p>{d.body}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {tour.included.length > 0 && (
            <section>
              <h2 className="display">{t.tour.included}</h2>
              <ul className="included">
                {tour.included.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </section>
          )}

          {tour.faqs.length > 0 && (
            <section>
              <h2 className="display">{t.tour.faq}</h2>
              <div className="faq">
                {tour.faqs.map((q) => (
                  <details key={q.id}>
                    <summary>{q.question}</summary>
                    <p>{q.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="tour-book" id="book">
          <h2 className="display">{t.tour.book}</h2>
          <p className={tour.spotsLeft === 0 ? "spots spots-out" : tour.spotsLeft <= 6 ? "spots spots-low" : "spots"}>
            {tour.spotsLeft === 0 ? t.tours.soldOut : fill(t.tours.spotsLeft, { n: tour.spotsLeft })}
          </p>
          {booked ? (
            <div className="form-success" role="status">
              <h3>{t.tour.successTitle}</h3>
              <p>{fill(t.tour.successBody, { email: booked })}</p>
            </div>
          ) : tour.spotsLeft > 0 ? (
            <>
              {!paymentsEnabled() && <p className="muted">{t.tour.bookIntro}</p>}
              <BookingForm
                t={t.tour}
                tp={t.pay}
                locale={locale}
                slug={tour.slug}
                maxTravelers={tour.spotsLeft}
                questions={tour.bookingQuestions}
                payment={paymentsEnabled() ? { ...paymentSettings(), priceEur: tour.priceEur } : null}
              />
            </>
          ) : (
            <p>{t.tour.errorFull}</p>
          )}
        </aside>
      </div>
    </article>
  );
}
