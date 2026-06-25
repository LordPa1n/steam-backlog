import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import BacklogTabs from "./BacklogTabs";
import SteamOracle from "./SteamOracle";

type OwnedGame = {
  appid: number;
  name?: string;
  playtime_forever?: number;
};

type OwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: OwnedGame[];
  };
};

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

const genres = [
  "Action",
  "Adventure",
  "RPG",
  "Puzzle",
  "Strategy",
  "Shooter",
  "Story",
  "Roguelike",
];

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function gameSeed(appid: number) {
  return Math.abs(Math.sin(appid) * 10000);
}

function enrichGame(game: OwnedGame): GameRow {
  const seed = gameSeed(game.appid);
  const playtimeHours = Math.round(((game.playtime_forever ?? 0) / 60) * 10) / 10;
  const reviewPercent = 65 + (Math.floor(seed * 11) % 36); // 65-100
  const reviewCategory =
    reviewPercent >= 90
      ? "Overwhelmingly Positive"
      : reviewPercent >= 80
      ? "Very Positive"
      : reviewPercent >= 70
      ? "Positive"
      : "Mixed";

  return {
    appid: game.appid,
    name: game.name || `Steam App ${game.appid}`,
    thumbnailUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`,
    genre: genres[Math.floor(seed) % genres.length],
    hoursToBeat: 4 + (Math.floor(seed * 7) % 37),
    playtimeHours,
    achievementPercent: Math.min(
      100,
      Math.max(8, Math.round((playtimeHours / 30) * 100))
    ),
    reviewPercent,
    reviewCategory,
  };
}

type PlayerSummaryResponse = {
  response?: {
    players?: Array<{
      steamid?: string;
      communityvisibilitystate?: number;
    }>;
  };
};

type SteamFetchErrorDetails = {
  status: number;
  message: string;
};

class SteamFetchError extends Error {
  status: number;

  constructor({ status, message }: SteamFetchErrorDetails) {
    super(message);
    this.name = "SteamFetchError";
    this.status = status;
  }
}

async function fetchSteamJson<T>(url: string, fallbackMessage: string) {
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new SteamFetchError({
      status: response.status,
      message: fallbackMessage,
    });
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new SteamFetchError({
      status: 502,
      message: "Steam returned an unreadable response",
    });
  }
}

async function getBacklog(steamid64: string) {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return {
      error: "Steam API key is not configured",
      games: [] as GameRow[],
      owned: 0,
    };
  }

  const playerUrl = new URL(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
  );
  playerUrl.searchParams.set("key", apiKey);
  playerUrl.searchParams.set("steamids", steamid64);

  const gamesUrl = new URL(
    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
  );
  gamesUrl.searchParams.set("key", apiKey);
  gamesUrl.searchParams.set("steamid", steamid64);
  gamesUrl.searchParams.set("include_appinfo", "true");
  gamesUrl.searchParams.set("include_played_free_games", "true");

  try {
    const [playerData, gamesData] = await Promise.all([
      fetchSteamJson<PlayerSummaryResponse>(playerUrl.toString(), "Unable to fetch Steam profile"),
      fetchSteamJson<OwnedGamesResponse>(gamesUrl.toString(), "Unable to fetch owned games from Steam"),
    ]);

    const player = playerData.response?.players?.[0];

    if (!player) {
      return {
        error: "Player not found",
        games: [] as GameRow[],
        owned: 0,
      };
    }

    if (player.communityvisibilitystate !== 3) {
      return {
        error: "Backlog analysis requires a public Steam profile. This account is not visible.",
        games: [] as GameRow[],
        owned: 0,
      };
    }

    if (gamesData.response?.game_count == null) {
      return {
        error: "Game library is private or unavailable. Backlog analysis requires visible owned games.",
        games: [] as GameRow[],
        owned: 0,
      };
    }

    const games = (gamesData.response.games ?? []).map(enrichGame);

    return {
      error: "",
      games,
      owned: gamesData.response.game_count,
    };
  } catch (error) {
    console.error(error);

    if (error instanceof SteamFetchError) {
      return {
        error: error.message,
        games: [] as GameRow[],
        owned: 0,
      };
    }

    return {
      error: "Failed to analyze backlog",
      games: [] as GameRow[],
      owned: 0,
    };
  }
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#202429]/75 p-6 shadow-xl shadow-black/15 ring-1 ring-white/5">
      <p className="text-4xl font-black tabular-nums text-pastel-cream">
        {value}
      </p>
      <p className="mt-2 text-sm font-bold uppercase tracking-wider text-pastel-lavender/70">
        {label}
      </p>
    </div>
  );
}

function CompletionScore({ score }: { score: number }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#181b1f]/80 p-6 shadow-2xl shadow-black/20 ring-1 ring-pastel-sky/10">
      <p className="text-sm font-bold uppercase tracking-wider text-pastel-peach">
        📈 Completion Score
      </p>
      <h2 className="mt-2 text-2xl font-black text-pastel-cream">
        🏁 Backlog Completion
      </h2>
      <div className="mt-6 h-4 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pastel-mint to-pastel-sky"
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="mt-5 text-5xl font-black tabular-nums text-pastel-mint">
        {score}%
      </p>
    </section>
  );
}

function PlaytimeDonut({
  buckets,
}: {
  buckets: Array<{ label: string; value: number; color: string }>;
}) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);
  let cursor = 0;
  const gradient =
    total === 0
      ? "#2f343a 0 100%"
      : buckets
          .map((bucket) => {
            const start = cursor;
            cursor += (bucket.value / total) * 100;
            return `${bucket.color} ${start}% ${cursor}%`;
          })
          .join(", ");

  return (
    <section className="rounded-3xl border border-white/10 bg-[#181b1f]/80 p-6 shadow-2xl shadow-black/20 ring-1 ring-pastel-sky/10">
      <h2 className="text-2xl font-black text-pastel-cream">
        🍩 Playtime Breakdown
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-[13rem_1fr] sm:items-center">
        <div
          className="mx-auto grid h-52 w-52 place-items-center rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="grid h-32 w-32 place-items-center rounded-full bg-[#181b1f] text-center">
            <span className="text-sm font-bold text-pastel-lavender/75">
              {formatNumber(total)}
              <br />
              games
            </span>
          </div>
        </div>
        <div className="grid gap-3">
          {buckets.map((bucket) => (
            <div
              key={bucket.label}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-pastel-lavender/80">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: bucket.color }}
                />
                {bucket.label}
              </span>
              <span className="font-black tabular-nums text-pastel-cream">
                {bucket.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlayNext({ games }: { games: GameRow[] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#181b1f]/80 p-6 shadow-2xl shadow-black/20 ring-1 ring-pastel-sky/10">
      <p className="text-sm font-bold uppercase tracking-wider text-pastel-peach">
        🎮 Games You Should Play Next
      </p>
      <h2 className="mt-2 text-2xl font-black text-pastel-cream">
        🎯 Play Next
      </h2>
      <ol className="mt-6 grid gap-3">
        {games.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-pastel-lavender/70">
            No recommendations available yet.
          </li>
        ) : (
          games.map((game, index) => (
            <li
              key={game.appid}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#202429]/65 p-4"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-pastel-peach/20 text-sm font-black text-pastel-peach">
                {index + 1}
              </span>
              <Image
                src={game.thumbnailUrl}
                alt=""
                width={184}
                height={69}
                className="h-12 w-24 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
              />
              <span className="min-w-0 truncate font-bold text-pastel-cream">
                {game.name}
              </span>
            </li>
          ))
        )}
      </ol>
    </section>
  );
}

export default async function BacklogPage({
  params,
}: {
  params: Promise<{ steamid64: string }>;
}) {
  const { steamid64 } = await params;

  if (!/^\d{17}$/.test(steamid64)) {
    notFound();
  }

  const { error, games, owned } = await getBacklog(steamid64);
  const unplayedGames = games.filter((game) => game.playtimeHours === 0);
  const startedGames = games
    .filter((game) => game.playtimeHours > 0 && game.playtimeHours < 20)
    .sort((a, b) => b.playtimeHours - a.playtimeHours);
  const completedGames = games
    .filter((game) => game.playtimeHours >= 20)
    .sort((a, b) => b.playtimeHours - a.playtimeHours);

  const unplayed = unplayedGames.length;
  const started = startedGames.length;
  const finished = completedGames.length;
  const completionScore = owned > 0 ? Math.round((finished / owned) * 100) : 0;
  const playNextGames = [...unplayedGames, ...startedGames]
    .sort((a, b) => a.hoursToBeat - b.hoursToBeat)
    .slice(0, 5);

  const buckets = [
    {
      label: "Never Played",
      value: unplayed,
      color: "#ffc9a8",
    },
    {
      label: "0-5 hrs",
      value: games.filter(
        (game) => game.playtimeHours > 0 && game.playtimeHours <= 5
      ).length,
      color: "#b8e4ff",
    },
    {
      label: "5-20 hrs",
      value: games.filter(
        (game) => game.playtimeHours > 5 && game.playtimeHours < 20
      ).length,
      color: "#b8f0dc",
    },
    {
      label: "20+ hrs",
      value: finished,
      color: "#ffc8dd",
    },
  ];

  const overview = (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <CompletionScore score={completionScore} />
      <PlaytimeDonut buckets={buckets} />
      <div className="lg:col-span-2">
        <PlayNext games={playNextGames} />
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#31373d_0%,#24282d_35%,#181b1f_70%,#111315_100%)] px-4 py-8 text-pastel-cream sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-pastel-lavender/75 transition hover:border-pastel-sky/30 hover:text-pastel-sky"
        >
          Back to profile search
        </Link>

        <header className="mt-8">
          <p className="text-sm font-bold uppercase tracking-wider text-pastel-peach">
            🧭 Backlog Dashboard
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-pastel-cream sm:text-5xl">
            Steam backlog analysis
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-pastel-lavender/75">
            A playtime-based snapshot for SteamID64 {steamid64}.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-2xl border border-pastel-rose/35 bg-pastel-rose/10 p-4 text-sm text-pastel-rose ring-1 ring-pastel-rose/20">
            ⚠️ {error}
          </div>
        )}

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard value={formatNumber(owned)} label="🎲 Owned" />
          <StatCard value={formatNumber(unplayed)} label="🌙 Unplayed" />
          <StatCard value={formatNumber(started)} label="🚧 Started" />
          <StatCard value={formatNumber(finished)} label="🏆 Finished" />
        </section>

        <div className="mt-6">
          <SteamOracle games={games} />
        </div>

        <BacklogTabs
          overview={overview}
          unplayedGames={unplayedGames}
          startedGames={startedGames}
          completedGames={completedGames}
        />
      </div>
    </main>
  );
}
