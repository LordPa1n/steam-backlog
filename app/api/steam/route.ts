type SteamApiError = {
  status: number;
  message: string;
};

class SteamFetchError extends Error {
  status: number;

  constructor({ status, message }: SteamApiError) {
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

export async function GET(request: Request) {
  const apiKey = process.env.STEAM_API_KEY;

  const { searchParams } = new URL(request.url);

  let steamId = searchParams.get("steamId")?.trim();

  if (!steamId) {
    return Response.json(
      {
        error: "Steam URL handle or SteamID64 is required",
      },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return Response.json(
      {
        error: "Steam API key is not configured",
      },
      { status: 500 }
    );
  }

  try {
    if (!/^\d{17}$/.test(steamId)) {
      const vanityUrl = new URL(
        "https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/"
      );
      vanityUrl.searchParams.set("key", apiKey);
      vanityUrl.searchParams.set("vanityurl", steamId);

      const vanityData = await fetchSteamJson<{
        response?: {
          success?: number;
          steamid?: string;
        };
      }>(vanityUrl.toString(), "Unable to resolve Steam custom URL");

      if (vanityData.response?.success !== 1 || !vanityData.response.steamid) {
        return Response.json(
          {
            error: "Steam user not found. Use a SteamID64 or custom URL handle.",
          },
          { status: 404 }
        );
      }

      steamId = vanityData.response.steamid;
    }

    const playerUrl = new URL(
      "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
    );
    playerUrl.searchParams.set("key", apiKey);
    playerUrl.searchParams.set("steamids", steamId);

    const levelUrl = new URL(
      "https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/"
    );
    levelUrl.searchParams.set("key", apiKey);
    levelUrl.searchParams.set("steamid", steamId);

    const gamesUrl = new URL(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
    );
    gamesUrl.searchParams.set("key", apiKey);
    gamesUrl.searchParams.set("steamid", steamId);

    const [playerData, levelData, gamesData] = await Promise.all([
      fetchSteamJson<{
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
      }>(playerUrl.toString(), "Unable to fetch Steam profile"),
      fetchSteamJson<{
        response?: {
          player_level?: number;
        };
      }>(levelUrl.toString(), "Unable to fetch Steam level"),
      fetchSteamJson<{
        response?: {
          game_count?: number;
        };
      }>(gamesUrl.toString(), "Unable to fetch owned games"),
    ]);

    const player = playerData.response?.players?.[0];

    if (!player) {
      return Response.json(
        {
          error: "Player not found",
        },
        { status: 404 }
      );
    }

    return Response.json({
      username: player.personaname ?? "",
      avatar: player.avatarfull ?? "",
      profile: player.profileurl ?? "",
      steamId: player.steamid ?? steamId,
      country: player.loccountrycode ?? "",
      visibility: player.communityvisibilitystate ?? null,
      created: player.timecreated ?? null,
      level: levelData.response?.player_level ?? null,
      gamesOwned: gamesData.response?.game_count ?? null,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof SteamFetchError) {
      return Response.json(
        {
          error: error.message,
        },
        { status: error.status }
      );
    }

    return Response.json(
      {
        error: "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}
