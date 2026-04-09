import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class CommunityManager extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Community Manager", "SOCIAL_COMMUNITY", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Community Manager on a 6-person social media marketing team.

Your role:
- Manage audience engagement and interactions
- Respond to comments and messages
- Build community and foster discussions
- Monitor trends and conversations
- Identify engagement opportunities

You have access to tools to:
- Fetch engagement metrics
- Monitor trending topics
- Create engagement strategies
- Track audience growth

Always focus on authentic engagement and community building.
Respond with empathy and brand voice consistency.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_engagement_metrics",
        description: "Get engagement metrics from social accounts",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_audience_insights",
        description: "Get insights about the audience",
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
      {
        name: "create_engagement_strategy",
        description: "Create an audience engagement strategy",
        input_schema: {
          type: "object",
          properties: {
            goal: {
              type: "string",
              description: "Engagement goal (e.g., increase replies, grow followers)",
            },
            timeframe: {
              type: "string",
              description: "Strategy timeframe (e.g., 30 days, quarterly)",
            },
          },
          required: ["goal"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_engagement_metrics": {
        const posts = await prisma.socialPost.findMany({
          where: { brandId: this.brandId },
          orderBy: { createdAt: "desc" },
          take: 10,
        });

        if (posts.length === 0) {
          return "No posts yet - create content first to build engagement";
        }

        const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);
        const totalComments = posts.reduce((sum, p) => sum + p.comments, 0);
        const totalShares = posts.reduce((sum, p) => sum + p.shares, 0);
        const avgEngagement =
          (totalLikes + totalComments + totalShares) / posts.length;

        return JSON.stringify({
          totalPosts: posts.length,
          totalLikes,
          totalComments,
          totalShares,
          avgEngagementPerPost: Math.round(avgEngagement),
          topPost: {
            likes: Math.max(...posts.map((p) => p.likes)),
            comments: Math.max(...posts.map((p) => p.comments)),
          },
        });
      }

      case "get_audience_insights": {
        const accounts = await prisma.socialAccount.findMany({
          where: { brandId: this.brandId },
        });

        if (accounts.length === 0) {
          return "No connected accounts - connect social accounts first";
        }

        const totalFollowers = accounts.reduce((sum, a) => sum + a.followers, 0);
        const avgEngagementRate =
          accounts.reduce((sum, a) => sum + a.engagementRate, 0) /
          accounts.length;

        return JSON.stringify({
          platforms: accounts.map((a) => ({
            platform: a.platform,
            handle: a.handle,
            followers: a.followers,
          })),
          totalFollowers,
          avgEngagementRate: avgEngagementRate.toFixed(2),
          recommendation:
            "Focus on consistent posting and audience engagement to grow followers",
        });
      }

      case "create_engagement_strategy": {
        return JSON.stringify({
          success: true,
          strategy: {
            goal: toolInput.goal,
            timeframe: toolInput.timeframe || "30 days",
            tactics: [
              "Post 3-5 times per week at optimal times",
              "Respond to all comments within 24 hours",
              "Create 1-2 engagement posts per week (polls, questions)",
              "Engage with audience content (like, comment, share)",
              "Feature user-generated content",
            ],
            metrics: [
              "Track reply rate",
              "Monitor engagement rate growth",
              "Measure follower growth",
            ],
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
