"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

export default function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.split("/").slice(2).join("/");
  return (
    <details className="lang">
      <summary aria-label={label}>{localeNames[current]}</summary>
      <ul>
        {locales.map((l) => (
          <li key={l}>
            <Link href={`/${l}${rest ? `/${rest}` : ""}`} hrefLang={l} lang={l} aria-current={l === current ? "true" : undefined}>
              {localeNames[l]}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
