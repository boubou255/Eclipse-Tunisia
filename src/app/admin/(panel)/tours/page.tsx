import Link from "next/link";
import { db } from "@/lib/db";
import { pick } from "@/lib/tours";
import { euros, shortDate } from "@/lib/admin-format";
import { locales } from "@/i18n/config";

export const dynamic = "force-dynamic";

export default async function ToursAdmin() {
  const tours = await db.tour.findMany({
    orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
    include: { translations: { select: { locale: true, title: true } }, _count: { select: { questions: true, bookings: true } } },
  });

  return (
    <>
      <header className="page-head">
        <h1>Tours</h1>
        <Link className="btn" href="/admin/tours/new">New tour</Link>
      </header>
      {tours.length === 0 ? (
        <p className="empty-state">No tours yet. Create the first one and it will appear on the website when you publish it.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Tour</th>
              <th>Starts</th>
              <th className="num">Price</th>
              <th className="num">Places</th>
              <th>Languages</th>
              <th className="num">Questions</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((t) => (
              <tr key={t.id}>
                <td><Link href={`/admin/tours/${t.id}`}>{pick(t.translations, "en")?.title ?? t.slug}</Link></td>
                <td>{shortDate(t.startDate)}</td>
                <td className="num">{euros(t.priceEur)}</td>
                <td className="num">{t.capacity}</td>
                <td>
                  <span className="langs">
                    {locales.map((l) => (
                      <abbr key={l} title={l} className={t.translations.some((x) => x.locale === l) ? "on" : ""}>{l}</abbr>
                    ))}
                  </span>
                </td>
                <td className="num">{t._count.questions}</td>
                <td>{t.published ? <span className="status status-confirmed">Published</span> : <span className="status">Draft</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
