"use client";

import { useState } from "react";

export default function SEOPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");

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
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="font-semibold mb-2">Pages Indexed</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">👁️</div>
            <h3 className="font-semibold mb-2">Organic Traffic</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-center py-8">
            Chat with your SEO team to research keywords, plan content, and improve rankings.
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Start Chat
          </button>
        </div>
      )}
    </div>
  );
}
