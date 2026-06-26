"use client";

import { useEffect, useState } from "react";
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
  const [shareUrl, setShareUrl] = useState("");
  const visibility = getVisibilityText(profile.visibility);
  const flag = countryCodeToFlag(profile.country);

  useEffect(() => {
    setShareUrl(`${window.location.origin}/backlog/${profile.steamId}`);
  }, [profile.steamId]);

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
                className="inline-flex items-center justify-center rounded-2xl bg-pastel-sky/90 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-pastel-sky"
              >
                Copy Link
              </button>
              <span className="text-xs uppercase tracking-[0.24em] text-pastel-lavender/60">
                {shareUrl ? shareUrl : "Loading share URL..."}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#202429]/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-pastel-lavender/50">
              Share to socials
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `Check out my Steam backlog analysis on Steam Oracle! ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:brightness-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={`https://www.reddit.com/submit?url=${encodeURIComponent(
                  shareUrl
                )}&title=${encodeURIComponent(
                  "Check out my Steam backlog analysis on Steam Oracle!"
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Reddit"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4500] text-white transition hover:brightness-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                </svg>
              </a>
              <a
                href={`https://discord.com/channels/@me`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleDiscordShare}
                aria-label="Share on Discord"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2] text-white transition hover:brightness-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1569 2.4189z" />
                </svg>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Check out my Steam backlog analysis on Steam Oracle! ${shareUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="white"
                  aria-hidden="true"
                >
                  <path d="M20.52 3.48A11.8 11.8 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.08.55 4.01 1.52 5.7L0 24l6.54-1.71A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-1.84-.42-3.58-1.16-5.14ZM12 21.74c-1.85 0-3.64-.5-5.17-1.44l-.37-.22-3.88 1.02 1.03-3.78-.24-.39A9.82 9.82 0 0 1 2.25 12 9.75 9.75 0 1 1 12 21.74Zm5.34-7.3c-.23-.12-1.36-.67-1.57-.75-.21-.08-.36-.12-.51.12-.16.23-.62.75-.76.9-.14.16-.27.18-.5.06-.23-.12-.98-.37-1.87-1.15-.69-.61-1.15-1.37-1.29-1.6-.14-.23-.02-.35.1-.47.1-.1.23-.26.34-.38.11-.12.15-.21.23-.35.08-.14.04-.27-.02-.38-.06-.12-.51-1.22-.7-1.67-.18-.44-.37-.38-.51-.38-.13 0-.27-.01-.42-.01a1.1 1.1 0 0 0-.36.06c-.12.04-.29.12-.44.28-.15.16-.59.58-.59 1.41s.61 1.64.7 1.75c.1.12 1.2 1.84 2.9 2.58.4.17.71.27.95.35.4.14.77.12 1.06.07.32-.05 1.36-.56 1.55-1.1.19-.54.19-1.01.13-1.11-.06-.1-.21-.15-.44-.27Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
