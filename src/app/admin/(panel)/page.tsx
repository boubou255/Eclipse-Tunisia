import Link from "next/link";
import { db } from "@/lib/db";
import { holdsPlaces, pick } from "@/lib/tours";
import { dateTime, euros, statusLabels } from "@/lib/admin-format";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const [tours, recent, newCount, totals] = await Promise.all([
    db.tour.findMany({ orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }], include: { translations: true, bookings: { where: holdsPlaces(), select: { travelers: true, status: true, paidEur: true } } } }),
    db.booking.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { tour: { include: { translations: true } } } }),
    db.booking.count({ where: { status: "new" } }),
    db.booking.aggregate({ where: { status: "confirmed" }, _sum: { travelers: true } }),
  ]);

  const confirmedRevenue = tours.reduce(
    (sum, t) => sum + t.bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.travelers * t.priceEur, 0),
    0,
  );
  const received = tours.reduce((sum, t) => sum + t.bookings.reduce((s, b) => s + b.paidEur, 0), 0);

  return (
    <>
      <header className="page-head">
        <h1>Overview</h1>
      </header>

      <dl className="stats">
        <div>
          <dt>Requests waiting for a reply</dt>
          <dd>{newCount}</dd>
          {newCount > 0 && <Link href="/admin/bookings?status=new">Answer them</Link>}
        </div>
        <div>
          <dt>Confirmed travellers</dt>
          <dd>{totals._sum.travelers ?? 0}</dd>
        </div>
        <div>
          <dt>Confirmed value</dt>
          <dd>{euros(confirmedRevenue)}</dd>
        </div>
        <div>
          <dt>Paid online</dt>
          <dd>{euros(received)}</dd>
        </div>
      </dl>

      <section className="block">
        <h2>Places by tour</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Tour</th>
              <th className="num">Booked</th>
              <th className="num">Capacity</th>
              <th>Fill</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => {
              const booked = t.bookings.reduce((s, b) => s + b.travelers, 0);
              const pct = Math.min(100, Math.round((booked / Math.max(1, t.capacity)) * 100));
              return (
                <tr key={t.id}>
                  <td>
                    <Link href={`/admin/tours/${t.id}`}>{pick(t.translations, "en")?.title ?? t.slug}</Link>
                    {!t.published && <span className="tag">Draft</span>}
                  </td>
                  <td className="num">{booked}</td>
                  <td className="num">{t.capacity}</td>
                  <td>
                    <span className="meter" aria-label={`${pct}% full`}>
                      <span style={{ width: `${pct}%` }} />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="hint">Booked counts every request that is not cancelled. Unpaid online bookings hold their places for 35 minutes.</p>
      </section>

      <section className="block">
        <div className="block-head">
          <h2>Latest requests</h2>
          <Link href="/admin/bookings">All bookings</Link>
        </div>
        {recent.length === 0 ? (
          <p className="empty-state">No booking requests yet. They appear here as soon as a traveller sends the form on a tour page.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Received</th>
                <th>Name</th>
                <th>Tour</th>
                <th className="num">Travellers</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td>{dateTime(b.createdAt)}</td>
                  <td><Link href={`/admin/bookings/${b.id}`}>{b.name}</Link></td>
                  <td>{pick(b.tour.translations, "en")?.title}</td>
                  <td className="num">{b.travelers}</td>
                  <td><span className={`status status-${b.status}`}>{statusLabels[b.status] ?? b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
