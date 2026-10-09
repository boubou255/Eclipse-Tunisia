import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";
import en from "./dictionaries/en";
import fr from "./dictionaries/fr";
import de from "./dictionaries/de";
import it from "./dictionaries/it";
import es from "./dictionaries/es";
import ar from "./dictionaries/ar";
import ja from "./dictionaries/ja";
import zh from "./dictionaries/zh";

const dictionaries: Record<Locale, Dictionary> = { en, fr, de, it, es, ar, ja, zh };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

export type { Dictionary };
