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

interface Post {
  id: string;
  type: "post" | "reel" | "story";
  caption: string;
  engagement: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  date: string;
}

interface Insight {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    type: "reel",
    caption: "AI Marketing Automation Demo",
    engagement: 4.2,
    reach: 12450,
    impressions: 18900,
    likes: 523,
    comments: 89,
    shares: 156,
    saves: 234,
    date: "2024-04-08",
  },
  {
    id: "2",
    type: "post",
    caption: "New Features Released: Smart Campaign Optimization",
    engagement: 2.8,
    reach: 8320,
    impressions: 15420,
    likes: 234,
    comments: 45,
    shares: 67,
    saves: 89,
    date: "2024-04-07",
  },
  {
    id: "3",
    type: "reel",
    caption: "Behind the scenes: Building the future of marketing",
    engagement: 5.1,
    reach: 18900,
    impressions: 32450,
    likes: 945,
    comments: 156,
    shares: 234,
    saves: 567,
    date: "2024-04-06",
  },
  {
    id: "4",
    type: "post",
    caption: "Case Study: 340% ROI increase with our platform",
    engagement: 3.5,
    reach: 10200,
    impressions: 19800,
    likes: 412,
    comments: 78,
    shares: 123,
    saves: 145,
    date: "2024-04-05",
  },
  {
    id: "5",
    type: "reel",
    caption: "Quick tip: Optimize your social media budget",
    engagement: 4.8,
    reach: 16700,
    impressions: 28450,
    likes: 834,
    comments: 142,
    shares: 198,
    saves: 412,
    date: "2024-04-04",
  },
];

const MOCK_INSIGHTS: Insight[] = [
  {
    title: "Reels are your top performers",
    description:
      "Your reels have 4.7% avg engagement vs 3.2% for posts. Focus on reel content to maximize reach and engagement.",
    impact: "high",
  },
  {
    title: "Post at 7-9 PM for maximum engagement",
    description:
      "Posts published between 7-9 PM get 40% more engagement. Schedule your content accordingly.",
    impact: "high",
  },
  {
    title: "Increase call-to-action usage",
    description:
      "Posts with CTAs get 2.3x more comments and shares. Add questions or save/share prompts to your captions.",
    impact: "medium",
  },
  {
    title: "Carousel posts drive more saves",
    description:
      "Carousel posts average 156 saves vs 89 for static posts. Use multi-image posts for evergreen content.",
    impact: "medium",
  },
  {
    title: "Hashtag strategy needs optimization",
    description:
      "Currently using 15 hashtags. Best performance with 10-12 hashtags. Include mix of trending and niche hashtags.",
    impact: "medium",
  },
  {
    title: "Video content length matters",
    description:
      "Reels under 30 seconds get 25% more views. Keep your reel content concise and punchy.",
    impact: "low",
  },
];

export default function SocialPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "analytics" | "insights" | "chat">("overview");
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

      <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("accounts")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "accounts"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Accounts ({pages.length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "analytics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "insights"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Insights
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
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

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Post Analytics</h2>
            <div className="space-y-4">
              {MOCK_POSTS.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          post.type === "reel"
                            ? "bg-purple-100 text-purple-800"
                            : post.type === "story"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {post.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{post.date}</span>
                      </div>
                      <p className="text-lg font-semibold mb-2">{post.caption}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Reach</p>
                      <p className="text-xl font-bold text-blue-600">{post.reach.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Impressions</p>
                      <p className="text-xl font-bold text-blue-600">{post.impressions.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Engagement</p>
                      <p className="text-xl font-bold text-green-600">{post.engagement.toFixed(1)}%</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="text-xs text-gray-600 mb-1">Interactions</p>
                      <p className="text-xl font-bold text-orange-600">{(post.likes + post.comments + post.shares).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Likes</p>
                      <p className="font-semibold">{post.likes}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Comments</p>
                      <p className="font-semibold">{post.comments}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Shares</p>
                      <p className="font-semibold">{post.shares}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Saves</p>
                      <p className="font-semibold">{post.saves}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Actions</p>
                      <button className="text-blue-600 hover:underline font-semibold">Analyze</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "insights" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">AI-Generated Insights & Recommendations</h2>
            <div className="space-y-4">
              {MOCK_INSIGHTS.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{insight.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      insight.impact === "high"
                        ? "bg-red-100 text-red-800"
                        : insight.impact === "medium"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {insight.impact.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{insight.description}</p>

                  {insight.impact === "high" && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-sm font-semibold text-blue-900">💡 Action Item:</p>
                      <p className="text-sm text-blue-800 mt-1">
                        {insight.title.includes("Reels") &&
                          "Start creating more reel content. They drive 47% more engagement than static posts."}
                        {insight.title.includes("7-9 PM") &&
                          "Schedule your posts for 7-9 PM to maximize reach. Use the scheduling feature in the chat."}
                        {insight.title.includes("call-to-action") &&
                          "Edit your past posts or add CTAs to new ones. Ask questions to encourage comments."}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold mb-3">📊 Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Best Performing Content</p>
                <p className="font-semibold">Reels & Video Content</p>
                <p className="text-sm text-gray-600">4.7% avg engagement</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Best Time to Post</p>
                <p className="font-semibold">7:00 PM - 9:00 PM</p>
                <p className="text-sm text-gray-600">+40% engagement</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Growth Opportunity</p>
                <p className="font-semibold">+45% Potential</p>
                <p className="text-sm text-gray-600">Implement all recommendations</p>
              </div>
            </div>
          </div>
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
