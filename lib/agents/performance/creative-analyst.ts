import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class CreativeAnalyst extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Creative Analyst", "PERFORMANCE_CREATIVE", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Creative Analyst on a 5-person performance marketing team.

Your role:
- Evaluate ad creative performance
- Recommend creative variations
- Test copy and messaging
- Analyze creative metrics
- Suggest creative improvements

You have access to tools to:
- Analyze creative performance
- Get creative best practices
- Recommend variations
- Create testing plans

Always base recommendations on performance data.
For new accounts, recommend starting creative strategies.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "analyze_creative_performance",
        description: "Analyze how different creatives are performing",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_creative_best_practices",
        description: "Get best practices for ad creative",
        input_schema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              description: "Platform (meta, google, linkedin)",
            },
            objective: {
              type: "string",
              description: "Campaign objective",
            },
          },
          required: ["platform"],
        },
      },
      {
        name: "recommend_creative_variations",
        description: "Recommend creative variations to test",
        input_schema: {
          type: "object",
          properties: {
            currentMessage: {
              type: "string",
              description: "Current ad copy or message",
            },
            objective: {
              type: "string",
              description: "Campaign objective",
            },
          },
          required: ["currentMessage"],
        },
      },
      {
        name: "create_testing_plan",
        description: "Create a creative testing plan",
        input_schema: {
          type: "object",
          properties: {
            variables: {
              type: "array",
              items: { type: "string" },
              description: "Elements to test (copy, image, cta, etc)",
            },
          },
          required: ["variables"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "analyze_creative_performance": {
        return JSON.stringify({
          insights: [
            {
              metric: "CTR",
              topPerformer: "Video creative",
              avgCtr: "2.5%",
            },
            {
              metric: "CPC",
              topPerformer: "Carousel ads",
              avgCpc: "$0.45",
            },
            {
              metric: "Conversion Rate",
              topPerformer: "Testimonial videos",
              conversionRate: "3.2%",
            },
          ],
          recommendation:
            "Video creative is outperforming images. Increase video budget allocation.",
        });
      }

      case "get_creative_best_practices": {
        const platform = toolInput.platform || "meta";
        const objective = toolInput.objective || "conversion";

        const practices: Record<string, any> = {
          meta: {
            imageSize: "1200x628px",
            videoLength: "15-30 seconds",
            copyLength: "125 characters",
            bestFormats: ["Video", "Carousel"],
            headlines: "Short, benefit-focused",
            cta: "Clear action (Learn More, Shop Now, Sign Up)",
          },
          google: {
            headlines: "3 required, 30 chars each",
            description: "2 required, 90 chars each",
            copyLength: "Keep concise and action-oriented",
            keywords: "Match user search intent",
            landing: "Ensure fast page load",
          },
          linkedin: {
            copyLength: "300-500 characters",
            cta: "Professional, B2B focused",
            images: "Professional, high quality",
            targeting: "Job title and company focused",
            messaging: "Value proposition focused",
          },
        };

        return JSON.stringify(practices[platform] || practices.meta);
      }

      case "recommend_creative_variations": {
        const message = toolInput.currentMessage || "Default message";

        return JSON.stringify({
          variations: [
            {
              name: "Variation A: Benefit-Focused",
              copy: `Save time with ${message}. Join 10K+ users.`,
              angle: "Efficiency and social proof",
            },
            {
              name: "Variation B: Problem-Solution",
              copy: `Tired of manual work? ${message} automates it.`,
              angle: "Problem awareness and solution",
            },
            {
              name: "Variation C: Urgency",
              copy: `Limited time: ${message} now for 50% off.`,
              angle: "Scarcity and urgency",
            },
            {
              name: "Variation D: Curiosity",
              copy: `Most brands don't know about ${message}. See why.`,
              angle: "Curiosity and differentiation",
            },
          ],
          testDuration: "7-14 days per variation",
        });
      }

      case "create_testing_plan": {
        const variables = toolInput.variables || ["copy", "image"];

        return JSON.stringify({
          testingPlan: {
            duration: "2 weeks",
            budget: "Split equally across variations",
            variables,
            metrics: ["CTR", "CPC", "Conversion Rate", "ROAS"],
            sampleSize: "At least 100 conversions per variation",
            winner: "Variation with highest ROAS by week 2",
            action: "Scale winner, pause underperformers",
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
