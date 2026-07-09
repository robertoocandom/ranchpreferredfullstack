import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { strings, type Lang, type StringKey } from './strings';

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'ranch-preferred:lang';

function readInitialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'es' || saved === 'en') return saved;
  return 'es';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(readInitialLang);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: StringKey, vars?: Record<string, string | number>) => {
      let text: string = strings[lang][key] ?? strings.es[key];
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.replace(`{${k}}`, String(v));
        }
      }
      return text;
    };
    const toggleLang = () => {
      setLang((prev) => {
        const next = prev === 'es' ? 'en' : 'es';
        localStorage.setItem(STORAGE_KEY, next);
        return next;
      });
    };
    return { lang, toggleLang, t };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
