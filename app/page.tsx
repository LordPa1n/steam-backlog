"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import steamOracleLogo from "@/steam_oracle_logo.png";

type SteamProfile = {
  username: string;
  avatar: string;
  profile: string;
  steamId: string;
  country: string;
  visibility: number | null;
  created: number | null;
  level: number | null;
  gamesOwned: number | null;
};

function parseSteamInput(input: string) {
  const value = input.trim();

  if (/^\d{17}$/.test(value)) {
    return {
      type: "steamid64",
      value,
    };
  }

  const customMatch = value.match(/steamcommunity\.com\/id\/([^/]+)/i);

  if (customMatch) {
    return {
      type: "custom",
      value: customMatch[1],
    };
  }

  const profileMatch = value.match(
    /steamcommunity\.com\/profiles\/(\d{17})/i
  );

  if (profileMatch) {
    return {
      type: "steamid64",
      value: profileMatch[1],
    };
  }

  return {
    type: "custom",
    value,
  };
}

function getVisibilityText(visibility: number | null) {
  switch (visibility) {
    case 1:
      return "Private";
    case 3:
      return "Public";
    default:
      return "Unknown";
  }
}

function countryCodeToFlag(code: string) {
  if (!code) return "";

  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return "Unknown";

  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getAccountAge(timestamp: number | null) {
  if (!timestamp) return "Unknown";

  const created = new Date(timestamp * 1000);
  const now = new Date();
  let years = now.getFullYear() - created.getFullYear();
  let months = now.getMonth() - created.getMonth();

  if (now.getDate() < created.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) return "New account";
  if (years <= 0) return `${months}mo`;
  if (months <= 0) return `${years}y`;

  return `${years}y\u00A0${months}mo`;
}

function formatNumber(value: number | null) {
  if (value === null) return "Private";

  return new Intl.NumberFormat().format(value);
}

const cardSurface =
  "rounded-3xl border border-white/10 bg-[#181b1f]/80 shadow-2xl shadow-black/25 ring-1 ring-pastel-sky/10 backdrop-blur-xl";

const statCardSurface =
  "rounded-2xl border border-white/10 bg-gradient-to-br from-[#24282d]/90 to-[#181b1f]/90 p-4 shadow-lg shadow-black/15 ring-1 ring-white/5 transition hover:border-pastel-peach/30 hover:shadow-pastel-peach/10";

const detailCardSurface =
  "rounded-2xl border border-white/10 bg-[#202429]/65 p-4 ring-1 ring-white/5";

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CopySteamIdButton({ steamId }: { steamId: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(steamId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Steam ID copied" : "Copy Steam ID to clipboard"}
      title={copied ? "Copied!" : "Copy to clipboard"}
      className="inline-flex shrink-0 items-center justify-center rounded-xl border border-pastel-sky/25 bg-pastel-sky/10 p-2 text-pastel-sky transition hover:border-pastel-mint/40 hover:bg-pastel-mint/15 hover:text-pastel-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pastel-peach/40"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}

function ResultSkeleton() {
  return (
    <section className={`h-full p-6 sm:p-8 ${cardSurface}`}>
      <div className="animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl bg-pastel-lavender/10" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-2/3 rounded-full bg-pastel-lavender/10" />
            <div className="h-4 w-1/2 rounded-full bg-pastel-lavender/10" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className={`${statCardSurface}`}>
              <div className="h-4 w-20 rounded-full bg-pastel-lavender/10" />
              <div className="mt-3 h-7 w-16 rounded-full bg-pastel-lavender/10" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-[#202429]/45 p-4"
            >
              <div className="h-4 w-28 rounded-full bg-pastel-lavender/10" />
              <div className="mt-3 h-4 w-40 rounded-full bg-pastel-lavender/10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyResults() {
  return (
    <section
      className={`flex h-full min-h-[26rem] items-center justify-center border-dashed border-pastel-lavender/25 p-8 text-center ${cardSurface}`}
    >
      <div>
        <p className="text-3xl">🔮</p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-pastel-peach">
          Ready
        </p>
        <h2 className="mt-3 text-2xl font-bold text-pastel-cream">
          Profile results appear here
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-pastel-lavender/70">
          Search a Steam profile to see account age, level, game count, identity,
          region, and visibility without losing the form above the fold.
        </p>
      </div>
    </section>
  );
}

function ProfileResults({ profile }: { profile: SteamProfile }) {
  const flag = countryCodeToFlag(profile.country);
  const visibilityText = getVisibilityText(profile.visibility);
  const visibilityEmoji =
    profile.visibility === 3 ? "🌐" : profile.visibility === 1 ? "🔒" : "❓";

  return (
    <section className={`h-full p-6 sm:p-8 ${cardSurface}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {profile.avatar && (
          <Image
            src={profile.avatar}
            alt={`${profile.username}'s avatar`}
            width={96}
            height={96}
            className="h-24 w-24 rounded-2xl border border-pastel-peach/25 object-cover shadow-lg shadow-pastel-peach/10 ring-2 ring-pastel-peach/20"
          />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-wider text-pastel-peach">
            👤 Steam Profile
          </p>
          <h2 className="mt-2 truncate text-3xl font-black text-pastel-cream">
            {profile.username}
          </h2>
          <a
            href={profile.profile}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-pastel-peach/30 bg-gradient-to-r from-pastel-peach/25 to-pastel-rose/20 px-4 py-2.5 text-sm font-semibold text-pastel-cream shadow-md shadow-pastel-peach/10 transition hover:border-pastel-peach/50 hover:from-pastel-peach/35 hover:to-pastel-rose/30 hover:shadow-pastel-peach/20"
          >
            View Steam Profile
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={statCardSurface}>
          <p className="text-xs font-semibold uppercase tracking-wider text-pastel-lavender/80">
            🎂 Age
          </p>
          <p className="mt-2 whitespace-nowrap text-xl font-black tabular-nums text-pastel-cream sm:text-2xl">
            {getAccountAge(profile.created)}
          </p>
        </div>
        <div className={statCardSurface}>
          <p className="text-xs font-semibold uppercase tracking-wider text-pastel-lavender/80">
            ⭐ Level
          </p>
          <p className="mt-2 text-xl font-black tabular-nums text-pastel-cream sm:text-2xl">
            {formatNumber(profile.level)}
          </p>
        </div>
        <div className={statCardSurface}>
          <p className="text-xs font-semibold uppercase tracking-wider text-pastel-lavender/80">
            🎮 Games
          </p>
          <p className="mt-2 text-xl font-black tabular-nums text-pastel-cream sm:text-2xl">
            {formatNumber(profile.gamesOwned)}
          </p>
        </div>
        <div className={statCardSurface}>
          <p className="text-xs font-semibold uppercase tracking-wider text-pastel-lavender/80">
            {visibilityEmoji} Visibility
          </p>
          <p className="mt-2 text-xl font-black text-pastel-cream sm:text-2xl">
            {visibilityText}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
        <div className={detailCardSurface}>
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-pastel-lavender/80">🔑 Steam ID</p>
            <CopySteamIdButton steamId={profile.steamId} />
          </div>
          <p className="mt-2 break-all font-mono text-sm text-pastel-cream/90">
            {profile.steamId}
          </p>
        </div>
        <div className={detailCardSurface}>
          <p className="font-semibold text-pastel-lavender/80">📅 Member Since</p>
          <p className="mt-2 text-pastel-cream/90">{formatDate(profile.created)}</p>
        </div>
        <div className={detailCardSurface}>
          <p className="font-semibold text-pastel-lavender/80">🌍 Country</p>
          <p className="mt-2 text-pastel-cream/90">
            {profile.country ? `${flag} ${profile.country}` : "Unknown"}
          </p>
        </div>
        <div className={detailCardSurface}>
          <p className="font-semibold text-pastel-lavender/80">📚 Owned Games</p>
          <p className="mt-2 text-pastel-cream/90">
            {profile.gamesOwned === null
              ? "Private or unavailable"
              : `${formatNumber(profile.gamesOwned)} games`}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [steamId, setSteamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<SteamProfile | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!steamId.trim()) return;

    setLoading(true);
    setError("");

    try {
      const parsedInput = parseSteamInput(steamId);
      const response = await fetch(
        `/api/steam?steamId=${encodeURIComponent(parsedInput.value)}`
      );
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setProfile(null);
        return;
      }

      setProfile({
        username: data.username || "",
        avatar: data.avatar || "",
        profile: data.profile || "",
        steamId: data.steamId || "",
        country: data.country || "",
        visibility: data.visibility ?? null,
        created: data.created ?? null,
        level: data.level ?? null,
        gamesOwned: data.gamesOwned ?? null,
      });
    } catch (error) {
      console.error(error);
      setError("Failed to fetch Steam profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#31373d_0%,#24282d_35%,#181b1f_70%,#111315_100%)] px-4 py-8 text-pastel-cream sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex justify-center sm:mb-10">
          <Image
            src={steamOracleLogo}
            alt="Steam Oracle"
            priority
            className="h-auto w-72 sm:w-80 md:w-96 lg:w-[22rem]"
          />
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <section
            className={`p-6 sm:p-8 lg:sticky lg:top-8 lg:self-start ${cardSurface}`}
          >
            <h1 className="text-3xl font-black tracking-tight text-pastel-cream sm:text-4xl">
              Know your Steam profile at a glance
            </h1>
            <p className="mt-4 text-base leading-7 text-pastel-lavender/75">
              Discover your gaming identity, account history, Steam level,
              library size, and profile visibility.
            </p>

            <form onSubmit={handleSubmit} className="mt-8">
              <label
                htmlFor="steam-id"
                className="text-sm font-semibold text-pastel-lavender/90"
              >
                🔍 Steam URL, SteamID64, or username
              </label>
              <input
                id="steam-id"
                type="text"
                placeholder="steamcommunity.com/id/example"
                value={steamId}
                onChange={(event) => setSteamId(event.target.value)}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-[#202429]/80 p-4 text-base text-pastel-cream shadow-inner shadow-black/10 outline-none transition placeholder:text-pastel-lavender/35 focus:border-pastel-peach/45 focus:ring-2 focus:ring-pastel-peach/20"
              />

              <div className="mt-4 rounded-2xl border border-white/10 bg-[#202429]/55 p-4 text-sm text-pastel-lavender/60 ring-1 ring-white/5">
                <p className="font-semibold text-pastel-lavender/90">
                  📋 Supported formats
                </p>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                  <li>Steam Custom URL</li>
                  <li>SteamID64 URL</li>
                  <li>Steam Username</li>
                  <li>SteamID64</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading || !steamId.trim()}
                className="mt-5 w-full rounded-2xl border border-pastel-peach/35 bg-gradient-to-r from-pastel-peach/80 to-pastel-sky/75 p-4 text-base font-bold text-[#181b1f] shadow-lg shadow-pastel-peach/15 transition hover:from-pastel-peach hover:to-pastel-sky disabled:cursor-not-allowed disabled:border-transparent disabled:from-[#24282d] disabled:to-[#24282d] disabled:text-pastel-lavender/40 disabled:shadow-none"
              >
                {loading ? "Fetching Steam Data..." : "✨ Analyze Profile"}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-2xl border border-pastel-rose/35 bg-pastel-rose/10 p-4 text-sm text-pastel-rose ring-1 ring-pastel-rose/20">
                ⚠️ {error}
              </div>
            )}
          </section>

          {loading ? (
            <ResultSkeleton />
          ) : profile ? (
            <ProfileResults profile={profile} />
          ) : (
            <EmptyResults />
          )}
        </div>
      </div>
    </main>
  );
}
