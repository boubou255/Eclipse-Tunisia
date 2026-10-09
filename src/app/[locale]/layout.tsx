import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bodoni_Moda, Schibsted_Grotesk, Noto_Kufi_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";
import { dir, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { site } from "@/lib/site";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import "../site.css";

const display = Bodoni_Moda({ subsets: ["latin"], variable: "--font-display", display: "swap", style: ["normal", "italic"] });
const body = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const arabicDisplay = Noto_Kufi_Arabic({ subsets: ["arabic"], variable: "--font-ar-display", display: "swap", weight: ["400", "600"] });
const arabicBody = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], variable: "--font-ar-body", display: "swap", weight: ["400", "500", "600"] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const year = new Date().getFullYear();

  return (
    <html lang={locale} dir={dir(locale)}>
      <body className={`${display.variable} ${body.variable} ${arabicDisplay.variable} ${arabicBody.variable}`}>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-header">
          <Link href={`/${locale}`} className="brand">
            <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
              <circle cx="16" cy="16" r="10" fill="currentColor" opacity="0.18" />
              <circle cx="19" cy="14" r="9.4" fill="var(--header-bg)" />
              <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span>{site.name}</span>
          </Link>
          <nav aria-label="Main">
            <a href={`/${locale}#tours`}>{t.nav.tours}</a>
            <a href={`/${locale}#why`}>{t.nav.why}</a>
            <a href={`/${locale}#how`}>{t.nav.how}</a>
            <a href="#contact">{t.nav.contact}</a>
          </nav>
          <LanguageSwitcher current={locale} label={t.nav.language} />
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer" id="contact">
          <div>
            <p className="footer-name">{site.name}</p>
            <p>{t.footer.tagline}</p>
          </div>
          <address>
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} dir="ltr">{site.phone}</a>
            <span>{site.city}</span>
          </address>
          <p className="footer-safety">{t.footer.safety}</p>
          <p className="footer-small">© {year} {site.name}. {t.footer.rights}</p>
        </footer>
      </body>
    </html>
  );
}
