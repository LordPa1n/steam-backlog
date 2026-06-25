export async function GET(request: Request) {
  const apiKey = process.env.STEAM_API_KEY;

  const { searchParams } = new URL(request.url);

  let steamId = searchParams.get("steamId");

  if (!steamId) {
    return Response.json({
      error: "Steam ID is required",
    });
  }

  try {
    // If input is NOT a SteamID64,
    // assume it's a custom username
    if (!/^\d{17}$/.test(steamId)) {
      const vanityResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${steamId}`
      );

      const vanityData = await vanityResponse.json();

      if (vanityData.response.success !== 1) {
        return Response.json({
          error: "Steam user not found",
        });
      }

      steamId = vanityData.response.steamid;
    }

    const [playerResponse, levelResponse, gamesResponse] = await Promise.all([
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
      ),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`
      ),
      fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}`
      ),
    ]);

    const [playerData, levelData, gamesData] = await Promise.all([
      playerResponse.json(),
      levelResponse.json(),
      gamesResponse.json(),
    ]);

    const player = playerData.response.players[0];

    if (!player) {
      return Response.json({
        error: "Player not found",
      });
    }

    return Response.json({
      username: player.personaname,
      avatar: player.avatarfull,
      profile: player.profileurl,
      steamId: player.steamid,
      country: player.loccountrycode,
      visibility: player.communityvisibilitystate,
      created: player.timecreated,
      level: levelData.response?.player_level ?? null,
      gamesOwned: gamesData.response?.game_count ?? null,
    });
  } catch (error) {
    console.error(error);

    return Response.json({
      error: "Failed to fetch profile",
    });
  }
}
