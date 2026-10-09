import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import TourForm from "@/components/admin/TourForm";
import QuestionForm from "@/components/admin/QuestionForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deleteQuestion, deleteTour } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditTour({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { id } = await params;
  const { created } = await searchParams;
  const tour = await db.tour.findUnique({
    where: { id },
    include: { translations: true, questions: { orderBy: { sortOrder: "asc" }, include: { translations: true } } },
  });
  if (!tour) notFound();

  const title = tour.translations.find((t) => t.locale === "en")?.title ?? tour.slug;
  const faqs = tour.questions.filter((q) => q.kind === "faq");
  const bookingQs = tour.questions.filter((q) => q.kind === "booking");
  const toValues = (q: (typeof tour.questions)[number]) => ({
    id: q.id,
    kind: q.kind,
    inputType: q.inputType,
    required: q.required,
    sortOrder: q.sortOrder,
    translations: Object.fromEntries(q.translations.map((t) => [t.locale, { question: t.question, answer: t.answer }])),
  });

  return (
    <>
      <header className="page-head">
        <div>
          <Link href="/admin/tours" className="crumb">Tours</Link>
          <h1>{title}</h1>
        </div>
        {tour.published && (
          <a className="btn btn-quiet" href={`/en/tours/${tour.slug}`} target="_blank" rel="noreferrer">View on website</a>
        )}
      </header>
      {created && <p className="ok" role="status">Tour created. Add questions below, then publish it when it is ready.</p>}

      <TourForm
        values={{
          id: tour.id,
          slug: tour.slug,
          priceEur: tour.priceEur,
          durationDays: tour.durationDays,
          capacity: tour.capacity,
          startDate: tour.startDate.toISOString().slice(0, 10),
          imageUrl: tour.imageUrl ?? "",
          viewingSite: tour.viewingSite,
          totality: tour.totality,
          sortOrder: tour.sortOrder,
          published: tour.published,
          translations: Object.fromEntries(tour.translations.map((t) => [t.locale, t])),
        }}
      />

      <section className="block" id="questions">
        <h2>Questions for this tour</h2>
        <p className="hint">
          FAQs appear on the tour page with their answer. Booking questions are asked in the booking form, and each traveller’s answers are saved with their request.
        </p>

        {[
          { label: "FAQ", list: faqs },
          { label: "Booking form", list: bookingQs },
        ].map(({ label, list }) => (
          <div key={label} className="qgroup">
            <h3>{label} <span className="count">{list.length}</span></h3>
            {list.length === 0 && <p className="hint">None yet.</p>}
            {list.map((q) => (
              <details key={q.id} className="card qcard">
                <summary>
                  <span>{q.translations.find((t) => t.locale === "en")?.question ?? "(no English text)"}</span>
                  <span className="qmeta">
                    {q.kind === "booking" && <>{({ text: "Short text", textarea: "Long text", select: "List", boolean: "Yes / No" } as Record<string, string>)[q.inputType]}{q.required && ", required"}, </>}
                    {q.translations.length} {q.translations.length === 1 ? "language" : "languages"}
                  </span>
                </summary>
                <QuestionForm tourId={tour.id} values={toValues(q)} />
                <form action={deleteQuestion} className="delete-row">
                  <input type="hidden" name="id" value={q.id} />
                  <ConfirmButton className="linkish danger" message="Delete this question in every language?">Delete question</ConfirmButton>
                </form>
              </details>
            ))}
          </div>
        ))}

        <div className="card">
          <h3 className="card-title">Add a question</h3>
          <QuestionForm
            key={tour.questions.length}
            tourId={tour.id}
            values={{ kind: "faq", inputType: "text", required: false, sortOrder: tour.questions.length, translations: {} }}
          />
        </div>
      </section>

      <section className="block danger-zone">
        <h2>Delete tour</h2>
        <p className="hint">This removes the tour, its questions and all its booking requests. It cannot be undone. To hide a tour, untick Published instead.</p>
        <form action={deleteTour}>
          <input type="hidden" name="id" value={tour.id} />
          <ConfirmButton className="btn btn-danger" message={`Delete “${title}” and all its bookings? This cannot be undone.`}>Delete tour</ConfirmButton>
        </form>
      </section>
    </>
  );
}
