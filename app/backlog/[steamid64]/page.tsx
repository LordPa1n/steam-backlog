import Link from "next/link";
import { notFound } from "next/navigation";
import BacklogTabs from "./BacklogTabs";
import PlayNextSection from "./PlayNext";
import RandomGameSelector from "./RandomGameSelector";
import ProfileBanner from "./ProfileBanner";
import BacklogAnalytics from "./BacklogAnalytics";
import {
  getBacklog,
  getSteamProfile,
  type GameRow,
  type SteamProfileSummary,
} from "@/lib/steam";

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
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

export default async function BacklogPage({
  params,
}: {
  params: Promise<{ steamid64: string }>;
}) {
  const { steamid64 } = await params;

  if (!/^\d{17}$/.test(steamid64)) {
    notFound();
  }

  const [profileResult, backlogResult] = await Promise.allSettled([
    getSteamProfile(steamid64),
    getBacklog(steamid64),
  ]);

  let profile: SteamProfileSummary | null = null;
  let profileError = "";

  if (profileResult.status === "fulfilled") {
    profile = profileResult.value;
  } else {
    profileError =
      profileResult.reason instanceof Error
        ? profileResult.reason.message
        : String(profileResult.reason ?? "Unable to fetch Steam profile.");
  }

  const backlogData =
    backlogResult.status === "fulfilled"
      ? backlogResult.value
      : {
          error:
            backlogResult.reason instanceof Error
              ? backlogResult.reason.message
              : String(backlogResult.reason ?? "Unable to fetch backlog."),
          games: [] as GameRow[],
          owned: 0,
        };

  const errorMessage = profileError || backlogData.error;
  const isPrivateProfile = profile?.visibility !== 3;

  const games = backlogData.games;
  const owned = backlogData.owned;
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
        <PlayNextSection games={playNextGames} />
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

        {profile ? <ProfileBanner profile={profile} /> : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-pastel-rose/35 bg-pastel-rose/10 p-4 text-sm text-pastel-rose ring-1 ring-pastel-rose/20">
            ⚠️ {errorMessage}
          </div>
        ) : null}

        {profile && isPrivateProfile ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-[#202429]/75 p-8 shadow-2xl shadow-black/20 ring-1 ring-white/5">
            <p className="text-xl font-black text-pastel-cream">Profile visibility blocked</p>
            <p className="mt-3 text-sm leading-7 text-pastel-lavender/75">
              Backlog analysis is unavailable because this Steam profile is not publicly visible. Make the profile public or share a SteamID64 with visible game details to unlock analytics.
            </p>
          </div>
        ) : (
          profile && (
            <>
              <section className="mt-8 mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard value={formatNumber(owned)} label="🎲 Owned" />
                <StatCard value={formatNumber(unplayed)} label="🌙 Unplayed" />
                <StatCard value={formatNumber(started)} label="🚧 Started" />
                <StatCard value={formatNumber(finished)} label="🏆 Finished" />
              </section>

              <BacklogAnalytics profile={profile} games={games} />

              <div className="mt-8">
                <BacklogTabs
                  overview={overview}
                  unplayedGames={unplayedGames}
                  startedGames={startedGames}
                  completedGames={completedGames}
                />
              </div>

              <div className="mt-8">
                <RandomGameSelector games={games} />
              </div>
            </>
          )
        )}
      </div>
    </main>
  );
}
