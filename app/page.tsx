"use client";

import { useState } from "react";

export default function Home() {
  const [steamId, setSteamId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [profileUrl, setProfileUrl] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white text-black p-10 rounded-3xl shadow-2xl w-full max-w-xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          🎮 Steam Backlog Intelligence
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Analyze your Steam profile and discover your gaming habits.
        </p>

        <input
          type="text"
          placeholder="Enter Steam64 ID"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          className="w-full border border-gray-300 rounded-xl p-4 text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-800"
        />

        <button
          onClick={async () => {
            if (!steamId.trim()) return;

            setLoading(true);

            try {
              const response = await fetch(
                `/api/steam?steamId=${steamId}`
              );

              const data = await response.json();

              setPlayerName(data.username);
              setAvatar(data.avatar);
              setProfileUrl(data.profile);
            } catch (error) {
              console.error(error);
            } finally {
              setLoading(false);
            }
          }}
          className="w-full bg-gray-900 text-white p-4 rounded-xl text-lg font-semibold hover:bg-gray-800 transition duration-200"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {playerName && (
          <div className="mt-8 border border-gray-200 rounded-2xl p-6 shadow-sm">
            <img
              src={avatar}
              alt="Steam Avatar"
              className="w-24 h-24 rounded-full mx-auto border-4 border-gray-200"
            />

            <h2 className="text-2xl font-bold text-center text-gray-900 mt-4">
              {playerName}
            </h2>

            <p className="text-center text-gray-500 mt-1">
              Steam Profile
            </p>

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              View Steam Profile →
            </a>
          </div>
        )}
      </div>
    </main>
  );
}