"use client";

import { useState } from "react";

export default function Home() {
  const [steamId, setSteamId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold mb-2">
          🎮 Steam Backlog Intelligence
        </h1>

        <p className="text-gray-600 mb-6">
          Analyze your Steam profile
        </p>

        <input
          type="text"
          placeholder="Enter Steam ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          onClick={async () => {
            setLoading(true);

            const response = await fetch(
              `/api/steam?steamId=${steamId}`
            );

            const data = await response.json();

            setPlayerName(data.username);
            setAvatar(data.avatar);
            setProfileUrl(data.profile);

            setLoading(false);
          }}
          className="w-full bg-black text-white p-3 rounded-lg hover:opacity-90"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {playerName && (
  <div className="mt-6 border rounded-lg p-4">
    <img
      src={avatar}
      alt="Avatar"
      className="w-20 h-20 rounded-full mx-auto mb-4"
    />

    <h2 className="text-xl font-bold text-center">
      {playerName}
    </h2>

    <a
      href={profileUrl}
      target="_blank"
      className="block text-center mt-2 text-blue-600"
    >
      View Steam Profile
    </a>
  </div>
)}
      </div>
    </main>
  );
}