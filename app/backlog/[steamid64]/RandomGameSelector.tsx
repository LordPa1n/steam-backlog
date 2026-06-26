"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

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
  lastPlayed?: string;
  controllerSupport?: boolean;
  deckVerified?: boolean;
  multiplayer?: boolean;
  singleplayer?: boolean;
};

type SortOption =
  | "random"
  | "highest-rated"
  | "lowest-hours"
  | "recently-purchased"
  | "longest-in-library";

function pickRandomGame(games: GameRow[]) {
  if (games.length === 0) return null;
  const idx = Math.floor(Math.random() * games.length);
  return games[idx];
}

function getReviewBadge(percent: number) {
  if (percent >= 90) return "Overwhelmingly Positive";
  if (percent >= 80) return "Very Positive";
  if (percent >= 70) return "Positive";
  return "Mixed";
}

function getBadgeColor(percent: number) {
  if (percent >= 90) return "bg-emerald-500/20 text-emerald-300";
  if (percent >= 80) return "bg-sky-500/20 text-sky-300";
  if (percent >= 70) return "bg-yellow-500/10 text-yellow-300";
  return "bg-gray-500/10 text-gray-300";
}

function shuffleGames(games: GameRow[]) {
  return [...games].sort(() => Math.random() - 0.5);
}

function buildSpinSequence(finalGame: GameRow, games: GameRow[], length: number) {
  const sequence: GameRow[] = [];
  const pool = games.filter((game) => game.appid !== finalGame.appid);

  for (let i = 0; i < length - 1; i += 1) {
    if (pool.length === 0) {
      sequence.push(finalGame);
      continue;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    sequence.push(pick);
  }

  sequence.push(finalGame);
  return sequence;
}

export default function RandomGameSelector({ games }: { games: GameRow[] }) {
  const genres = useMemo(() => ["All", ...Array.from(new Set(games.map((game) => game.genre))).sort()], [games]);
  const ratings = ["Any", "70", "80", "90"];
  const [genre, setGenre] = useState("All");
  const [minRating, setMinRating] = useState("Any");
  const [maxHours, setMaxHours] = useState("Any");
  const [minHours, setMinHours] = useState("Any");
  const [installedOnly, setInstalledOnly] = useState(false);
  const [unplayedOnly, setUnplayedOnly] = useState(false);
  const [multiplayerOnly, setMultiplayerOnly] = useState(false);
  const [singleplayerOnly, setSingleplayerOnly] = useState(false);
  const [controllerSupport, setControllerSupport] = useState(false);
  const [deckVerified, setDeckVerified] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [hideIgnored, setHideIgnored] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("random");
  const [selected, setSelected] = useState<GameRow | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spinItems, setSpinItems] = useState<GameRow[]>([]);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (genre !== "All" && game.genre !== genre) return false;
      if (unplayedOnly && game.playtimeHours > 0) return false;
      if (hideCompleted && game.playtimeHours >= 20) return false;
      if (minRating !== "Any" && game.reviewPercent < Number(minRating)) return false;
      if (maxHours === "0" && game.playtimeHours !== 0) return false;
      if (maxHours === "0-5" && !(game.playtimeHours >= 0 && game.playtimeHours <= 5)) return false;
      if (maxHours === "5-20" && !(game.playtimeHours > 5 && game.playtimeHours < 20)) return false;
      if (maxHours === "20+" && game.playtimeHours < 20) return false;
      if (minHours === "0" && game.playtimeHours !== 0) return false;
      if (minHours === "0-5" && game.playtimeHours > 5) return false;
      if (minHours === "5-20" && !(game.playtimeHours >= 5 && game.playtimeHours < 20)) return false;
      if (minHours === "20+" && game.playtimeHours < 20) return false;
      if (controllerSupport && !game.controllerSupport) return false;
      if (deckVerified && !game.deckVerified) return false;
      if (multiplayerOnly && !game.multiplayer) return false;
      if (singleplayerOnly && !game.singleplayer) return false;
      if (installedOnly && !game.controllerSupport) return false; // placeholder for installed games
      if (hideIgnored && game.achievementPercent < 20) return false;
      return true;
    });
  }, [games, genre, minRating, maxHours, minHours, installedOnly, unplayedOnly, multiplayerOnly, singleplayerOnly, controllerSupport, deckVerified, hideCompleted, hideIgnored]);

  const sortedGames = useMemo(() => {
    const list = [...filteredGames];
    switch (sortBy) {
      case "highest-rated":
        return list.sort((a, b) => b.reviewPercent - a.reviewPercent);
      case "lowest-hours":
        return list.sort((a, b) => a.playtimeHours - b.playtimeHours);
      case "recently-purchased":
        return list;
      case "longest-in-library":
        return list;
      default:
        return shuffleGames(list);
    }
  }, [filteredGames, sortBy]);

  const availableCount = sortedGames.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!spinning || spinItems.length === 0) return;

    const duration = prefersReducedMotion ? 100 : 2500;
    const start = performance.now();
    let requestId: number;

    const animate = (timestamp: number) => {
      const elapsed = Math.min(timestamp - start, duration);
      const progress = elapsed / duration;
      const eased = 1 - Math.pow(1 - progress, 3);
      const index = Math.min(spinItems.length - 1, Math.floor(eased * (spinItems.length - 1)));

      setCurrentSpinIndex(index);

      if (elapsed < duration) {
        requestId = requestAnimationFrame(animate);
      } else {
        setSelected(spinItems[spinItems.length - 1]);
        setShowReveal(true);
        setSpinning(false);
      }
    };

    requestId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestId);
  }, [spinning, spinItems, prefersReducedMotion]);

  function handlePick() {
    if (availableCount === 0 || spinning || loading) return;

    const target = pickRandomGame(sortedGames);
    if (!target) return;

    const steps = Math.min(12, Math.max(8, Math.floor(Math.random() * 5) + 8));
    const sequence = buildSpinSequence(target, sortedGames, steps);

    setSelected(null);
    setShowReveal(false);
    setSpinItems(sequence);
    setCurrentSpinIndex(0);
    setLoading(true);

    const startupDelay = prefersReducedMotion ? 0 : 240;
    setTimeout(() => {
      setLoading(false);
      setSpinning(true);
    }, startupDelay);
  }

  return (
    <section className="mt-10 rounded-3xl border border-white/10 bg-[#202429]/80 p-6 shadow-2xl shadow-black/25 ring-1 ring-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-pastel-peach">
            Still can't decide? Let fate choose your next adventure.
          </p>
          <h2 className="mt-2 text-3xl font-black text-pastel-cream">Random Game Selector</h2>
          <p className="mt-2 text-sm leading-6 text-pastel-lavender/70">
            Use filters to narrow your library, then spin the wheel for a surprise pick.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePick}
          disabled={availableCount === 0 || spinning || loading}
          className="inline-flex items-center justify-center rounded-3xl border border-pastel-mint/30 bg-linear-to-r from-pastel-mint/90 to-pastel-sky/70 px-6 py-3 text-sm font-black text-[#111827] shadow-lg shadow-pastel-mint/10 transition hover:from-pastel-mint hover:to-pastel-sky/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          🎲 {loading || spinning ? "Spinning..." : "Pick My Next Game"}
        </button>
      </div>

      <div className="mt-8 grid gap-3 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-3 rounded-3xl border border-white/10 bg-[#181b1f]/75 p-4 ring-1 ring-white/5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-pastel-lavender/70">
              Genre
              <select
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                className="rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream"
              >
                {genres.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-pastel-lavender/70">
              Minimum Steam Rating %
              <select
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
                className="rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream"
              >
                {ratings.map((value) => (
                  <option key={value} value={value}>
                    {value === "Any" ? value : `${value}%+`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-pastel-lavender/70">
              Minimum Hours Played
              <select
                value={minHours}
                onChange={(event) => setMinHours(event.target.value)}
                className="rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream"
              >
                <option>Any</option>
                <option value="0">0</option>
                <option value="0-5">0-5</option>
                <option value="5-20">5-20</option>
                <option value="20+">20+</option>
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-pastel-lavender/70">
              Maximum Hours Played
              <select
                value={maxHours}
                onChange={(event) => setMaxHours(event.target.value)}
                className="rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream"
              >
                <option>Any</option>
                <option value="0">0</option>
                <option value="0-5">0-5</option>
                <option value="5-20">5-20</option>
                <option value="20+">20+</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={installedOnly}
                onChange={(event) => setInstalledOnly(event.target.checked)}
              />
              Installed only
            </label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={unplayedOnly}
                onChange={(event) => setUnplayedOnly(event.target.checked)}
              />
              Unplayed only
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={multiplayerOnly}
                onChange={(event) => setMultiplayerOnly(event.target.checked)}
              />
              Multiplayer only
            </label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={singleplayerOnly}
                onChange={(event) => setSingleplayerOnly(event.target.checked)}
              />
              Single-player only
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={controllerSupport}
                onChange={(event) => setControllerSupport(event.target.checked)}
              />
              Controller Support
            </label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={deckVerified}
                onChange={(event) => setDeckVerified(event.target.checked)}
              />
              Steam Deck Verified
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(event) => setHideCompleted(event.target.checked)}
              />
              Hide completed games
            </label>
            <label className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream">
              <input
                type="checkbox"
                checked={hideIgnored}
                onChange={(event) => setHideIgnored(event.target.checked)}
              />
              Hide ignored games
            </label>
          </div>

          <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-pastel-lavender/70">
            Sort by
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-2xl border border-white/10 bg-[#12181f] px-3 py-2 text-sm text-pastel-cream"
            >
              <option value="random">Random</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="lowest-hours">Lowest Hours</option>
              <option value="recently-purchased">Recently Purchased</option>
              <option value="longest-in-library">Longest in Library</option>
            </select>
          </label>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#14181d]/85 p-4 ring-1 ring-white/5">
          <div className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4 shadow-inner shadow-black/20 transition-all duration-500">
            {loading ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-[#20252d]/95 p-4 shadow-xl shadow-black/15 animate-pulse">
                  <div className="h-40 w-full rounded-3xl bg-white/10" />
                </div>
                <div className="space-y-3">
                  <div className="h-6 w-40 rounded-full bg-white/10" />
                  <div className="h-5 w-3/5 rounded-full bg-white/10" />
                  <div className="grid gap-3 rounded-3xl border border-white/10 bg-[#202429]/80 p-4">
                    <div className="h-4 w-24 rounded-full bg-white/10" />
                    <div className="h-4 w-full rounded-full bg-white/10" />
                    <div className="h-4 w-5/6 rounded-full bg-white/10" />
                  </div>
                </div>
                <p className="text-center text-sm text-pastel-lavender/60">
                  Searching your library<span className="typing-dots">...</span>
                </p>
              </div>
            ) : spinning ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#20252d]/95 p-4 shadow-xl shadow-black/20 ring-2 ring-white/5">
                  <Image
                    src={spinItems[currentSpinIndex]?.thumbnailUrl || ""}
                    alt={spinItems[currentSpinIndex]?.name || "Spinning game"}
                    width={332}
                    height={186}
                    className="h-40 w-full rounded-3xl object-cover transition-transform duration-300 ease-out"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-pastel-peach">Spinning...</p>
                      <h3 className="mt-2 text-xl font-black text-pastel-cream truncate">
                        {spinItems[currentSpinIndex]?.name || "Preparing your pick"}
                      </h3>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-pastel-lavender/70">
                      🎰 Rolling
                    </span>
                  </div>
                </div>
              </div>
            ) : selected ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-3xl border border-transparent bg-linear-to-br from-pastel-sky/10 via-white/10 to-pastel-mint/10 p-1 shadow-[0_30px_80px_-45px_rgba(56,189,248,0.8)]">
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#20252d]/95 p-4 shadow-xl shadow-black/20 animate-card-reveal">
                    <Image
                      src={selected.thumbnailUrl}
                      alt={selected.name}
                      width={332}
                      height={186}
                      className="h-40 w-full rounded-3xl object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <span className="absolute left-[-30%] top-1/2 h-2 w-24 rounded-full bg-white/30 shadow-[0_0_20px_10px_rgba(255,255,255,0.4)] blur-xl animate-shimmer" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-pastel-peach">Selected Game</p>
                      <h3 className="mt-2 text-xl font-black text-pastel-cream">{selected.name}</h3>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getBadgeColor(selected.reviewPercent)}`}>
                      {getReviewBadge(selected.reviewPercent)}
                    </span>
                  </div>

                  <div className="grid gap-2 rounded-3xl border border-white/10 bg-[#202429]/80 p-4 text-sm text-pastel-lavender/75">
                    <div className="flex flex-wrap gap-3">
                      <span>⭐ {selected.reviewPercent}%</span>
                      <span>⏱️ {selected.playtimeHours} hrs</span>
                      <span>🧩 {selected.genre}</span>
                      <span>{selected.controllerSupport ? "Controller" : "No Controller"}</span>
                      <span>{selected.deckVerified ? "Deck Verified" : "Deck Unverified"}</span>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-3 text-sm text-pastel-lavender/70">
                      <p className="font-semibold text-pastel-cream">Why this game?</p>
                      <p className="mt-2 leading-6">
                        This game matches your filtered preferences while highlighting low playtime and strong community rating.
                      </p>
                    </div>
                  </div>
                </div>
                {showReveal && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.18),transparent_60%)] opacity-0 animate-glow-pulse" />
                    <div className="absolute inset-0 rounded-3xl opacity-0" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-pastel-lavender/70">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5 text-4xl text-pastel-peach">
                  🎲
                </div>
                <p className="text-base font-semibold text-pastel-cream">
                  Click the button above to discover your next adventure
                </p>
              </div>
            )}
          </div>
          <p className="mt-4 text-sm text-pastel-lavender/70">
            {availableCount} games match your current filters.
          </p>
        </div>
      </div>
    </section>
  );
}
