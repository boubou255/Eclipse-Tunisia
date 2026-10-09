import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

function preferredLocale(req: NextRequest) {
  const saved = req.cookies.get("locale")?.value;
  if (saved && isLocale(saved)) return saved;
  const header = req.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (isLocale(first)) {
    const res = NextResponse.next();
    res.cookies.set("locale", first, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return res;
  }
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!admin|api|_next|favicon.ico|uploads|.*\\..*).*)"],
};

