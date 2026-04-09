import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MetricCard from "@/components/shared/metric-card";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Not authenticated</div>;
  }

  // Get user's brand
  const brand = await prisma.brand.findUnique({
    where: { userId: session.user.id },
  });

  if (!brand) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Welcome to MarketingOS!</h1>
        <p className="text-gray-600 mb-6">
          Let's get your brand set up and ready to go.
        </p>
        <Link
          href="/onboarding"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  // Fetch metrics for all teams
  const [socialPosts, campaigns, keywords] = await Promise.all([
    prisma.socialPost.findMany({
      where: { brand: { userId: session.user.id } },
    }),
    prisma.campaign.findMany({
      where: { brand: { userId: session.user.id } },
    }),
    prisma.keyword.findMany({
      where: { brand: { userId: session.user.id } },
    }),
  ]);

  const socialEngagement = socialPosts.reduce(
    (sum, p) => sum + p.likes + p.comments + p.shares,
    0
  );
  const campaignSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const campaignRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const keywordTop10 = keywords.filter(
    (k) => (k.currentRank || 999) <= 10
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          {brand.name} • {brand.industry || "No industry specified"}
        </p>
      </div>

      {/* Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Social Media Team */}
        <TeamCard
          title="Social Media Marketing"
          icon="📱"
          description="Content creation, posting, engagement"
          href="/dashboard/social"
          status="ready"
          metric={
            socialPosts.length > 0 ? `${socialPosts.length} posts` : "Start creating"
          }
          metricColor={socialPosts.length > 0 ? "text-green-600" : "text-gray-500"}
        />

        {/* Performance Marketing Team */}
        <TeamCard
          title="Performance Marketing"
          icon="📈"
          description="Campaigns, ads, ROI tracking"
          href="/dashboard/performance"
          status="ready"
          metric={
            campaigns.length > 0
              ? `${campaigns.length} campaigns`
              : "No campaigns yet"
          }
          metricColor={campaigns.length > 0 ? "text-green-600" : "text-gray-500"}
        />

        {/* SEO Team */}
        <TeamCard
          title="SEO & Content"
          icon="🔍"
          description="Rankings, keywords, optimization"
          href="/dashboard/seo"
          status="ready"
          metric={
            keywords.length > 0 ? `${keywords.length} keywords` : "Start tracking"
          }
          metricColor={keywords.length > 0 ? "text-green-600" : "text-gray-500"}
        />
      </div>

      {/* Quick Metrics */}
      {(socialPosts.length > 0 ||
        campaigns.length > 0 ||
        keywords.length > 0) && (
        <div>
          <h2 className="text-xl font-bold mb-4">Quick Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {socialPosts.length > 0 && (
              <MetricCard
                title="Social Engagement"
                value={socialEngagement}
                icon="👍"
              />
            )}
            {campaigns.length > 0 && (
              <>
                <MetricCard
                  title="Ad Spend"
                  value={`$${Math.round(campaignSpend)}`}
                  icon="💰"
                />
                <MetricCard
                  title="Ad Revenue"
                  value={`$${Math.round(campaignRevenue)}`}
                  change={`ROI: ${(((campaignRevenue - campaignSpend) / campaignSpend) * 100).toFixed(1)}%`}
                  changeType={campaignRevenue >= campaignSpend ? "positive" : "negative"}
                  icon="💵"
                />
              </>
            )}
            {keywords.length > 0 && (
              <MetricCard
                title="Top 10 Rankings"
                value={keywordTop10}
                change={`of ${keywords.length} keywords`}
                icon="🏆"
              />
            )}
          </div>
        </div>
      )}

      {/* Brand Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Brand Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-blue-600">Brand Name</p>
            <p className="font-semibold text-blue-900">{brand.name}</p>
          </div>
          {brand.industry && (
            <div>
              <p className="text-sm text-blue-600">Industry</p>
              <p className="font-semibold text-blue-900">{brand.industry}</p>
            </div>
          )}
          {brand.website && (
            <div>
              <p className="text-sm text-blue-600">Website</p>
              <p className="font-semibold text-blue-900 truncate">{brand.website}</p>
            </div>
          )}
          {brand.brandVoice && (
            <div>
              <p className="text-sm text-blue-600">Brand Voice</p>
              <p className="font-semibold text-blue-900">{brand.brandVoice}</p>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Tips */}
      {socialPosts.length === 0 &&
        campaigns.length === 0 &&
        keywords.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-amber-900 mb-3">
              Getting Started
            </h2>
            <ol className="space-y-2 text-sm text-amber-900">
              <li>
                1.{" "}
                <Link href="/dashboard/social" className="text-blue-600 hover:underline">
                  Create your first social media post
                </Link>{" "}
                (takes 5 minutes)
              </li>
              <li>
                2.{" "}
                <Link href="/settings" className="text-blue-600 hover:underline">
                  Connect your advertising accounts
                </Link>{" "}
                (Meta, Google, LinkedIn)
              </li>
              <li>
                3.{" "}
                <Link href="/dashboard/seo/chat" className="text-blue-600 hover:underline">
                  Chat with SEO team
                </Link>{" "}
                to plan your keyword strategy
              </li>
            </ol>
          </div>
        )}
    </div>
  );
}

function TeamCard({
  title,
  icon,
  description,
  href,
  status,
  metric,
  metricColor,
}: {
  title: string;
  icon: string;
  description: string;
  href: string;
  status: "ready" | "setup";
  metric: string;
  metricColor: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 flex-1">{description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className={`text-sm font-medium ${metricColor}`}>{metric}</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded">
            {status === "ready" ? "Ready" : "Setup"}
          </span>
        </div>
      </div>
    </Link>
  );
}
