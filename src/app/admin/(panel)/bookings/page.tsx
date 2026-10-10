import Link from "next/link";
import { db } from "@/lib/db";
import { pick } from "@/lib/tours";
import { dateTime, euros, statusLabels } from "@/lib/admin-format";

export const dynamic = "force-dynamic";

const filters = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export default async function Bookings({ searchParams }: { searchParams: Promise<{ status?: string; tour?: string }> }) {
  const { status = "", tour = "" } = await searchParams;
  const [bookings, tours] = await Promise.all([
    db.booking.findMany({
      where: { ...(status ? { status } : {}), ...(tour ? { tourId: tour } : {}) },
      orderBy: { createdAt: "desc" },
      include: { tour: { include: { translations: true } } },
    }),
    db.tour.findMany({ orderBy: { startDate: "asc" }, include: { translations: true } }),
  ]);
  const q = (s: string, t: string) => {
    const p = new URLSearchParams();
    if (s) p.set("status", s);
    if (t) p.set("tour", t);
    const str = p.toString();
    return `/admin/bookings${str ? `?${str}` : ""}`;
  };

  return (
    <>
      <header className="page-head">
        <h1>Bookings</h1>
      </header>

      <div className="filters">
        <nav className="seg" aria-label="Status">
          {filters.map((f) => (
            <Link key={f.value} href={q(f.value, tour)} aria-current={status === f.value ? "page" : undefined}>{f.label}</Link>
          ))}
        </nav>
        <form className="row" action="/admin/bookings">
          {status && <input type="hidden" name="status" value={status} />}
          <label className="field field-inline">
            <span>Tour</span>
            <select name="tour" defaultValue={tour}>
              <option value="">All tours</option>
              {tours.map((t) => <option key={t.id} value={t.id}>{pick(t.translations, "en")?.title ?? t.slug}</option>)}
            </select>
          </label>
          <button className="btn btn-quiet">Filter</button>
        </form>
      </div>

      {bookings.length === 0 ? (
        <p className="empty-state">No bookings match these filters.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Received</th>
              <th>Name</th>
              <th>Email</th>
              <th>Tour</th>
              <th className="num">Travellers</th>
              <th className="num">Paid</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{dateTime(b.createdAt)}</td>
                <td><Link href={`/admin/bookings/${b.id}`}>{b.name}</Link></td>
                <td><a href={`mailto:${b.email}`}>{b.email}</a></td>
                <td>{pick(b.tour.translations, "en")?.title}</td>
                <td className="num">{b.travelers}</td>
                <td className="num">{b.paidEur ? euros(b.paidEur) : "–"}</td>
                <td><span className={`status status-${b.status}`}>{statusLabels[b.status] ?? b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
