"use client";

// Reproduit buildRoll() du site original : chaque lettre = 2 copies empilées
// qui glissent vers le haut au survol (le CSS .roll/.rl/.rl-in gère l'animation).
export default function Roll({ text }) {
  const chars = [...String(text)];
  return (
    <span className="roll">
      {chars.map((ch, i) => {
        const c = ch === " " ? "\u00A0" : ch;
        return (
          <span className="rl" key={i}>
            <span className="rl-in" style={{ transitionDelay: `${(i * 0.02).toFixed(3)}s` }}>
              <span className="t">{c}</span>
              <span className="t b">{c}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
