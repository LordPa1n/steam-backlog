"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

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
const ITEMS_PER_PAGE = 10;

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

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pageItems: Array<number | "ellipsis"> = [];
  const createRange = (start: number, end: number) => {
    for (let i = start; i <= end; i += 1) {
      pageItems.push(i);
    }
  };

  pageItems.push(1);

  if (currentPage > 4) {
    pageItems.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  createRange(start, end);

  if (currentPage < totalPages - 3) {
    pageItems.push("ellipsis");
  }

  if (totalPages > 1) {
    pageItems.push(totalPages);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-6 mb-4">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-pastel-cream transition hover:bg-white/10 ${
          currentPage === 1
            ? "cursor-not-allowed opacity-40"
            : "hover:border-pastel-sky/30"
        }`}
        aria-label="Previous page"
      >
        ←
      </button>

      {pageItems.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="inline-flex h-9 items-center justify-center rounded-lg px-2 text-sm text-pastel-lavender/60"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
              item === currentPage
                ? "bg-pastel-peach text-[#181b1f]"
                : "border-white/10 bg-white/5 text-pastel-cream hover:border-pastel-sky/30 hover:bg-white/10"
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-pastel-cream transition hover:bg-white/10 ${
          currentPage === totalPages
            ? "cursor-not-allowed opacity-40"
            : "hover:border-pastel-sky/30"
        }`}
        aria-label="Next page"
      >
        →
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl bg-white/5 p-4"
        >
          <div className="h-12 w-12 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/5 rounded bg-white/10" />
            <div className="h-3 w-2/5 rounded bg-white/8" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-white/10" />
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const gameListRef = useRef<HTMLDivElement>(null);

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

  const totalPages = Math.max(1, Math.ceil(visibleGames.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = currentPage * ITEMS_PER_PAGE;
  const shownGames = visibleGames.slice(pageStart, pageEnd);

  useEffect(() => {
    setCurrentPage(1);
    setIsPageLoading(false);
  }, [activeTab, genre, query, sort]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setIsPageLoading(true);
    setCurrentPage(page);
    window.setTimeout(() => setIsPageLoading(false), 300);

    if (gameListRef.current) {
      gameListRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const visibleStart = visibleGames.length === 0 ? 0 : pageStart + 1;
  const visibleEnd = visibleGames.length === 0 ? 0 : pageStart + shownGames.length;

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
              Showing {visibleStart}–{visibleEnd} of {visibleGames.length} matching games
            </p>
          </>
        )}
        {activeTab === "Unplayed" &&
          (isPageLoading ? (
            <div ref={gameListRef}>
              <LoadingSkeleton />
            </div>
          ) : (
            <div ref={gameListRef}>
              <GameTable games={shownGames} />
            </div>
          ))}
        {activeTab === "Started" &&
          (isPageLoading ? (
            <div ref={gameListRef}>
              <LoadingSkeleton />
            </div>
          ) : (
            <div ref={gameListRef}>
              <StartedList games={shownGames} />
            </div>
          ))}
        {activeTab === "Completed" &&
          (isPageLoading ? (
            <div ref={gameListRef}>
              <LoadingSkeleton />
            </div>
          ) : (
            <div ref={gameListRef}>
              <CompletedTable games={shownGames} />
            </div>
          ))}
        {activeTab !== "Overview" && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
}
