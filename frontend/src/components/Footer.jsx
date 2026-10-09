import { useI18n } from '../i18n/I18nContext.jsx';
import { site } from '../data/site.js';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-white/10 bg-night-950/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-display text-base font-semibold text-slate-200">{site.agency}</p>
          <p className="mt-1 max-w-md">{t('footer.disclaimer')}</p>
        </div>
        <div>
          <p className="font-semibold text-slate-200">{t('footer.contact')}</p>
          <ul className="mt-1 space-y-1">
            {site.whatsappNumbers.map((n) => (
              <li key={n.wa}>
                <a className="text-corona-300 hover:underline" href={`https://wa.me/${n.wa}`} target="_blank" rel="noopener noreferrer">
                  {n.display}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
