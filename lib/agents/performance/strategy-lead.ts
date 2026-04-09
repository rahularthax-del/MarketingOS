import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class StrategyLead extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Strategy Lead", "PERFORMANCE_STRATEGY", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Strategy Lead on a 5-person performance marketing team.

Your role:
- Develop campaign strategies aligned with business goals
- Recommend budget allocation across platforms
- Define campaign objectives and KPIs
- Analyze market opportunities
- Plan campaign roadmap

You have access to tools to:
- Analyze current campaigns
- Get budget recommendations
- Create campaign strategies
- Track business goals

Always provide data-driven recommendations.
For new accounts, recommend a launch strategy with realistic goals.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_brand_info",
        description: "Retrieve brand info and target audience",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "analyze_current_campaigns",
        description: "Analyze existing campaigns and performance",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_campaign_strategy",
        description: "Create a comprehensive campaign strategy",
        input_schema: {
          type: "object",
          properties: {
            objective: {
              type: "string",
              description: "Campaign objective (awareness, consideration, conversion, retention)",
            },
            budget: {
              type: "number",
              description: "Monthly budget in USD",
            },
            timeframe: {
              type: "string",
              description: "Campaign duration (e.g., 30 days, 90 days, 1 year)",
            },
          },
          required: ["objective"],
        },
      },
      {
        name: "recommend_budget_allocation",
        description: "Recommend how to split budget across platforms",
        input_schema: {
          type: "object",
          properties: {
            totalBudget: {
              type: "number",
              description: "Total monthly budget",
            },
            platforms: {
              type: "array",
              items: { type: "string" },
              description: "Target platforms (meta, google, linkedin)",
            },
          },
          required: ["totalBudget"],
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

        return JSON.stringify({
          name: brand?.name,
          industry: brand?.industry,
          targetAudience: brand?.targetAudience,
          website: brand?.website,
        });
      }

      case "analyze_current_campaigns": {
        const campaigns = await prisma.campaign.findMany({
          where: { brandId: this.brandId },
        });

        if (campaigns.length === 0) {
          return "No campaigns yet - this is a new account. Recommend starting with a launch campaign.";
        }

        const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
        const avgRoas =
          campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;

        return JSON.stringify({
          totalCampaigns: campaigns.length,
          totalSpend: Math.round(totalSpend),
          totalRevenue: Math.round(totalRevenue),
          avgRoas: avgRoas.toFixed(2),
          recommendations: [
            "Optimize highest ROAS campaigns with increased budget",
            "Pause underperforming campaigns",
            "Test new audiences in top performing campaigns",
          ],
        });
      }

      case "create_campaign_strategy": {
        const platforms = ["meta_ads", "google_ads"];

        return JSON.stringify({
          success: true,
          strategy: {
            objective: toolInput.objective || "conversion",
            budget: toolInput.budget || 1000,
            timeframe: toolInput.timeframe || "30 days",
            platforms,
            phases: [
              {
                phase: "Setup & Learning",
                duration: "7 days",
                focus: "Account setup, audience definition, creative testing",
              },
              {
                phase: "Optimization",
                duration: "14 days",
                focus: "Scale winners, pause losers, budget reallocation",
              },
              {
                phase: "Scale",
                duration: "9 days",
                focus: "Increase budgets on top performers",
              },
            ],
            kpis: ["ROAS", "CPA", "CTR", "Conversion Rate"],
          },
        });
      }

      case "recommend_budget_allocation": {
        const budget = toolInput.totalBudget || 1000;
        const platforms = toolInput.platforms || ["meta", "google"];

        const allocation: Record<string, number> = {};
        if (platforms.includes("meta")) allocation.meta = Math.round(budget * 0.4);
        if (platforms.includes("google")) allocation.google = Math.round(budget * 0.4);
        if (platforms.includes("linkedin")) allocation.linkedin = Math.round(budget * 0.2);

        return JSON.stringify({
          totalBudget: budget,
          allocation,
          reasoning:
            "Meta provides broad reach, Google captures high-intent searchers, LinkedIn targets B2B. Adjust based on your audience.",
        });
      }

      default:
        return "Tool not found";
    }
  }
}
