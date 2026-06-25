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
};

type BacklogTabsProps = {
  overview: React.ReactNode;
  unplayedGames: GameRow[];
  startedGames: GameRow[];
  completedGames: GameRow[];
};

const tabs = ["Overview", "Unplayed", "Started", "Completed"] as const;

type Tab = (typeof tabs)[number];
type SortKey = "recommended" | "name" | "playtime-desc" | "playtime-asc" | "hours";

function GameIdentity({ game }: { game: GameRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Image
        src={game.thumbnailUrl}
        alt=""
        width={184}
        height={69}
        className="h-12 w-24 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
      />
      <span className="min-w-0 truncate font-semibold text-pastel-cream">
        {game.name}
      </span>
    </div>
  );
}

function filterAndSortGames({
  games,
  query,
  genre,
  sort,
}: {
  games: GameRow[];
  query: string;
  genre: string;
  sort: SortKey;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return games
    .filter((game) => {
      const matchesQuery =
        !normalizedQuery ||
        game.name.toLowerCase().includes(normalizedQuery) ||
        game.genre.toLowerCase().includes(normalizedQuery);
      const matchesGenre = genre === "All" || game.genre === genre;

      return matchesQuery && matchesGenre;
    })
    .sort((first, second) => {
      switch (sort) {
        case "name":
          return first.name.localeCompare(second.name);
        case "playtime-desc":
          return second.playtimeHours - first.playtimeHours;
        case "playtime-asc":
          return first.playtimeHours - second.playtimeHours;
        case "hours":
          return first.hoursToBeat - second.hoursToBeat;
        default:
          return (
            first.hoursToBeat - second.hoursToBeat ||
            first.name.localeCompare(second.name)
          );
      }
    });
}

function GameControls({
  genres,
  query,
  setQuery,
  genre,
  setGenre,
  sort,
  setSort,
}: {
  genres: string[];
  query: string;
  setQuery: (value: string) => void;
  genre: string;
  setGenre: (value: string) => void;
  sort: SortKey;
  setSort: (value: SortKey) => void;
}) {
  return (
    <div className="mb-4 grid gap-3 rounded-2xl border border-white/10 bg-[#202429]/55 p-3 ring-1 ring-white/5 md:grid-cols-[1fr_12rem_13rem]">
      <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
        🔎 Search
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filter games"
          className="rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm font-medium normal-case tracking-normal text-pastel-cream outline-none placeholder:text-pastel-lavender/35 focus:border-pastel-peach/45 focus:ring-2 focus:ring-pastel-peach/20"
        />
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
        🧩 Genre
        <select
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          className="rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm font-medium normal-case tracking-normal text-pastel-cream outline-none focus:border-pastel-peach/45 focus:ring-2 focus:ring-pastel-peach/20"
        >
          {genres.map((genreOption) => (
            <option key={genreOption}>{genreOption}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase tracking-wider text-pastel-lavender/70">
        ↕️ Sort
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value as SortKey)}
          className="rounded-xl border border-white/10 bg-[#181b1f] px-3 py-2 text-sm font-medium normal-case tracking-normal text-pastel-cream outline-none focus:border-pastel-peach/45 focus:ring-2 focus:ring-pastel-peach/20"
        >
          <option value="recommended">Recommended</option>
          <option value="name">Name A-Z</option>
          <option value="playtime-desc">Most played</option>
          <option value="playtime-asc">Least played</option>
          <option value="hours">Shortest to beat</option>
        </select>
      </label>
    </div>
  );
}

function GameTable({ games }: { games: GameRow[] }) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#202429]/55 p-6 text-sm text-pastel-lavender/70">
        No games in this group yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#202429]/65 ring-1 ring-white/5">
      <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr] gap-3 border-b border-white/10 px-4 py-3 text-xs font-bold uppercase text-pastel-lavender/70">
        <span>🎮 Game</span>
        <span>🧩 Genre</span>
        <span className="text-right">⏱️ Hours</span>
        <span className="text-right">🏆 Achv.</span>
      </div>
      {games.map((game) => (
        <div
          key={game.appid}
          className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr] items-center gap-3 border-b border-white/5 px-4 py-3 text-sm last:border-b-0"
        >
          <GameIdentity game={game} />
          <span className="text-pastel-lavender/70">{game.genre}</span>
          <span className="text-right tabular-nums text-pastel-cream/85">
            {game.hoursToBeat}h
          </span>
          <span className="text-right tabular-nums text-pastel-mint">
            {game.achievementPercent}%
          </span>
        </div>
      ))}
    </div>
  );
}

function StartedList({ games }: { games: GameRow[] }) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#202429]/55 p-6 text-sm text-pastel-lavender/70">
        No started games found.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {games.map((game) => (
        <div
          key={game.appid}
          className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#202429]/65 p-4 ring-1 ring-white/5"
        >
          <GameIdentity game={game} />
          <span className="shrink-0 tabular-nums text-pastel-sky">
            {game.playtimeHours} hrs
          </span>
        </div>
      ))}
    </div>
  );
}

function CompletedTable({ games }: { games: GameRow[] }) {
  if (games.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-[#202429]/55 p-6 text-sm text-pastel-lavender/70">
        No completed games found by the 20+ hour heuristic.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {games.map((game) => (
        <div
          key={game.appid}
          className="rounded-2xl border border-white/10 bg-[#202429]/65 p-4 ring-1 ring-white/5"
        >
          <div className="flex items-center justify-between gap-4">
            <GameIdentity game={game} />
            <span className="shrink-0 tabular-nums text-pastel-mint">
              {game.achievementPercent}%
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-pastel-mint"
              style={{ width: `${game.achievementPercent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BacklogTabs({
  overview,
  unplayedGames,
  startedGames,
  completedGames,
}: BacklogTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState<SortKey>("recommended");
  const activeGames =
    activeTab === "Completed"
      ? completedGames
      : activeTab === "Started"
        ? startedGames
        : unplayedGames;
  const genreOptions = useMemo(
    () => ["All", ...Array.from(new Set(activeGames.map((game) => game.genre))).sort()],
    [activeGames]
  );
  const visibleGames = useMemo(
    () =>
      filterAndSortGames({
        games: activeGames,
        query,
        genre,
        sort,
      }),
    [activeGames, genre, query, sort]
  );
  const shownGames = visibleGames.slice(0, 60);

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${
              activeTab === tab
                ? "border-pastel-peach/45 bg-pastel-peach/20 text-pastel-cream"
                : "border-white/10 bg-white/5 text-pastel-lavender/70 hover:border-pastel-sky/30 hover:text-pastel-sky"
            }`}
          >
            {tab === "Overview" && "📊 Overview"}
            {tab === "Unplayed" && "🌙 Unplayed"}
            {tab === "Started" && "🚧 Started"}
            {tab === "Completed" && "🏆 Completed"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "Overview" && overview}
        {activeTab !== "Overview" && (
          <>
            <GameControls
              genres={genreOptions}
              query={query}
              setQuery={setQuery}
              genre={genre}
              setGenre={setGenre}
              sort={sort}
              setSort={setSort}
            />
            <p className="mb-3 text-sm text-pastel-lavender/65">
              Showing {shownGames.length} of {visibleGames.length} matching games
            </p>
          </>
        )}
        {activeTab === "Unplayed" && <GameTable games={shownGames} />}
        {activeTab === "Started" && <StartedList games={shownGames} />}
        {activeTab === "Completed" && <CompletedTable games={shownGames} />}
      </div>
    </section>
  );
}
