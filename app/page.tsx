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
  onClick={() => {
    alert(`Steam ID entered: ${steamId}`);
  }}
>
  Analyze
</button>

      <p>Steam ID: {steamId}</p>
    </div>
  );
}