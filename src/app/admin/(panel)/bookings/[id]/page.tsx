import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pick } from "@/lib/tours";
import { dateTime, euros, shortDate, statusLabels } from "@/lib/admin-format";
import { localeNames, isLocale } from "@/i18n/config";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteBooking, refreshPayments, setStatus } from "../actions";
import BalanceLink from "@/components/admin/BalanceLink";
import { paymentsEnabled } from "@/lib/konnect";

export const dynamic = "force-dynamic";

const planLabels: Record<string, string> = { none: "Request only", deposit: "Deposit online", full: "Full payment online" };
const kindLabels: Record<string, string> = { deposit: "Deposit", full: "Full payment", balance: "Balance" };

export default async function BookingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await db.booking.findUnique({
    where: { id },
    include: { tour: { include: { translations: true } }, payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!b) notFound();
  let answers: { question: string; answer: string }[] = [];
  try {
    answers = JSON.parse(b.answers);
  } catch {}
  const tourTitle = pick(b.tour.translations, "en")?.title ?? b.tour.slug;

  return (
    <>
      <header className="page-head">
        <div>
          <Link href="/admin/bookings" className="crumb">Bookings</Link>
          <h1>{b.name}</h1>
        </div>
        <span className={`status status-${b.status} status-lg`}>{statusLabels[b.status] ?? b.status}</span>
      </header>

      <div className="detail-grid">
        <section className="card">
          <h2 className="card-title">Request</h2>
          <dl className="kv">
            <dt>Tour</dt>
            <dd><Link href={`/admin/tours/${b.tourId}`}>{tourTitle}</Link> (starts {shortDate(b.tour.startDate)})</dd>
            <dt>Travellers</dt>
            <dd>{b.travelers}</dd>
            <dt>Estimated value</dt>
            <dd>{euros(b.travelers * b.tour.priceEur)}</dd>
            <dt>Received</dt>
            <dd>{dateTime(b.createdAt)}</dd>
            <dt>Website language</dt>
            <dd>{isLocale(b.locale) ? localeNames[b.locale] : b.locale}</dd>
          </dl>

          {answers.length > 0 && (
            <>
              <h3 className="sub">Answers to tour questions</h3>
              <dl className="kv">
                {answers.map((a, i) => (
                  <div key={i} className="kv-row">
                    <dt>{a.question}</dt>
                    <dd>{a.answer || <span className="muted">No answer</span>}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {b.message && (
            <>
              <h3 className="sub">Message</h3>
              <p className="message">{b.message}</p>
            </>
          )}
        </section>

        <aside className="stack">
          <section className="card">
            <h2 className="card-title">Contact</h2>
            <dl className="kv">
              <dt>Email</dt>
              <dd><a href={`mailto:${b.email}`}>{b.email}</a></dd>
              <dt>Phone</dt>
              <dd>{b.phone ? <a href={`tel:${b.phone.replace(/\s/g, "")}`}>{b.phone}</a> : <span className="muted">Not given</span>}</dd>
              <dt>Country</dt>
              <dd>{b.country || <span className="muted">Not given</span>}</dd>
            </dl>
          </section>

          <section className="card">
            <h2 className="card-title">Payment</h2>
            <dl className="kv">
              <dt>Plan</dt>
              <dd>{planLabels[b.payPlan] ?? b.payPlan}</dd>
              <dt>Total</dt>
              <dd>{euros(b.totalEur || b.travelers * b.tour.priceEur)}</dd>
              <dt>Paid</dt>
              <dd>{euros(b.paidEur)}</dd>
              <dt>Still owed</dt>
              <dd><b>{euros(Math.max(0, (b.totalEur || b.travelers * b.tour.priceEur) - b.paidEur))}</b></dd>
            </dl>
            {b.payments.length > 0 && (
              <ul className="paylist">
                {b.payments.map((p) => (
                  <li key={p.id}>
                    <span>
                      {kindLabels[p.kind] ?? p.kind}, {euros(p.amountEur)}
                      <small className="muted">
                        {" "}({(p.amount / (p.currency === "TND" ? 1000 : 100)).toLocaleString("en-GB")} {p.currency}), {dateTime(p.createdAt)}
                      </small>
                    </span>
                    <span className={`status status-pay-${p.status}`}>{p.status === "completed" ? "Paid" : p.status === "failed" ? "Failed" : "Pending"}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="stack-sm">
              {b.payments.some((p) => p.status === "pending") && (
                <form action={refreshPayments}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="btn btn-quiet">Check status with Konnect</button>
                </form>
              )}
              {paymentsEnabled() && b.status !== "cancelled" && b.paidEur < (b.totalEur || b.travelers * b.tour.priceEur) && (
                <BalanceLink id={b.id} label={b.paidEur > 0 ? "Create link for the balance" : "Create payment link"} />
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Status</h2>
            <div className="stack-sm">
              {["new", "confirmed", "cancelled"].filter((s) => s !== b.status).map((s) => (
                <form key={s} action={setStatus}>
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="status" value={s} />
                  <button className={s === "confirmed" ? "btn" : "btn btn-quiet"}>
                    {s === "confirmed" ? "Confirm booking" : s === "cancelled" ? "Cancel booking" : "Mark as new"}
                  </button>
                </form>
              ))}
            </div>
            <p className="hint">Cancelled bookings free their places on the website.</p>
          </section>

          <form action={deleteBooking}>
            <input type="hidden" name="id" value={b.id} />
            <ConfirmButton className="linkish danger" message="Delete this booking request permanently?">Delete request</ConfirmButton>
          </form>
        </aside>
      </div>
    </>
  );
}
