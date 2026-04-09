"use client";

import { useState } from "react";

interface Keyword {
  id: string;
  keyword: string;
  rank: number;
  volume: number;
  difficulty: number;
}

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "chat">("overview");
  const [keywords] = useState<Keyword[]>([
    { id: "1", keyword: "AI marketing platform", rank: 5, volume: 2400, difficulty: 68 },
    { id: "2", keyword: "social media automation", rank: 8, volume: 1890, difficulty: 52 },
    { id: "3", keyword: "performance marketing tools", rank: 3, volume: 1200, difficulty: 61 },
    { id: "4", keyword: "SEO optimization software", rank: 12, volume: 980, difficulty: 58 },
    { id: "5", keyword: "content marketing AI", rank: 7, volume: 750, difficulty: 45 },
  ]);

  const totalKeywords = keywords.length;
  const avgRank = (keywords.reduce((sum, k) => sum + k.rank, 0) / keywords.length).toFixed(1);
  const totalSearchVolume = keywords.reduce((sum, k) => sum + k.volume, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">SEO & Content</h1>
        <p className="text-gray-600">Optimize rankings, track keywords, and improve visibility</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "keywords"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Keywords ({totalKeywords})
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "chat"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Team Chat
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-semibold mb-2">Keywords Tracked</h3>
            <p className="text-2xl font-bold text-blue-600">{totalKeywords}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="font-semibold mb-2">Avg Rank</h3>
            <p className="text-2xl font-bold text-blue-600">#{avgRank}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">👁️</div>
            <h3 className="font-semibold mb-2">Search Volume</h3>
            <p className="text-2xl font-bold text-blue-600">{totalSearchVolume.toLocaleString()}</p>
          </div>
        </div>
      )}

      {activeTab === "keywords" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Keyword</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Volume</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw) => (
                <tr key={kw.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium">{kw.keyword}</td>
                  <td className="px-6 py-3 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      kw.rank <= 5
                        ? "bg-green-100 text-green-800"
                        : kw.rank <= 10
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      #{kw.rank}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">{kw.volume.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm font-semibold">{kw.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "chat" && (
        <div>
          <a
            href="/dashboard/seo/chat"
            className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            Start Chat with SEO Team
          </a>
        </div>
      )}
    </div>
  );
}
