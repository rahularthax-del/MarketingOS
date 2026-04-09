import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MetricCard from "@/components/shared/metric-card";

export default async function PerformanceReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Not authenticated</div>;
  }

  const campaigns = await prisma.campaign.findMany({
    where: { brand: { userId: session.user.id } },
  });

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);

  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const convRate =
    totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance Reports</h1>
        <p className="text-gray-600">Comprehensive analytics across all campaigns</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No campaigns to report on yet</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div>
            <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Total Spend"
                value={`$${Math.round(totalSpend)}`}
                icon="💰"
              />
              <MetricCard
                title="Total Revenue"
                value={`$${Math.round(totalRevenue)}`}
                change={`ROI: ${(((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1)}%`}
                changeType="positive"
                icon="📊"
              />
              <MetricCard
                title="ROAS"
                value={roas.toFixed(2)}
                change={roas >= 3 ? "On target ✓" : "Needs optimization"}
                changeType={roas >= 3 ? "positive" : "negative"}
                icon="🎯"
              />
              <MetricCard
                title="Conversions"
                value={totalConversions}
                icon="✅"
              />
            </div>
          </div>

          {/* Cost Metrics */}
          <div>
            <h2 className="text-xl font-bold mb-4">Cost Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                title="Avg CPC"
                value={`$${avgCpc.toFixed(2)}`}
                icon="🔗"
              />
              <MetricCard
                title="Avg CPA"
                value={`$${avgCpa.toFixed(2)}`}
                icon="📍"
              />
              <MetricCard
                title="CTR"
                value={`${ctr.toFixed(2)}%`}
                icon="📈"
              />
              <MetricCard
                title="Conv. Rate"
                value={`${convRate.toFixed(2)}%`}
                icon="🔄"
              />
            </div>
          </div>

          {/* Campaign Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Campaign Breakdown</h2>
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Campaign</p>
                      <p className="font-semibold">{campaign.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Spend</p>
                      <p className="font-semibold">
                        ${Math.round(campaign.spend)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold">
                        ${Math.round(campaign.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">ROAS</p>
                      <p className="font-semibold">{campaign.roas.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Conv.</p>
                      <p className="font-semibold">{campaign.conversions}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <span className="inline-block text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800">
                        {campaign.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
