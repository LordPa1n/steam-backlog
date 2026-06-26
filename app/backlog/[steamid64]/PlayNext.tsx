"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type GameRow = {
  appid: number;
  name: string;
  thumbnailUrl: string;
  genre: string;
  hoursToBeat: number;
  playtimeHours: number;
  achievementPercent: number;
  reviewPercent: number;
};

const tooltipText = `Recommendations are generated using multiple factors:\n\n• Steam review score\n• Your playtime\n• Completion status\n• Genre diversity\n• Whether you've never launched the game\n• Community rating\n• Hidden gems in your library\n• Recently purchased games\n\nEach game receives a recommendation score based on these factors.`;

export default function PlayNext({ games }: { games: GameRow[] }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const hideTimeout = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (hideTimeout.current) {
      window.clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = window.setTimeout(() => {
      setShowTooltip(false);
    }, 150);
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#181b1f]/80 p-6 shadow-2xl shadow-black/20 ring-1 ring-pastel-sky/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-pastel-peach">
                🎮 Games You Should Play Next
              </p>
              <h2 className="mt-2 text-2xl font-black text-pastel-cream">🎯 Play Next</h2>
            </div>
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative inline-flex"
            >
              <button
                type="button"
                aria-expanded={showTooltip}
                aria-label="Recommendation explanation"
                onClick={() => setShowTooltip((current) => !current)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-pastel-cream transition hover:border-pastel-sky/30 hover:bg-white/10"
              >
                ⓘ
              </button>
              {showTooltip && (
                <div className="animate-fade-in absolute left-0 top-full z-10 mt-3 w-[26rem] rounded-3xl border border-white/10 bg-[#14181d]/95 p-4 text-sm leading-6 text-pastel-lavender shadow-xl shadow-black/25 ring-1 ring-white/5">
                  <p className="mb-3 font-semibold text-pastel-cream">
                    How are these recommendations calculated?
                  </p>
                  <p className="whitespace-pre-line text-pastel-lavender/75">
                    {tooltipText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="text-sm text-pastel-lavender/70">Top short backlog picks for your library.</div>
      </div>

      <ol className="mt-6 grid gap-3">
        {games.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-pastel-lavender/70">
            No recommendations available yet.
          </li>
        ) : (
          games.map((game, index) => (
            <li
              key={game.appid}
              className="flex items-center gap-4 rounded-3xl border border-white/10 bg-[#202429]/65 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-pastel-sky/30 hover:bg-[#232b33]"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-pastel-peach/20 text-sm font-black text-pastel-peach">
                {index + 1}
              </span>
              <Image
                src={game.thumbnailUrl}
                alt={game.name}
                width={184}
                height={69}
                className="h-14 w-28 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-pastel-cream">{game.name}</p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-pastel-lavender/70">
                  <span>⏱️ {game.hoursToBeat}h estimate</span>
                  <span>⭐ {game.reviewPercent}%</span>
                  <span>🧩 {game.genre}</span>
                </div>
              </div>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
