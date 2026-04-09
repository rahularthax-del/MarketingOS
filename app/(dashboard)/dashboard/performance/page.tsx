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
  ctr: number;
  cpc: number;
  leads: number;
  cpl: number;
  conversions: number;
  cpa: number;
  revenue: number;
  roas: number;
  conversionRate: number;
}

export default function PerformancePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "analytics" | "chat">("overview");
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

  const getMockCampaigns = () => [
    {
      id: "mock-1",
      name: "Summer Product Launch",
      status: "ACTIVE",
      spend: 1250.50,
      impressions: 45000,
      clicks: 1203,
      ctr: 2.67,
      cpc: 1.04,
      leads: 245,
      cpl: 5.10,
      conversions: 87,
      cpa: 14.38,
      revenue: 3065.75,
      roas: 2.45,
      conversionRate: 7.23,
    },
    {
      id: "mock-2",
      name: "Brand Awareness Campaign",
      status: "ACTIVE",
      spend: 890.25,
      impressions: 72000,
      clicks: 1890,
      ctr: 2.63,
      cpc: 0.47,
      leads: 378,
      cpl: 2.35,
      conversions: 142,
      cpa: 6.27,
      revenue: 1684.97,
      roas: 1.89,
      conversionRate: 7.51,
    },
    {
      id: "mock-3",
      name: "Retargeting Campaign",
      status: "PAUSED",
      spend: 450.00,
      impressions: 28000,
      clicks: 892,
      ctr: 3.18,
      cpc: 0.50,
      leads: 312,
      cpl: 1.44,
      conversions: 156,
      cpa: 2.88,
      revenue: 1507.20,
      roas: 3.35,
      conversionRate: 17.49,
    },
  ];

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meta/campaigns?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        const campaignsData = data.campaigns || [];
        // If no campaigns from API, use mock data
        setCampaigns(campaignsData.length > 0 ? campaignsData : getMockCampaigns());
      } else {
        // Show mock data if real integration not available
        setCampaigns(getMockCampaigns());
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      // Fallback to mock data
      setCampaigns(getMockCampaigns());
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
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "analytics"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Detailed Analytics
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

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Campaign</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Spend</th>
                    <th className="px-4 py-3 text-right font-semibold">Impressions</th>
                    <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                    <th className="px-4 py-3 text-right font-semibold">CTR %</th>
                    <th className="px-4 py-3 text-right font-semibold">CPC</th>
                    <th className="px-4 py-3 text-right font-semibold">Leads</th>
                    <th className="px-4 py-3 text-right font-semibold">CPL</th>
                    <th className="px-4 py-3 text-right font-semibold">Conv.</th>
                    <th className="px-4 py-3 text-right font-semibold">CPA</th>
                    <th className="px-4 py-3 text-right font-semibold">Conv. Rate</th>
                    <th className="px-4 py-3 text-right font-semibold">Revenue</th>
                    <th className="px-4 py-3 text-right font-semibold">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{campaign.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          campaign.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">${campaign.spend.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{campaign.impressions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{campaign.clicks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">{campaign.ctr.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-right">${campaign.cpc.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{campaign.leads}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">${campaign.cpl.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{campaign.conversions}</td>
                      <td className="px-4 py-3 text-right">${campaign.cpa.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{campaign.conversionRate.toFixed(2)}%</td>
                      <td className="px-4 py-3 text-right">${campaign.revenue.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{campaign.roas.toFixed(2)}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-lg mb-4">📊 Key Metrics Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Spend:</span>
                  <span className="font-bold">${campaigns.reduce((sum, c) => sum + c.spend, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Impressions:</span>
                  <span className="font-bold">{campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Clicks:</span>
                  <span className="font-bold">{campaigns.reduce((sum, c) => sum + c.clicks, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg CTR:</span>
                  <span className="font-bold">{(campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg CPC:</span>
                  <span className="font-bold">${(campaigns.reduce((sum, c) => sum + c.cpc, 0) / campaigns.length).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h3 className="font-bold text-lg mb-4">🎯 CPL & ROAS Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Leads Generated:</span>
                  <span className="font-bold">{campaigns.reduce((sum, c) => sum + c.leads, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg CPL (Cost Per Lead):</span>
                  <span className="font-bold text-orange-600">${(campaigns.reduce((sum, c) => sum + c.cpl, 0) / campaigns.length).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best CPL Campaign:</span>
                  <span className="font-bold text-green-600">
                    {campaigns.reduce((min, c) => c.cpl < min.cpl ? c : min).name} (${campaigns.reduce((min, c) => c.cpl < min.cpl ? c : min).cpl.toFixed(2)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-bold">${campaigns.reduce((sum, c) => sum + c.revenue, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg ROAS:</span>
                  <span className="font-bold text-green-600">{(campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length).toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>
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
