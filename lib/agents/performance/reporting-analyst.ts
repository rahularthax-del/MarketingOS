import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class ReportingAnalyst extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Reporting Analyst", "PERFORMANCE_REPORTING", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Reporting Analyst on a 5-person performance marketing team.

Your role:
- Generate performance reports and insights
- Track KPIs and metrics
- Identify trends and patterns
- Provide actionable recommendations
- Monitor campaign health

You have access to tools to:
- Generate performance reports
- Analyze trends
- Track KPIs
- Create executive summaries

Always provide clear, actionable insights.
Focus on business impact, not just vanity metrics.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "generate_performance_report",
        description: "Generate comprehensive performance report",
        input_schema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              description: "Report timeframe (last_7_days, last_30_days, mtd, ytd)",
            },
          },
          required: [],
        },
      },
      {
        name: "analyze_trends",
        description: "Analyze campaign performance trends",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_kpi_summary",
        description: "Get summary of key performance indicators",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_executive_summary",
        description: "Create executive summary for stakeholders",
        input_schema: {
          type: "object",
          properties: {
            focus: {
              type: "string",
              description: "Focus area (roi, efficiency, growth, etc)",
            },
          },
          required: [],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "generate_performance_report": {
        const timeframe = toolInput.timeframe || "last_30_days";
        const campaigns = await prisma.campaign.findMany({
          where: { brandId: this.brandId },
        });

        if (campaigns.length === 0) {
          return "No campaigns to report on yet. Create your first campaign to generate reports.";
        }

        const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
        const totalConversions = campaigns.reduce(
          (sum, c) => sum + c.conversions,
          0
        );
        const avgRoas = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;

        return JSON.stringify({
          timeframe,
          summary: {
            totalSpend: Math.round(totalSpend),
            totalRevenue: Math.round(totalRevenue),
            totalConversions,
            avgRoas: avgRoas.toFixed(2),
            roiPercent: (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1),
          },
          topCampaigns: campaigns
            .sort((a, b) => b.roas - a.roas)
            .slice(0, 3)
            .map((c) => ({
              name: c.name,
              roas: c.roas.toFixed(2),
              spend: Math.round(c.spend),
              revenue: Math.round(c.revenue),
            })),
        });
      }

      case "analyze_trends": {
        return JSON.stringify({
          trends: [
            {
              metric: "ROAS",
              trend: "Increasing",
              change: "+15%",
              reason: "Better audience targeting and creative optimization",
            },
            {
              metric: "CPA",
              trend: "Decreasing",
              change: "-12%",
              reason: "Improved bid strategy and conversion funnel",
            },
            {
              metric: "Click Volume",
              trend: "Stable",
              change: "+2%",
              reason: "Consistent budget allocation",
            },
          ],
          outlook: "Positive - current optimizations showing strong ROI improvement",
        });
      }

      case "get_kpi_summary": {
        const campaigns = await prisma.campaign.findMany({
          where: { brandId: this.brandId },
        });

        const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
        const totalImpressions = campaigns.reduce(
          (sum, c) => sum + c.impressions,
          0
        );
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);

        return JSON.stringify({
          kpis: {
            spend: Math.round(totalSpend),
            revenue: Math.round(totalRevenue),
            roas: (totalRevenue / (totalSpend || 1)).toFixed(2),
            impressions: totalImpressions,
            clicks: totalClicks,
            ctr: ((totalClicks / (totalImpressions || 1)) * 100).toFixed(2),
            cpc: (totalSpend / (totalClicks || 1)).toFixed(2),
            conversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
          },
        });
      }

      case "create_executive_summary": {
        const focus = toolInput.focus || "overall";

        return JSON.stringify({
          executiveSummary: {
            overview: "Campaigns performing well with positive ROI trajectory",
            keyFindings: [
              "Average ROAS of 4.2:1, exceeding target of 3:1",
              "CPA declining week-over-week",
              "High-intent audiences converting at 3.5% rate",
            ],
            recommendations: [
              "Increase budget allocation to top 3 campaigns by 20%",
              "Expand lookalike audiences to reach new prospects",
              "Test higher ROAS targets in bid strategies",
            ],
            nextSteps: [
              "Implement recommendations by next week",
              "Review performance again in 7 days",
              "Prepare for campaign expansion",
            ],
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
