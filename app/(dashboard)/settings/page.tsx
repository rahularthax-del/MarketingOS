"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import IntegrationConnector from "@/components/shared/integration-connector";

interface Brand {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  brandVoice?: string;
  brandTagline?: string;
  brandMission?: string;
  brandValues?: string;
  targetAudience?: string;
  instagramHandle?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  tertiaryColor?: string;
}

export default function SettingsPage() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"brand" | "integrations">("brand");
  const [formData, setFormData] = useState<Partial<Brand>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadBrand = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        const res = await fetch("/api/brand");
        if (res.ok) {
          const data = await res.json();
          setBrand(data);
          setFormData(data);
        }
      }
      setLoading(false);
    };

    loadBrand();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("Brand settings updated successfully!");
        const updated = await res.json();
        setBrand(updated);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save brand settings");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!brand) {
    return <div>Brand not found</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your brand and integrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("brand")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "brand"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Brand Settings
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "integrations"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Integrations
        </button>
      </div>

      {/* Brand Settings Tab */}
      {activeTab === "brand" && (
        <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
              {message}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry || ""}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="e.g., SaaS, E-commerce, Services"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website || ""}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                placeholder="https://yoursite.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Voice
              </label>
              <select
                value={formData.brandVoice || "professional"}
                onChange={(e) =>
                  setFormData({ ...formData, brandVoice: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="bold">Bold</option>
                <option value="creative">Creative</option>
                <option value="technical">Technical</option>
                <option value="playful">Playful</option>
                <option value="unconventional">Unconventional</option>
                <option value="minimalist">Minimalist</option>
                <option value="inspirational">Inspirational</option>
                <option value="edgy">Edgy</option>
              </select>
            </div>

            <hr className="my-6" />
            <h3 className="text-lg font-semibold mb-4">Social Media</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagramHandle || ""}
                onChange={(e) =>
                  setFormData({ ...formData, instagramHandle: e.target.value })
                }
                placeholder="@your_instagram_handle"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <hr className="my-6" />
            <h3 className="text-lg font-semibold mb-4">Brand Guidelines</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Tagline
              </label>
              <input
                type="text"
                value={formData.brandTagline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brandTagline: e.target.value })
                }
                placeholder="Your brand's tagline or slogan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Mission / About
              </label>
              <textarea
                value={formData.brandMission || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brandMission: e.target.value })
                }
                placeholder="What does your brand stand for?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Values
              </label>
              <textarea
                value={formData.brandValues || ""}
                onChange={(e) =>
                  setFormData({ ...formData, brandValues: e.target.value })
                }
                placeholder="e.g., Innovation, Trust, Quality, Sustainability"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <textarea
                value={formData.targetAudience || ""}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value })
                }
                placeholder="Describe your ideal customer"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <hr className="my-6" />
            <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor || "#000000"}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, primaryColor: e.target.value })
                    }
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.secondaryColor || "#ffffff"}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryColor: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, secondaryColor: e.target.value })
                    }
                    placeholder="#ffffff"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.accentColor || "#0066cc"}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor: e.target.value })
                    }
                    placeholder="#0066cc"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tertiary Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={formData.tertiaryColor || "#cccccc"}
                    onChange={(e) =>
                      setFormData({ ...formData, tertiaryColor: e.target.value })
                    }
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.tertiaryColor || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tertiaryColor: e.target.value })
                    }
                    placeholder="#cccccc"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <IntegrationConnector
              brandId={brand.id}
              onSuccess={() => setMessage("Integration connected successfully!")}
            />
          </div>
        </div>
      )}
    </div>
  );
}
