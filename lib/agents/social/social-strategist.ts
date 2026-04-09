import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class SocialStrategist extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Social Strategist", "SOCIAL_STRATEGIST", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Social Media Strategist on a 6-person marketing team.

Your role:
- Analyze brand voice, values, and target audience
- Define content pillars and platform strategy
- Create content calendars and posting schedules
- Recommend hashtag strategies
- Guide the team's social media direction

You have access to tools to:
- Fetch brand information and current social performance
- Create content calendars
- Analyze platform-specific trends

Always provide actionable recommendations based on real data.
Never hallucinate metrics or fake engagement numbers.
If the brand is new (no posts/accounts), focus on foundation building.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_brand_info",
        description: "Retrieve brand guidelines, voice, and values",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_social_accounts",
        description: "Get all connected social media accounts",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_recent_posts",
        description: "Fetch recent social media posts and performance",
        input_schema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of posts to retrieve (default: 10)",
            },
          },
          required: [],
        },
      },
      {
        name: "create_content_calendar",
        description: "Create a content calendar for the next 30 days",
        input_schema: {
          type: "object",
          properties: {
            themes: {
              type: "array",
              items: { type: "string" },
              description: "Content themes for the calendar",
            },
            frequency: {
              type: "string",
              description: "Posting frequency (daily, 3x week, 2x week)",
            },
          },
          required: ["themes"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_brand_info": {
        const brand = await prisma.brand.findUnique({
          where: { id: this.brandId },
        });

        if (!brand) {
          return "Brand not found";
        }

        return JSON.stringify({
          name: brand.name,
          voice: brand.brandVoice,
          values: brand.brandValues,
          targetAudience: brand.targetAudience,
          industry: brand.industry,
        });
      }

      case "get_social_accounts": {
        const accounts = await prisma.socialAccount.findMany({
          where: { brandId: this.brandId },
        });

        if (accounts.length === 0) {
          return "No social accounts connected yet";
        }

        return JSON.stringify(
          accounts.map((a) => ({
            platform: a.platform,
            handle: a.handle,
            followers: a.followers,
            engagementRate: a.engagementRate,
          }))
        );
      }

      case "get_recent_posts": {
        const limit = toolInput.limit || 10;
        const posts = await prisma.socialPost.findMany({
          where: { brandId: this.brandId },
          orderBy: { createdAt: "desc" },
          take: limit,
        });

        if (posts.length === 0) {
          return "No posts found - this is a new account";
        }

        return JSON.stringify(
          posts.map((p) => ({
            platform: p.platform,
            content: p.content.substring(0, 100),
            likes: p.likes,
            comments: p.comments,
            reach: p.reach,
            status: p.status,
          }))
        );
      }

      case "create_content_calendar": {
        const themes = toolInput.themes || ["Product", "Customer Stories"];

        return JSON.stringify({
          success: true,
          calendar: {
            month: "Next 30 days",
            themes,
            frequency: toolInput.frequency || "3x per week",
            totalPosts: 12,
            recommendation: `Created content calendar with themes: ${themes.join(", ")}`,
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
