"use client";

import { useState } from "react";
import { locales, localeNames, dir, type Locale } from "@/i18n/config";

type Props = {
  /** Locales that already have content, marked in the tab list. */
  filled: string[];
  children: (locale: Locale) => React.ReactNode;
  idPrefix: string;
};

/** Every language panel stays in the form (hidden, not removed) so all languages save together. */
export default function LocaleTabs({ filled, children, idPrefix }: Props) {
  const [active, setActive] = useState<Locale>("en");
  return (
    <div className="tabs">
      <div role="tablist" className="tablist" aria-label="Language">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${l}`}
            aria-selected={active === l}
            aria-controls={`${idPrefix}-panel-${l}`}
            onClick={() => setActive(l)}
          >
            {localeNames[l]}
            {filled.includes(l) ? <span className="dot" aria-label="has content" /> : <span className="dot dot-empty" aria-label="empty" />}
          </button>
        ))}
      </div>
      {locales.map((l) => (
        <div
          key={l}
          role="tabpanel"
          id={`${idPrefix}-panel-${l}`}
          aria-labelledby={`${idPrefix}-tab-${l}`}
          hidden={active !== l}
          dir={dir(l)}
          lang={l}
          className="tabpanel"
        >
          {l !== "en" && <p className="hint">Leave the title empty to show the English version in {localeNames[l]}.</p>}
          {children(l)}
        </div>
      ))}
    </div>
  );
}
