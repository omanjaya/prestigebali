// Loading fallback global — minimal & elegan: wordmark "Prestige" dengan pulse
// opacity halus. Server Component murni (tanpa JS di klien selain CSS animasi);
// keyframes berprefiks `ldg-` didefinisikan inline agar file ini tetap swasembada.

export default function Loading() {
  return (
    <div className="ldg-wrap" role="status" aria-label="Loading">
      <span className="ldg-word">Prestige</span>
      <style>{`
        .ldg-wrap {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4rem 1rem;
        }
        .ldg-word {
          font-family: var(--font-display, Georgia, serif);
          font-size: clamp(1.8rem, 5vw, 2.6rem);
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--text, #171310);
        }
        .ldg-word::first-letter {
          color: var(--accent, #a8842c);
        }
        @keyframes ldg-pulse {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: no-preference) {
          .ldg-word {
            animation: ldg-pulse 1.8s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
}
