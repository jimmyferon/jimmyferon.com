"use client";

import { createContext, useContext, useEffect, useState } from "react";

const LangContext = createContext({ lang: "fr", setLang: () => {} });

/**
 * Langue de l'interface (fr par défaut).
 * Le choix est conservé d'une visite à l'autre et reporté sur l'attribut
 * lang du document, pour les lecteurs d'écran et l'indexation.
 */
export function LangProvider({ children }) {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("jf-lang");
    if (saved === "fr" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem("jf-lang", lang);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
