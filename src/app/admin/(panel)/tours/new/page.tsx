import Link from "next/link";
import TourForm from "@/components/admin/TourForm";

export default function NewTour() {
  return (
    <>
      <header className="page-head">
        <div>
          <Link href="/admin/tours" className="crumb">Tours</Link>
          <h1>New tour</h1>
        </div>
      </header>
      <p className="hint">Questions can be added after the tour is created.</p>
      <TourForm
        values={{
          slug: "",
          priceEur: "",
          durationDays: "",
          capacity: "",
          startDate: "2027-08-01",
          imageUrl: "",
          viewingSite: "Sfax",
          totality: "≈ 5 min 40 s",
          sortOrder: 0,
          published: false,
          translations: {},
        }}
      />
    </>
  );
}
