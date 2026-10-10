import { NextResponse, type NextRequest } from "next/server";
import { syncPayment } from "@/lib/konnect";
import { revalidatePath } from "next/cache";

/**
 * Konnect calls this URL (GET, ?payment_ref=...) when a payment changes.
 * The request itself is not trusted: we look the payment up with our API key instead.
 */
async function handle(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("payment_ref");
  if (!ref) return NextResponse.json({ ok: false, error: "missing payment_ref" }, { status: 400 });
  try {
    const payment = await syncPayment(ref);
    if (!payment) return NextResponse.json({ ok: false, error: "unknown payment" }, { status: 404 });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, status: payment.status });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;
