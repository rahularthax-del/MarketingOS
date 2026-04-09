import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class AnalyticsSpecialist extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Analytics Specialist", "SOCIAL_ANALYTICS", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Analytics Specialist on a 6-person social media marketing team.

Your role:
- Track and analyze social media performance
- Identify best-performing content types
- Recommend optimal posting times
- Measure ROI and reach
- Provide data-driven insights

You have access to tools to:
- Fetch performance data
- Analyze content effectiveness
- Identify trends
- Generate reports

Always base recommendations on real data, not assumptions.
Focus on actionable metrics and clear insights.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_performance_data",
        description: "Get social media performance data",
        input_schema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              description: "Time period (last_7_days, last_30_days, all)",
            },
          },
          required: [],
        },
      },
      {
        name: "analyze_content_performance",
        description: "Analyze which content types perform best",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_best_posting_times",
        description: "Determine optimal posting times",
        input_schema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              description: "Social platform to analyze",
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
      case "get_performance_data": {
        const posts = await prisma.socialPost.findMany({
          where: { brandId: this.brandId },
          orderBy: { createdAt: "desc" },
        });

        if (posts.length === 0) {
          return "No posts yet - create content first to collect performance data";
        }

        const totalReach = posts.reduce((sum, p) => sum + (p.reach || 0), 0);
        const totalImpressions = posts.reduce(
          (sum, p) => sum + (p.impressions || 0),
          0
        );
        const totalEngagement = posts.reduce(
          (sum, p) => sum + (p.likes + p.comments + p.shares),
          0
        );

        const avgReach = totalReach / posts.length;
        const engagementRate =
          totalImpressions > 0 ? (totalEngagement / totalImpressions) * 100 : 0;

        return JSON.stringify({
          totalPosts: posts.length,
          totalReach: Math.round(totalReach),
          totalImpressions: Math.round(totalImpressions),
          totalEngagement,
          avgReachPerPost: Math.round(avgReach),
          engagementRate: engagementRate.toFixed(2),
        });
      }

      case "analyze_content_performance": {
        const posts = await prisma.socialPost.findMany({
          where: { brandId: this.brandId },
        });

        if (posts.length < 3) {
          return "Not enough data - need at least 3 posts for analysis";
        }

        const topPost = posts.reduce((top, current) => {
          const currentEngagement =
            current.likes + current.comments + current.shares;
          const topEngagement = top.likes + top.comments + top.shares;
          return currentEngagement > topEngagement ? current : top;
        });

        return JSON.stringify({
          topPerformingPost: {
            platform: topPost.platform,
            engagement: topPost.likes + topPost.comments + topPost.shares,
            reach: topPost.reach,
          },
          recommendation:
            "Content with more specific topics and clear CTAs tends to perform better. Consider creating more similar content.",
        });
      }

      case "get_best_posting_times": {
        const platform = toolInput.platform || "instagram";

        const bestTimes: Record<string, string> = {
          instagram: "Tuesday-Thursday, 9-10 AM and 6-8 PM",
          facebook: "Thursday, 8-10 AM and 1-3 PM",
          twitter: "9 AM - 3 PM on weekdays",
          linkedin: "Tuesday-Thursday, 7-9 AM",
          tiktok: "6-10 PM on weekdays",
        };

        return JSON.stringify({
          platform,
          bestTimes: bestTimes[platform] || "9 AM - 3 PM on weekdays",
          note: "These are general best practices. Monitor your specific audience for optimal times.",
        });
      }

      default:
        return "Tool not found";
    }
  }
}
