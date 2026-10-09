import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LANG, LANGUAGES, translations } from './translations.js';
import { loadJSON, saveJSON } from '../lib/storage.js';

const I18nContext = createContext(null);
const STORAGE_KEY = 'vibes-eclipse-lang';

function initialLang() {
  const saved = loadJSON(STORAGE_KEY, null);
  if (saved && translations[saved]) return saved;
  return DEFAULT_LANG;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    saveJSON(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  /** t('key', { var: 'x' }) – falls back to French, then to the key itself. */
  const t = useCallback(
    (key, vars) => {
      let str = translations[lang]?.[key] ?? translations[DEFAULT_LANG]?.[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
      }
      return str;
    },
    [lang],
  );

  /** tx({ fr, en, de }) – pick the localized value from a data object (or return a plain string). */
  const tx = useCallback(
    (obj) => {
      if (obj == null) return '';
      if (typeof obj === 'string') return obj;
      return obj[lang] ?? obj[DEFAULT_LANG] ?? Object.values(obj)[0] ?? '';
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t, tx, languages: LANGUAGES }), [lang, t, tx]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
