"use client";

import { useState } from "react";

interface IntegrationPlatform {
  id: string;
  name: string;
  icon: string;
  description: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "password" | "email";
    placeholder: string;
    required: boolean;
  }>;
}

const PLATFORMS: IntegrationPlatform[] = [
  {
    id: "meta_ads",
    name: "Meta Ads",
    icon: "📘",
    description: "Facebook & Instagram advertising",
    fields: [
      {
        name: "access_token",
        label: "Access Token",
        type: "password",
        placeholder: "Your access token",
        required: true,
      },
      {
        name: "account_id",
        label: "Ad Account ID",
        type: "text",
        placeholder: "act_xxxxxxxxxxxx",
        required: true,
      },
    ],
  },
  {
    id: "google_ads",
    name: "Google Ads",
    icon: "🔵",
    description: "Google advertising platform",
    fields: [
      {
        name: "api_key",
        label: "API Key",
        type: "password",
        placeholder: "Your API key",
        required: true,
      },
      {
        name: "customer_id",
        label: "Customer ID",
        type: "text",
        placeholder: "1234567890",
        required: true,
      },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📷",
    description: "Instagram business account",
    fields: [
      {
        name: "access_token",
        label: "Access Token",
        type: "password",
        placeholder: "Your access token",
        required: true,
      },
      {
        name: "business_account_id",
        label: "Business Account ID",
        type: "text",
        placeholder: "Your Instagram ID",
        required: true,
      },
    ],
  },
  {
    id: "gsc",
    name: "Google Search Console",
    icon: "🔍",
    description: "Search console integration",
    fields: [
      {
        name: "property_url",
        label: "Property URL",
        type: "text",
        placeholder: "https://yoursite.com",
        required: true,
      },
    ],
  },
  {
    id: "canva",
    name: "Canva",
    icon: "🎨",
    description: "Design and content creation",
    fields: [
      {
        name: "access_token",
        label: "Access Token",
        type: "password",
        placeholder: "Your Canva access token",
        required: true,
      },
      {
        name: "team_id",
        label: "Team ID",
        type: "text",
        placeholder: "Your Canva team ID",
        required: false,
      },
    ],
  },
];

export default function IntegrationConnector({
  brandId,
  onSuccess,
}: {
  brandId: string;
  onSuccess: () => void;
}) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<IntegrationPlatform | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelectPlatform = (platform: IntegrationPlatform) => {
    setSelectedPlatform(platform);
    setFormData({});
    setError("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/integrations/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandId,
          platform: selectedPlatform?.id,
          credentials: formData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Connection failed");
        return;
      }

      onSuccess();
      setSelectedPlatform(null);
      setFormData({});
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!selectedPlatform ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Connect Platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleSelectPlatform(platform)}
                className="border border-gray-300 rounded-lg p-4 hover:border-blue-600 hover:bg-blue-50 transition text-center"
              >
                <div className="text-3xl mb-2">{platform.icon}</div>
                <p className="font-semibold text-sm">{platform.name}</p>
                <p className="text-xs text-gray-600 mt-1">{platform.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedPlatform(null)}
            className="text-blue-600 hover:underline text-sm mb-4"
          >
            ← Back
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {selectedPlatform.icon} {selectedPlatform.name}
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedPlatform.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-600">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      handleInputChange(field.name, e.target.value)
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? "Connecting..." : "Connect"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
