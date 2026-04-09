"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Campaign {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  roas: number;
  ctr: number;
  cpa: number;
}

export default function PerformancePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "chat">("overview");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string>("");

  // Get brand ID
  useEffect(() => {
    const fetchBrand = async () => {
      const res = await fetch("/api/brand");
      if (res.ok) {
        const brand = await res.json();
        setBrandId(brand.id);
      }
    };
    if (session?.user?.id) {
      fetchBrand();
    }
  }, [session]);

  // Fetch campaigns when brand ID is available
  useEffect(() => {
    if (brandId) {
      fetchCampaigns();
    }
  }, [brandId]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meta/campaigns?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      } else {
        // Show mock data if real integration not available
        setCampaigns([
          {
            id: "mock-1",
            name: "Summer Product Launch",
            status: "ACTIVE",
            spend: 1250.50,
            impressions: 45000,
            clicks: 1203,
            conversions: 87,
            roas: 245.5,
            ctr: 2.67,
            cpa: 14.38,
          },
          {
            id: "mock-2",
            name: "Brand Awareness Campaign",
            status: "ACTIVE",
            spend: 890.25,
            impressions: 72000,
            clicks: 1890,
            conversions: 142,
            roas: 189.3,
            ctr: 2.63,
            cpa: 6.27,
          },
          {
            id: "mock-3",
            name: "Retargeting Campaign",
            status: "PAUSED",
            spend: 450.00,
            impressions: 28000,
            clicks: 892,
            conversions: 156,
            roas: 335.2,
            ctr: 3.18,
            cpa: 2.88,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      // Fallback to mock data
      setCampaigns([
        {
          id: "mock-1",
          name: "Summer Product Launch",
          status: "ACTIVE",
          spend: 1250.50,
          impressions: 45000,
          clicks: 1203,
          conversions: 87,
          roas: 245.5,
          ctr: 2.67,
          cpa: 14.38,
        },
        {
          id: "mock-2",
          name: "Brand Awareness Campaign",
          status: "ACTIVE",
          spend: 890.25,
          impressions: 72000,
          clicks: 1890,
          conversions: 142,
          roas: 189.3,
          ctr: 2.63,
          cpa: 6.27,
        },
        {
          id: "mock-3",
          name: "Retargeting Campaign",
          status: "PAUSED",
          spend: 450.00,
          impressions: 28000,
          clicks: 892,
          conversions: 156,
          roas: 335.2,
          ctr: 3.18,
          cpa: 2.88,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgROAS = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance Marketing</h1>
        <p className="text-gray-600">Manage campaigns, track ROI, and optimize ad spend</p>
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
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "campaigns"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Campaigns ({campaigns.length})
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
            <div className="text-5xl mb-4">📊</div>
            <h3 className="font-semibold mb-2">Avg ROAS</h3>
            <p className="text-2xl font-bold text-blue-600">{avgROAS.toFixed(2)}%</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="font-semibold mb-2">Total Spend</h3>
            <p className="text-2xl font-bold text-blue-600">${totalSpend.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="font-semibold mb-2">Conversions</h3>
            <p className="text-2xl font-bold text-blue-600">{totalConversions}</p>
          </div>
        </div>
      )}

      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <button
            onClick={fetchCampaigns}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Refreshing..." : "Refresh Campaigns"}
          </button>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 mb-4">No campaigns found. Connect Meta Ads to view campaigns.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Campaign</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Spend</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Conversions</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium">{campaign.name}</td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm">${campaign.spend.toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm">{campaign.conversions}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-blue-600">{campaign.roas.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "chat" && (
        <div>
          <a
            href="/dashboard/performance/chat"
            className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            Start Chat with Performance Team
          </a>
        </div>
      )}
    </div>
  );
}
