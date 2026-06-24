"use client";

import { useState } from "react";

export default function Home() {
  const [steamId, setSteamId] = useState("");

  return (
    <div>
      <h1>Steam Backlog Intelligence</h1>

      <input
        type="text"
        placeholder="Enter Steam ID"
        value={steamId}
        onChange={(e) => setSteamId(e.target.value)}
      />

<button
  onClick={async () => {
    const response = await fetch("/api/steam");
    const data = await response.json();

    alert(data.message);
  }}
>
  Analyze
</button>

      <p>Steam ID: {steamId}</p>
    </div>
  );
}