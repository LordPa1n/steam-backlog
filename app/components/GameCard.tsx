import Image from "next/image";

export default function GameCard({
  title,
  thumbnailUrl,
  hoursPlayed,
  reviewPercent,
  reviewCount,
  genres,
  categories,
  releaseDate,
  developer,
  publisher,
  controllerSupport,
  deckVerified,
  completionPercent,
  lastPlayed,
  reason,
}: {
  title: string;
  thumbnailUrl: string;
  hoursPlayed: number;
  reviewPercent: number;
  reviewCount: number;
  genres: string[];
  categories: string[];
  releaseDate: string;
  developer: string;
  publisher: string;
  controllerSupport: boolean;
  deckVerified: boolean;
  completionPercent: number;
  lastPlayed: string;
  reason?: string;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-[#202429]/90 p-4 shadow-xl shadow-black/15 ring-1 ring-white/5 transition hover:-translate-y-1 hover:border-pastel-sky/30">
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <Image
          src={thumbnailUrl}
          alt={title}
          width={160}
          height={90}
          className="h-24 w-full rounded-3xl object-cover"
        />
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-pastel-cream">{title}</h3>
              <p className="mt-2 text-sm text-pastel-lavender/70">{releaseDate} • {developer}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-pastel-mint">
              {reviewPercent}%
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/5 p-3 text-sm text-pastel-lavender/70">
              <p>⌛ {hoursPlayed} hrs</p>
              <p>🛡️ {completionPercent}% complete</p>
            </div>
            <div className="rounded-3xl bg-white/5 p-3 text-sm text-pastel-lavender/70">
              <p>🎯 {categories.join(", ")}</p>
              <p>🎮 {controllerSupport ? "Controller" : "Keyboard"} • {deckVerified ? "Deck Verified" : "Deck Unverified"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-pastel-lavender/70">
            {genres.map((genre) => (
              <span key={genre} className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                {genre}
              </span>
            ))}
          </div>

          {reason ? (
            <div className="rounded-3xl border border-white/10 bg-[#171d24]/85 p-3 text-sm text-pastel-lavender/70">
              <p className="font-semibold text-pastel-cream">Why this game?</p>
              <p className="mt-2">{reason}</p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
