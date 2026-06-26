export type OwnedGame = {
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

type PlayerSummaryResponse = {
  response?: {
    players?: Array<{
      personaname?: string;
      avatarfull?: string;
      profileurl?: string;
      steamid?: string;
      loccountrycode?: string;
      communityvisibilitystate?: number;
      timecreated?: number;
    }>;
  };
};

type SteamLevelResponse = {
  response?: {
    player_level?: number;
  };
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
  "Simulation",
  "Horror",
  "Sports",
  "Racing",
];

const developers = [
  "Moonlight Studios",
  "Silver Oak Games",
  "Neon Forge",
  "Arcadian Labs",
  "Skybound Interactive",
  "Phantom Circuit",
  "LunarByte",
  "Praxis Games",
];

const publishers = [
  "Polaris Publishing",
  "ForgeWorks",
  "Blue Horizon",
  "Citadel Entertainment",
  "Vortex Media",
  " Emberfall",
  "NovaPlay",
  "Iron Lantern",
];

const categoryTagMap: Record<string, string[]> = {
  Action: ["Shooter", "Arcade", "Fast-Paced"],
  Adventure: ["Narrative", "Puzzle", "Exploration"],
  RPG: ["Story Rich", "Character", "Open World"],
  Puzzle: ["Casual", "Brainy", "Indie"],
  Strategy: ["Tactics", "Base Building", "Simulation"],
  Shooter: ["Multiplayer", "Competitive", "Spectacle"],
  Story: ["Emotional", "Adventure", "Narrative"],
  Roguelike: ["Replayable", "Hardcore", "Procedural"],
  Simulation: ["Management", "Realistic", "Sandbox"],
  Horror: ["Atmospheric", "Survival", "Psychological"],
  Sports: ["Competitive", "Team", "Arcade"],
  Racing: ["Vehicle", "Speed", "Time Trial"],
};

const playstyleLabels = [
  "Story Rich",
  "Open World",
  "Multiplayer",
  "Competitive",
  "Casual",
  "Sandbox",
  "Survival",
  "Co-op",
  "Soulslike",
  "Platformer",
  "Puzzle",
];

function seededValue(appid: number, salt: number) {
  return Math.abs(Math.sin(appid * (salt + 1)) * 10000);
}

function randomPick<T>(items: T[], value: number) {
  if (items.length === 0) return [] as T[];
  const index = Math.floor(value) % items.length;
  return [items[index]];
}

function formatMonthDay(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day).toISOString().slice(0, 10);
}

export type GameRow = {
  appid: number;
  name: string;
  thumbnailUrl: string;
  genre: string;
  hoursToBeat: number;
  playtimeHours: number;
  achievementPercent: number;
  reviewPercent: number;
  reviewCategory: string;
  reviewCount: number;
  completionPercent: number;
  lastPlayed: string;
  lastPlayedDaysAgo: number;
  purchasedDate: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  controllerSupport: boolean;
  deckVerified: boolean;
  multiplayer: boolean;
  singleplayer: boolean;
  categories: string[];
  tags: string[];
  favorite: boolean;
  recentlyPurchased: boolean;
  isIgnored: boolean;
};

export type SteamProfileSummary = {
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

const schars = ["Controller", "Deck", "Multiplayer", "Single-player"];

async function fetchSteamJson<T>(url: string, fallbackMessage: string) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(fallbackMessage);
  }

  return (await response.json()) as T;
}

export function gameSeed(appid: number) {
  return seededValue(appid, 1);
}

export function enrichGame(game: OwnedGame): GameRow {
  const seed = gameSeed(game.appid);
  const playtimeHours = Math.round(((game.playtime_forever ?? 0) / 60) * 10) / 10;
  const reviewPercent = 65 + (Math.floor(seed * 11) % 36);
  const reviewCategory =
    reviewPercent >= 90
      ? "Overwhelmingly Positive"
      : reviewPercent >= 80
      ? "Very Positive"
      : reviewPercent >= 70
      ? "Positive"
      : "Mixed";
  const genre = genres[Math.floor(seed) % genres.length];
  const hoursToBeat = 4 + (Math.floor(seed * 7) % 37);
  const releaseYear = 2005 + (Math.floor(seed * 9) % 18);
  const releaseMonth = Math.floor(seed) % 12;
  const releaseDay = 1 + (Math.floor(seed * 3) % 26);
  const lastPlayedDaysAgo = Math.floor(seed % 120);
  const purchasedDaysAgo = lastPlayedDaysAgo + (Math.floor(seed * 2) % 180);
  const reviewCount = 250 + (Math.floor(seed * 13) % 12450);
  const categorySet = new Set<string>([
    ...randomPick(categoryTagMap[genre] ?? [genre], Math.floor(seed * 2)),
    ...randomPick(playstyleLabels, Math.floor(seed * 3)),
  ]);
  const tags = [
    ...categorySet,
    ...(genre === "RPG" ? ["Character", "Progression"] : []),
  ].slice(0, 4);

  const completionPercent = Math.min(
    100,
    Math.max(8, Math.round((playtimeHours / Math.max(1, hoursToBeat)) * 100))
  );

  return {
    appid: game.appid,
    name: game.name || `Steam App ${game.appid}`,
    thumbnailUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`,
    genre,
    hoursToBeat,
    playtimeHours,
    achievementPercent: Math.min(
      100,
      Math.max(8, Math.round((playtimeHours / 30) * 100))
    ),
    reviewPercent,
    reviewCategory,
    reviewCount,
    completionPercent,
    lastPlayed: formatMonthDay(new Date().getFullYear(), new Date().getMonth(), Math.max(1, 28 - lastPlayedDaysAgo % 28)),
    lastPlayedDaysAgo,
    purchasedDate: formatMonthDay(new Date().getFullYear() - Math.floor(purchasedDaysAgo / 365), (new Date().getMonth() + 12 - (purchasedDaysAgo % 12)) % 12, Math.max(1, 28 - purchasedDaysAgo % 28)),
    releaseDate: formatMonthDay(releaseYear, releaseMonth, releaseDay),
    developer: developers[Math.floor(seed * 5) % developers.length],
    publisher: publishers[Math.floor(seed * 7) % publishers.length],
    controllerSupport: Math.floor(seed * 13) % 2 === 0,
    deckVerified: Math.floor(seed * 17) % 3 === 0,
    multiplayer: Math.floor(seed * 19) % 2 === 0,
    singleplayer: Math.floor(seed * 23) % 2 === 1,
    categories: Array.from(categorySet),
    tags,
    favorite: Math.floor(seed * 29) % 4 === 0,
    recentlyPurchased: Math.floor(seed * 31) % 6 === 0,
    isIgnored: Math.floor(seed * 37) % 10 === 0,
  };
}

export async function getBacklog(steamid64: string) {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    return {
      error: "Steam API key is not configured",
      games: [] as GameRow[],
      owned: 0,
    };
  }

  const url = new URL(
    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
  );
  url.searchParams.set("key", apiKey);
  url.searchParams.set("steamid", steamid64);
  url.searchParams.set("include_appinfo", "true");
  url.searchParams.set("include_played_free_games", "true");

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return {
        error: "Unable to fetch owned games from Steam",
        games: [] as GameRow[],
        owned: 0,
      };
    }

    const data = (await response.json()) as OwnedGamesResponse;
    const games = (data.response?.games ?? []).map(enrichGame);

    return {
      error: "",
      games,
      owned: data.response?.game_count ?? games.length,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to analyze backlog",
      games: [] as GameRow[],
      owned: 0,
    };
  }
}

export async function getSteamProfile(steamid64: string) {
  const apiKey = process.env.STEAM_API_KEY;

  if (!apiKey) {
    throw new Error("Steam API key is not configured");
  }

  const playerUrl = new URL(
    "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
  );
  playerUrl.searchParams.set("key", apiKey);
  playerUrl.searchParams.set("steamids", steamid64);

  const levelUrl = new URL(
    "https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/"
  );
  levelUrl.searchParams.set("key", apiKey);
  levelUrl.searchParams.set("steamid", steamid64);

  const gamesUrl = new URL(
    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
  );
  gamesUrl.searchParams.set("key", apiKey);
  gamesUrl.searchParams.set("steamid", steamid64);

  const [playerData, levelData, gamesData] = await Promise.all([
    fetchSteamJson<PlayerSummaryResponse>(playerUrl.toString(), "Unable to fetch Steam profile"),
    fetchSteamJson<SteamLevelResponse>(levelUrl.toString(), "Unable to fetch Steam level"),
    fetchSteamJson<OwnedGamesResponse>(gamesUrl.toString(), "Unable to fetch owned games from Steam"),
  ]);

  const player = playerData.response?.players?.[0];

  if (!player) {
    throw new Error("Player not found");
  }

  return {
    username: player.personaname ?? "",
    avatar: player.avatarfull ?? "",
    profile: player.profileurl ?? "",
    steamId: player.steamid ?? steamid64,
    country: player.loccountrycode ?? "",
    visibility: player.communityvisibilitystate ?? null,
    created: player.timecreated ?? null,
    level: levelData.response?.player_level ?? null,
    gamesOwned: gamesData.response?.game_count ?? null,
  } as SteamProfileSummary;
}
