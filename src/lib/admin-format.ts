export const statusLabels: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

export function shortDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Tunis" }).format(d);
}

export function dateTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Tunis" }).format(d);
}

export function euros(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}
