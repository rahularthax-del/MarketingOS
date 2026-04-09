import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class BidOptimizer extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Bid Optimizer", "PERFORMANCE_BIDDING", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Bid Optimizer on a 5-person performance marketing team.

Your role:
- Optimize bidding strategies for maximum ROI
- Manage daily/campaign budgets
- Analyze cost metrics (CPC, CPA, CPM)
- Recommend budget reallocations
- Maximize spend efficiency

You have access to tools to:
- Analyze cost metrics
- Recommend bidding strategies
- Calculate optimal budgets
- Track spend efficiency

Always optimize for your target metric (ROAS, CPA, ROI).
Use data to inform every bidding decision.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "analyze_cost_metrics",
        description: "Analyze current cost metrics across campaigns",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "recommend_bidding_strategy",
        description: "Recommend optimal bidding strategy",
        input_schema: {
          type: "object",
          properties: {
            objective: {
              type: "string",
              description: "Optimization goal (max_clicks, target_cpa, target_roas)",
            },
            budget: {
              type: "number",
              description: "Available budget",
            },
          },
          required: ["objective"],
        },
      },
      {
        name: "calculate_optimal_cpa",
        description: "Calculate optimal CPA bid based on business metrics",
        input_schema: {
          type: "object",
          properties: {
            avgOrderValue: {
              type: "number",
              description: "Average order value in USD",
            },
            targetMargin: {
              type: "number",
              description: "Target profit margin (%)",
            },
          },
          required: ["avgOrderValue"],
        },
      },
      {
        name: "allocate_budget",
        description: "Recommend budget allocation across performers",
        input_schema: {
          type: "object",
          properties: {
            totalBudget: {
              type: "number",
              description: "Total budget to allocate",
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
      case "analyze_cost_metrics": {
        const campaigns = await prisma.campaign.findMany({
          where: { brandId: this.brandId },
        });

        if (campaigns.length === 0) {
          return "No campaigns yet. Establish baseline campaigns first to analyze cost metrics.";
        }

        const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
        const totalConversions = campaigns.reduce(
          (sum, c) => sum + c.conversions,
          0
        );
        const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
        const avgCpa =
          totalConversions > 0 ? totalSpend / totalConversions : 0;

        return JSON.stringify({
          avgCpc: avgCpc.toFixed(2),
          avgCpa: avgCpa.toFixed(2),
          avgCpm: "TBD with impression data",
          impressions: "Need impression tracking",
          ctr: ((totalClicks / 10000) * 100).toFixed(2),
          conversionRate: ((totalConversions / totalClicks) * 100).toFixed(2),
          opportunities: [
            "Increase bids on top converting campaigns",
            "Reduce bids on high CPA underperformers",
            "Test automated bidding strategies",
          ],
        });
      }

      case "recommend_bidding_strategy": {
        const objective = toolInput.objective || "target_roas";
        const budget = toolInput.budget || 1000;

        const strategies: Record<string, any> = {
          max_clicks: {
            name: "Maximize Clicks",
            setup: "Set daily budget, let platform optimize for clicks",
            bestFor: "Traffic and awareness campaigns",
            recommendation: "Good for new campaigns needing volume",
          },
          target_cpa: {
            name: "Target CPA",
            setup: `Set target CPA to 15-20% of AOV`,
            bestFor: "Conversion and lead generation",
            recommendation: "Requires conversion tracking data",
          },
          target_roas: {
            name: "Target ROAS",
            setup: "Set target ROAS (e.g., 4:1, 5:1)",
            bestFor: "E-commerce and ROI-focused",
            recommendation: "Most effective with mature campaigns",
          },
          manual_cpc: {
            name: "Manual CPC",
            setup: "Set bids manually by keyword/placement",
            bestFor: "Precise control and testing",
            recommendation: "Labor-intensive but highly controllable",
          },
        };

        return JSON.stringify(strategies[objective] || strategies.target_roas);
      }

      case "calculate_optimal_cpa": {
        const aov = toolInput.avgOrderValue || 100;
        const margin = toolInput.targetMargin || 30;

        const maxCpa = (aov * margin) / 100;
        const recommendedCpa = maxCpa * 0.75;

        return JSON.stringify({
          avgOrderValue: aov,
          targetMargin: margin,
          maxCpa: maxCpa.toFixed(2),
          recommendedCpa: recommendedCpa.toFixed(2),
          reasoning:
            "Max CPA is 30% of AOV. Recommended is 75% of max to maintain profitability.",
        });
      }

      case "allocate_budget": {
        const budget = toolInput.totalBudget || 1000;

        return JSON.stringify({
          totalBudget: budget,
          allocation: {
            topPerformers: {
              budget: Math.round(budget * 0.5),
              action: "Scale - increase by 20-30%",
            },
            testing: {
              budget: Math.round(budget * 0.3),
              action: "Test new audiences and creative",
            },
            retargeting: {
              budget: Math.round(budget * 0.2),
              action: "Convert warm audiences",
            },
          },
          recommendation:
            "Review weekly. Shift budget from underperformers to winners every 3-5 days.",
        });
      }

      default:
        return "Tool not found";
    }
  }
}
