export async function GET(request: Request) {
  const apiKey = process.env.STEAM_API_KEY;

  const { searchParams } = new URL(request.url);

  const steamId = searchParams.get("steamId");

  if (!steamId) {
    return Response.json({
      error: "Steam ID is required",
    });
  }

  const response = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`
  );

  const data = await response.json();

  const player = data.response.players[0];

  return Response.json({
    username: player.personaname,
    avatar: player.avatarfull,
    profile: player.profileurl,
  });
}