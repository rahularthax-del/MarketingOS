"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [step, setStep] = useState<"start" | "brand" | "integrations">("start");
  const router = useRouter();

  const handleBegin = () => {
    setStep("brand");
  };

  const handleBrandComplete = () => {
    setStep("integrations");
  };

  const handleIntegrationsComplete = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {step === "start" && (
          <StartStep onBegin={handleBegin} />
        )}
        {step === "brand" && (
          <BrandStep onComplete={handleBrandComplete} />
        )}
        {step === "integrations" && (
          <IntegrationsStep onComplete={handleIntegrationsComplete} />
        )}
      </div>
    </div>
  );
}

function StartStep({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to MarketingOS
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        An AI-powered marketing platform with three specialized teams ready to
        help you grow.
      </p>

      <div className="grid grid-cols-3 gap-4 my-12">
        <div className="text-center">
          <div className="text-5xl mb-2">📱</div>
          <p className="font-semibold">Social Media</p>
        </div>
        <div className="text-center">
          <div className="text-5xl mb-2">📈</div>
          <p className="font-semibold">Performance</p>
        </div>
        <div className="text-center">
          <div className="text-5xl mb-2">🔍</div>
          <p className="font-semibold">SEO</p>
        </div>
      </div>

      <button
        onClick={onBegin}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Get Started
      </button>
    </div>
  );
}

function BrandStep({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [voice, setVoice] = useState("professional");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry,
          website,
          brandVoice: voice,
        }),
      });

      if (res.ok) {
        onComplete();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Set Up Your Brand</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Brand Name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., SaaS, E-commerce, Services"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://yoursite.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Voice
          </label>
          <select
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
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

        <button
          type="submit"
          disabled={!name || loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

function IntegrationsStep({ onComplete }: { onComplete: () => void }) {
  const [skipped, setSkipped] = useState(false);

  if (skipped) {
    handleSkipIntegrations(onComplete);
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Connect Integrations (Optional)
      </h2>

      <p className="text-gray-600 mb-8">
        You can connect your social media, ad platforms, and other tools now, or skip and add them later.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <IntegrationOption platform="Meta Ads" icon="📘" />
        <IntegrationOption platform="Google Ads" icon="🔵" />
        <IntegrationOption platform="Instagram" icon="📷" />
        <IntegrationOption platform="Google Search Console" icon="🔍" />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => {
            setSkipped(true);
          }}
          className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
        >
          Skip for Now
        </button>
        <button
          onClick={onComplete}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

function IntegrationOption({ platform, icon }: { platform: string; icon: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 cursor-pointer transition">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="font-medium text-gray-900">{platform}</p>
      <p className="text-xs text-gray-500 mt-1">Connect Later</p>
    </div>
  );
}

function handleSkipIntegrations(onComplete: () => void) {
  onComplete();
}
