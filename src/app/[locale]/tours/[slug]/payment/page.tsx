import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { fill, getDictionary } from "@/i18n";
import { db } from "@/lib/db";
import { pick } from "@/lib/tours";
import { formatPrice } from "@/lib/format";
import { syncPayment } from "@/lib/konnect";
import { retryPayment } from "../actions";
import AutoRefresh from "@/components/AutoRefresh";

export const dynamic = "force-dynamic";

type Search = Promise<{ booking?: string; payment_ref?: string; error?: string }>;

export default async function PaymentResult({ params, searchParams }: { params: Promise<{ locale: string; slug: string }>; searchParams: Search }) {
  const { locale, slug } = await params;
  const { booking: bookingId, payment_ref: ref, error } = await searchParams;
  if (!isLocale(locale) || !bookingId) notFound();
  const t = getDictionary(locale);

  const before = await db.booking.findUnique({ where: { id: bookingId }, include: { payments: { orderBy: { createdAt: "desc" } } } });
  if (!before) notFound();

  // Konnect adds ?payment_ref= to the return URL. Check it (or the latest checkout) against the API.
  const toCheck = before.payments.find((p) => p.ref === ref) ?? before.payments.find((p) => p.status === "pending");
  if (toCheck) {
    try {
      await syncPayment(toCheck.ref);
    } catch (e) {
      console.error(e);
    }
  }

  const booking = await db.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { payments: { orderBy: { createdAt: "desc" } }, tour: { include: { translations: true } } },
  });
  const latest = booking.payments[0];
  const expired = latest && latest.status === "pending" && Date.now() - latest.createdAt.getTime() > 30 * 60_000;
  const state = error ? "error" : !latest ? "failed" : latest.status === "completed" ? "paid" : latest.status === "failed" || expired ? "failed" : "pending";
  const title = pick(booking.tour.translations, locale)?.title ?? slug;

  return (
    <section className="wrap payment-page">
      <Link href={`/${locale}/tours/${slug}`} className="back">{t.pay.back}</Link>
      <p className="muted">{title}</p>

      {state === "paid" && (
        <div className="pay-result pay-ok" role="status">
          <h1 className="display">{t.pay.paidTitle}</h1>
          <p>{fill(t.pay.paidBody, { amount: formatPrice(booking.paidEur, locale), email: booking.email })}</p>
          {booking.paidEur < booking.totalEur && (
            <p className="muted">
              {fill(t.pay.paidSoFar, { amount: formatPrice(booking.paidEur, locale) })} / {formatPrice(booking.totalEur, locale)}
            </p>
          )}
        </div>
      )}

      {state === "pending" && (
        <div className="pay-result" role="status">
          <h1 className="display">{t.pay.pendingTitle}</h1>
          <p>{t.pay.pendingBody}</p>
          <AutoRefresh seconds={8} />
        </div>
      )}

      {(state === "failed" || state === "error") && (
        <div className="pay-result pay-failed" role="alert">
          <h1 className="display">{state === "error" ? t.pay.title : t.pay.failedTitle}</h1>
          <p>{error === "full" ? t.tour.errorFull : error ? t.pay.unavailable : t.pay.failedBody}</p>
          {error !== "full" && booking.status !== "cancelled" && booking.paidEur < booking.totalEur && (
            <form action={retryPayment}>
              <input type="hidden" name="booking" value={booking.id} />
              <button className="button">{t.pay.retry}</button>
            </form>
          )}
        </div>
      )}
    </section>
  );
}
