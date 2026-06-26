import GameCard from "@/app/components/GameCard";
import MetricCard from "@/app/components/MetricCard";
import SectionHeader from "@/app/components/SectionHeader";
import type { GameRow, SteamProfileSummary } from "@/lib/steam";

function getBreakdownCounts<T extends string>(values: T[]) {
  return Array.from(values.reduce((map, value) => {
    map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  }, new Map<T, number>())).sort((a, b) => b[1] - a[1]);
}

export default function BacklogAnalytics({
  profile,
  games,
}: {
  profile: SteamProfileSummary;
  games: GameRow[];
}) {
  const completedGames = games
    .filter((game) => game.playtimeHours >= 20)
    .sort((a, b) => a.lastPlayedDaysAgo - b.lastPlayedDaysAgo)
    .slice(0, 4);
  const currentlyPlaying = games
    .filter((game) => game.playtimeHours > 0 && game.playtimeHours < 20)
    .sort((a, b) => b.playtimeHours - a.playtimeHours)
    .slice(0, 3);
  const recommendedGames = [...games]
    .filter((game) => game.playtimeHours < 10)
    .sort((a, b) => b.reviewPercent - a.reviewPercent)
    .slice(0, 3);
  const achievementShowcase = [...games]
    .sort((a, b) => b.achievementPercent - a.achievementPercent)
    .slice(0, 3);

  const genres = getBreakdownCounts(games.map((game) => game.genre));
  const playstyles = getBreakdownCounts(games.flatMap((game) => game.categories));
  const deckFriendlyCount = games.filter((game) => game.deckVerified).length;
  const a11yCount = games.filter((game) => game.controllerSupport).length;
  const totalGames = profile.gamesOwned ?? games.length;
  const deckProgress = totalGames > 0 ? Math.round((deckFriendlyCount / totalGames) * 100) : 0;
  const controllerProgress = totalGames > 0 ? Math.round((a11yCount / totalGames) * 100) : 0;
  const averageAchievement = games.length
    ? Math.round(
        games.reduce((sum, game) => sum + game.achievementPercent, 0) / games.length
      )
    : 0;
  const averagePlaytime = games.length
    ? Math.round(
        games.reduce((sum, game) => sum + game.playtimeHours, 0) / games.length
      )
    : 0;

  return (
    <section className="grid gap-6 rounded-3xl border border-white/10 bg-[#181b1f]/80 p-6 shadow-2xl shadow-black/20 ring-1 ring-pastel-sky/10">
      <SectionHeader
        title="Analytics & recommendations"
        subtitle="A deeper look at your backlog, playstyle tendencies, and the games most likely to become your next favorite."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          value={`${averageAchievement}%`}
          label="Avg Achievement"
          icon="🏆"
          variant="achievement"
          progress={averageAchievement}
          progressLabel="Completion average"
        />
        <MetricCard
          value={`${averagePlaytime} hrs`}
          label="Avg Playtime"
          icon="⏱️"
          variant="playtime"
          progress={Math.min(100, Math.round((averagePlaytime / 80) * 100))}
          progressLabel="Avg playtime vs. 80h"
        />
        <MetricCard
          value={`${deckFriendlyCount}`}
          label="Deck-Friendly"
          icon="🎮"
          variant="deck"
          progress={deckProgress}
          progressLabel={`${deckFriendlyCount}/${totalGames}`}
          accent="Library compatibility"
        />
        <MetricCard
          value={`${a11yCount}`}
          label="Controller Support"
          icon="🕹️"
          variant="controller"
          progress={controllerProgress}
          progressLabel={`${a11yCount}/${totalGames}`}
          accent="Gamepad-ready count"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pastel-peach">
                🔥 Recommended now
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-pastel-lavender/70">
                Based on low playtime & strong reviews
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              {recommendedGames.map((game) => (
                <GameCard
                  key={game.appid}
                  title={game.name}
                  thumbnailUrl={game.thumbnailUrl}
                  hoursPlayed={game.playtimeHours}
                  reviewPercent={game.reviewPercent}
                  reviewCount={game.reviewCount}
                  genres={[game.genre]}
                  categories={game.categories}
                  releaseDate={game.releaseDate}
                  developer={game.developer}
                  publisher={game.publisher}
                  controllerSupport={game.controllerSupport}
                  deckVerified={game.deckVerified}
                  completionPercent={game.completionPercent}
                  lastPlayed={game.lastPlayed}
                  reason="Strong overall sentiment, low completion, and a short, rewarding playthrough."
                />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-6">
            <h3 className="text-lg font-black text-pastel-cream">💡 Currently Playing</h3>
            <p className="mt-2 text-sm leading-6 text-pastel-lavender/70">
              Games you started but haven’t finished yet, ordered by playtime.
            </p>
            <div className="mt-4 grid gap-3">
              {currentlyPlaying.length === 0 ? (
                <p className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-pastel-lavender/70">
                  No currently playing games found.
                </p>
              ) : (
                currentlyPlaying.map((game) => (
                  <div
                    key={game.appid}
                    className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4"
                  >
                    <p className="font-semibold text-pastel-cream">{game.name}</p>
                    <p className="mt-2 text-sm text-pastel-lavender/70">
                      {game.playtimeHours} hrs played • {game.genre}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-6">
            <h3 className="text-lg font-black text-pastel-cream">🏅 Achievement Showcase</h3>
            <p className="mt-2 text-sm leading-6 text-pastel-lavender/70">
              Top games where you’ve made the most progress toward completion.
            </p>
            <div className="mt-4 grid gap-3">
              {achievementShowcase.map((game) => (
                <div
                  key={game.appid}
                  className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4"
                >
                  <p className="font-semibold text-pastel-cream">{game.name}</p>
                  <p className="mt-1 text-sm text-pastel-lavender/70">
                    {game.achievementPercent}% complete • {game.playtimeHours} hrs
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-6">
            <h3 className="text-lg font-black text-pastel-cream">📊 Genre & Playstyle</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pastel-peach">
                  Top genres
                </p>
                <div className="mt-3 grid gap-2">
                  {genres.slice(0, 4).map(([genre, count]) => (
                    <div
                      key={genre}
                      className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#181e26]/80 px-4 py-3 text-sm text-pastel-lavender/70"
                    >
                      <span>{genre}</span>
                      <span className="font-semibold text-pastel-cream">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pastel-peach">
                  Favorite playstyles
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {playstyles.slice(0, 8).map(([playstyle, count]) => (
                    <span
                      key={playstyle}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-pastel-lavender/80"
                    >
                      {playstyle} • {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-6">
          <h3 className="text-lg font-black text-pastel-cream">⏱️ Recent completions</h3>
          <p className="mt-2 text-sm leading-6 text-pastel-lavender/70">
            Recent backlog wins based on the most recently played completed games.
          </p>
          <div className="mt-4 grid gap-3">
            {completedGames.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-pastel-lavender/70">
                No completed backlog entries yet.
              </div>
            ) : (
              completedGames.map((game) => (
                <div
                  key={game.appid}
                  className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4"
                >
                  <p className="font-semibold text-pastel-cream">{game.name}</p>
                  <p className="mt-1 text-sm text-pastel-lavender/70">
                    Completed {game.lastPlayed} ago • {game.genre}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-6">
          <h3 className="text-lg font-black text-pastel-cream">🎯 Playstyle summary</h3>
          <div className="mt-6 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4">
              <p className="text-sm text-pastel-lavender/70">Library size</p>
              <p className="mt-2 text-2xl font-black text-pastel-cream">{profile.gamesOwned ?? "Private"}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4">
              <p className="text-sm text-pastel-lavender/70">Deck friendly games</p>
              <p className="mt-2 text-2xl font-black text-pastel-cream">{deckFriendlyCount}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#181e26]/80 p-4">
              <p className="text-sm text-pastel-lavender/70">Controller supported</p>
              <p className="mt-2 text-2xl font-black text-pastel-cream">{a11yCount}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
