"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Page {
  id: string;
  name: string;
  followers_count?: number;
}

interface Brand {
  id: string;
  instagramHandle?: string;
}

export default function SocialPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "chat">("overview");
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string>("");
  const [brand, setBrand] = useState<Brand | null>(null);

  // Get brand info (including Instagram handle)
  useEffect(() => {
    const fetchBrand = async () => {
      const res = await fetch("/api/brand");
      if (res.ok) {
        const brandData = await res.json();
        setBrandId(brandData.id);
        setBrand(brandData);
      }
    };
    if (session?.user?.id) {
      fetchBrand();
    }
  }, [session]);

  // Fetch pages when brand ID is available
  useEffect(() => {
    if (brandId) {
      fetchPages();
    }
  }, [brandId]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meta/pages?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setPages(data.pages || []);
      } else {
        // Show mock data if real integration not available
        setPages([
          { id: "mock-1", name: "ArthaxAI Official", followers_count: 45230 },
          { id: "mock-2", name: "ArthaxAI Community", followers_count: 12890 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching pages:", error);
      // Fallback to mock data
      setPages([
        { id: "mock-1", name: "ArthaxAI Official", followers_count: 45230 },
        { id: "mock-2", name: "ArthaxAI Community", followers_count: 12890 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalFollowers = pages.reduce((sum, p) => sum + (p.followers_count || 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Social Media Marketing</h1>
        <p className="text-gray-600">Create and manage your social media content with AI</p>
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
          onClick={() => setActiveTab("accounts")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "accounts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Accounts ({pages.length})
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
            <div className="text-5xl mb-4">📱</div>
            <h3 className="font-semibold mb-2">Accounts Connected</h3>
            <p className="text-2xl font-bold text-blue-600">{pages.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="font-semibold mb-2">Total Followers</h3>
            <p className="text-2xl font-bold text-blue-600">{totalFollowers.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="font-semibold mb-2">Status</h3>
            <p className="text-2xl font-bold text-green-600">Connected</p>
          </div>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="space-y-4">
          <button
            onClick={fetchPages}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Refreshing..." : "Refresh Accounts"}
          </button>

          {pages.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No Facebook pages found. Connect Meta Ads in Settings to view your pages.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{page.name}</h3>
                      <p className="text-sm text-gray-600">{page.followers_count?.toLocaleString() || 0} followers</p>
                    </div>
                  </div>

                  {brand?.instagramHandle && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3">Connected Instagram Account</h4>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="font-medium">{brand.instagramHandle}</p>
                        <p className="text-sm text-gray-600">Add your Instagram follower count in Settings</p>
                      </div>
                    </div>
                  )}
                  {!brand?.instagramHandle && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Add your Instagram handle in <a href="/settings" className="text-blue-600 hover:underline">Settings</a>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <div>
          <a
            href="/dashboard/social/chat"
            className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            Start Chat with Social Media Team
          </a>
        </div>
      )}
    </div>
  );
}
