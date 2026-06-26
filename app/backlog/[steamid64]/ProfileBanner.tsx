"use client";

import { useState } from "react";
import Image from "next/image";
import type { SteamProfileSummary } from "@/lib/steam";

function formatDate(timestamp: number | null) {
  if (!timestamp) return "Unknown";

  return new Date(timestamp * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getVisibilityText(visibility: number | null) {
  switch (visibility) {
    case 1:
      return { label: "Private", emoji: "🔒" };
    case 3:
      return { label: "Public", emoji: "🌐" };
    default:
      return { label: "Unknown", emoji: "❓" };
  }
}

function countryCodeToFlag(code: string) {
  if (!code) return "";

  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

export default function ProfileBanner({
  profile,
}: {
  profile: SteamProfileSummary;
}) {
  const [copied, setCopied] = useState(false);
  const visibility = getVisibilityText(profile.visibility);
  const flag = countryCodeToFlag(profile.country);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/backlog/${profile.steamId}`
      : "";
  const shareMessage = `Check out my Steam backlog analysis on Steam Oracle! ${shareUrl}`;

  async function handleCopy() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDiscordShare() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <section className="relative rounded-3xl border border-white/10 bg-[#202429]/80 p-6 shadow-2xl shadow-black/20 ring-1 ring-white/5">
      {copied ? (
        <div className="absolute right-6 top-6 z-20 rounded-full bg-emerald-500/95 px-4 py-2 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/30">
          Copied!
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex items-start gap-5">
          {profile.avatar ? (
            <Image
              src={profile.avatar}
              alt={`${profile.username} avatar`}
              width={96}
              height={96}
              className="h-24 w-24 rounded-3xl border border-white/10 object-cover shadow-lg shadow-black/20"
            />
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-pastel-peach">
                Steam profile summary
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-pastel-lavender/70">
                {visibility.emoji} {visibility.label}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-black text-pastel-cream sm:text-4xl">
              {profile.username}
            </h1>
            <p className="mt-3 text-sm leading-6 text-pastel-lavender/70">
              SteamID64: {profile.steamId} • {flag} {profile.country || "Unknown region"}
            </p>
            <p className="mt-2 text-sm text-pastel-lavender/70">
              Joined: {formatDate(profile.created)} • Level: {profile.level ?? "Private"}
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-3xl border border-white/10 bg-[#181e26]/80 p-4 text-sm text-pastel-lavender/70">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-pastel-lavender/50">
              Share Profile
            </p>
            <p className="mt-3 text-sm leading-6 text-pastel-lavender/70">
              Copy the public backlog dashboard link and share it with friends.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-2xl bg-pastel-sky/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-pastel-sky/100"
              >
                Copy Link
              </button>
              <span className="text-xs uppercase tracking-[0.24em] text-pastel-lavender/60">
                {shareUrl || "Loading share URL..."}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-pastel-lavender/50">
              Share to socials
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out my Steam backlog analysis on Steam Oracle! ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#11181e]/80 px-4 py-2 text-sm font-semibold text-pastel-cream transition hover:bg-[#141e27]"
              >
                Twitter
              </a>
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(
                  shareUrl
                )}&title=${encodeURIComponent(
                  "Check out my Steam backlog analysis on Steam Oracle!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#11181e]/80 px-4 py-2 text-sm font-semibold text-pastel-cream transition hover:bg-[#141e27]"
              >
                Reddit
              </a>
              <a
                href={`https://discord.com/channels/@me`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDiscordShare}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#11181e]/80 px-4 py-2 text-sm font-semibold text-pastel-cream transition hover:bg-[#141e27]"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
