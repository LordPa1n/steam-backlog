"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";

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
  if (years <= 0) return `${months} mo`;
  if (months <= 0) return `${years} yr`;

  return `${years} yr ${months} mo`;
}

function formatNumber(value: number | null) {
  if (value === null) return "Private";

  return new Intl.NumberFormat().format(value);
}

function ResultSkeleton() {
  return (
    <section className="h-full rounded-lg border border-zinc-800 bg-zinc-950/70 p-6 shadow-2xl shadow-black/30">
      <div className="animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-lg bg-zinc-800" />
          <div className="min-w-0 flex-1 space-y-3">
            <div className="h-6 w-2/3 rounded bg-zinc-800" />
            <div className="h-4 w-1/2 rounded bg-zinc-800" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-lg border border-zinc-800 p-4">
              <div className="h-4 w-20 rounded bg-zinc-800" />
              <div className="mt-3 h-7 w-16 rounded bg-zinc-800" />
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between gap-4">
              <div className="h-4 w-28 rounded bg-zinc-800" />
              <div className="h-4 w-40 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyResults() {
  return (
    <section className="flex h-full min-h-[26rem] items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950/50 p-8 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
          Ready
        </p>
        <h2 className="mt-3 text-2xl font-bold text-white">
          Profile results appear here
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
          Search a Steam profile to see account age, level, game count, identity,
          region, and visibility without losing the form above the fold.
        </p>
      </div>
    </section>
  );
}

function ProfileResults({ profile }: { profile: SteamProfile }) {
  const flag = countryCodeToFlag(profile.country);

  return (
    <section className="h-full rounded-lg border border-zinc-800 bg-zinc-950/75 p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        {profile.avatar && (
          <Image
            src={profile.avatar}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 rounded-lg border border-zinc-700 object-cover"
          />
        )}

        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
            Steam Profile
          </p>
          <h2 className="mt-2 truncate text-3xl font-black text-white">
            {profile.username}
          </h2>
          <a
            href={profile.profile}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex text-sm font-medium text-emerald-300 hover:text-emerald-200"
          >
            View Steam Profile
          </a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Age
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {getAccountAge(profile.created)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Level
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {formatNumber(profile.level)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Games
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {formatNumber(profile.gamesOwned)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Visibility
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {getVisibilityText(profile.visibility)}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-black/20 p-4">
          <p className="font-semibold text-zinc-500">Steam ID</p>
          <p className="mt-2 break-all text-zinc-200">{profile.steamId}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-black/20 p-4">
          <p className="font-semibold text-zinc-500">Member Since</p>
          <p className="mt-2 text-zinc-200">{formatDate(profile.created)}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-black/20 p-4">
          <p className="font-semibold text-zinc-500">Country</p>
          <p className="mt-2 text-zinc-200">
            {profile.country ? `${flag} ${profile.country}` : "Unknown"}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-black/20 p-4">
          <p className="font-semibold text-zinc-500">Owned Games</p>
          <p className="mt-2 text-zinc-200">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#4338ca_0,#18181b_34%,#09090b_70%)] px-4 py-6 text-white sm:px-6 lg:flex lg:items-center lg:py-8">
      <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-zinc-800 bg-zinc-950/75 p-6 shadow-2xl shadow-black/30 backdrop-blur lg:sticky lg:top-8 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
            Steam Oracle
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white sm:text-5xl">
            Know your Steam profile at a glance
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Discover your gaming identity, account history, Steam level, library
            size, and profile visibility.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="steam-id"
              className="text-sm font-semibold text-zinc-300"
            >
              Steam URL, SteamID64, or username
            </label>
            <input
              id="steam-id"
              type="text"
              placeholder="steamcommunity.com/id/example"
              value={steamId}
              onChange={(event) => setSteamId(event.target.value)}
              className="mt-3 w-full rounded-lg border border-zinc-700 bg-black/40 p-4 text-base text-white outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-400/30"
            />

            <div className="mt-4 rounded-lg border border-zinc-800 bg-black/25 p-4 text-sm text-zinc-500">
              <p className="font-semibold text-zinc-300">Supported formats</p>
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
              className="mt-5 w-full rounded-lg bg-violet-500 p-4 text-base font-bold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {loading ? "Fetching Steam Data..." : "Analyze Profile"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-200">
              {error}
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
    </main>
  );
}
