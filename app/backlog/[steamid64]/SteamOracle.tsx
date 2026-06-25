"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type GameRow = {
  appid: number;
  name: string;
  thumbnailUrl: string;
  genre: string;
  hoursToBeat: number;
  playtimeHours: number;
  achievementPercent: number;
  reviewPercent: number;
  reviewCategory: string;
};

function selectRandomGame(games: GameRow[]) {
  if (games.length === 0) return null;
  const idx = Math.floor(Math.random() * games.length);
  return games[idx];
}

function mapReviewCategory(percent: number) {
  if (percent >= 90) return "Overwhelmingly Positive";
  if (percent >= 80) return "Very Positive";
  if (percent >= 70) return "Positive";
  return "Mixed";
}

function badgeColorForCategory(cat: string) {
  switch (cat) {
    case "Overwhelmingly Positive":
      return "bg-emerald-500/20 text-emerald-300";
    case "Very Positive":
      return "bg-sky-500/20 text-sky-300";
    case "Positive":
      return "bg-yellow-500/10 text-yellow-300";
    default:
      return "bg-gray-500/10 text-gray-300";
  }
}

export default function SteamOracle({ games }: { games: GameRow[] }) {
  const genres = useMemo(() => ["All", ...Array.from(new Set(games.map((g) => g.genre))).sort()], [games]);
  const [genre, setGenre] = useState<string>("All");
  const [status, setStatus] = useState<string>("Any");
  const [hours, setHours] = useState<string>("Any");
  const [rating, setRating] = useState<string>("Any");
  const [picked, setPicked] = useState<GameRow | null>(null);

  function filterGames() {
    return games.filter((g) => {
      if (genre !== "All" && g.genre !== genre) return false;

      if (status === "Unplayed" && g.playtimeHours > 0) return false;
      if (status === "Started" && (g.playtimeHours === 0 || g.playtimeHours >= 20)) return false;
      if (status === "Completed" && g.playtimeHours < 20) return false;

      if (hours === "0" && g.playtimeHours !== 0) return false;
      if (hours === "0-5" && !(g.playtimeHours > 0 && g.playtimeHours <= 5)) return false;
      if (hours === "5-20" && !(g.playtimeHours > 5 && g.playtimeHours < 20)) return false;
      if (hours === "20+" && !(g.playtimeHours >= 20)) return false;

      if (rating === "70" && g.reviewPercent < 70) return false;
      if (rating === "80" && g.reviewPercent < 80) return false;
      if (rating === "90" && g.reviewPercent < 90) return false;

      return true;
    });
  }

  function handlePick() {
    const pool = filterGames();
    const pickedGame = selectRandomGame(pool);
    setPicked(pickedGame);
  }

  const filteredCount = filterGames().length;

  return (
    <section className="mt-6 rounded-2xl border border-white/10 bg-[#202429]/65 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-pastel-peach">🎲 Steam Oracle</p>
          <h3 className="mt-2 text-xl font-black text-pastel-cream">Personalized recommendation</h3>
        </div>
        <div className="text-sm text-pastel-lavender/70">{filteredCount} candidates</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <label className="text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
          Genre
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm text-pastel-cream">
            {genres.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label className="text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm text-pastel-cream">
            <option>Any</option>
            <option>Unplayed</option>
            <option>Started</option>
            <option>Completed</option>
          </select>
        </label>

        <label className="text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
          Hours Played
          <select value={hours} onChange={(e) => setHours(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm text-pastel-cream">
            <option value="Any">Any</option>
            <option value="0">0</option>
            <option value="0-5">0-5</option>
            <option value="5-20">5-20</option>
            <option value="20+">20+</option>
          </select>
        </label>

        <label className="text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
          Steam Rating
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm text-pastel-cream">
            <option value="Any">Any</option>
            <option value="70">70%+</option>
            <option value="80">80%+</option>
            <option value="90">90%+</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-pastel-lavender/70">Choose filters then press the button to get a random pick.</p>
        <button onClick={handlePick} className="mt-2 inline-flex items-center gap-3 rounded-2xl border border-pastel-mint/40 bg-gradient-to-r from-pastel-mint/85 to-pastel-sky/80 px-4 py-2 text-sm font-black text-[#181b1f] shadow-lg shadow-pastel-mint/10">
          🎲 Pick My Next Game
        </button>
      </div>

      {picked ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-[#181b1f]/80 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Image src={picked.thumbnailUrl} alt="" width={184} height={69} className="h-20 w-32 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <h4 className="truncate text-lg font-bold text-pastel-cream">{picked.name}</h4>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-pastel-lavender/70">
                <span>{picked.playtimeHours} hrs</span>
                <span className={`${badgeColorForCategory(picked.reviewCategory)} rounded-full px-2 py-1 text-xs font-semibold`}>{picked.reviewCategory}</span>
                <span className="text-pastel-cream/80">{picked.reviewPercent}%</span>
                <span className="text-pastel-lavender/70">• {picked.genre}</span>
                <a href={`https://store.steampowered.com/app/${picked.appid}`} target="_blank" rel="noreferrer" className="ml-2 text-pastel-sky underline">Store</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-pastel-lavender/70">No recommendation selected yet.</div>
      )}
    </section>
  );
}
