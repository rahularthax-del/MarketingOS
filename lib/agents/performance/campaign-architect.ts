import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class CampaignArchitect extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Campaign Architect", "PERFORMANCE_ARCHITECT", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Campaign Architect on a 5-person performance marketing team.

Your role:
- Design campaign structure and hierarchy
- Define target audiences and segments
- Recommend platform-specific strategies
- Set up conversion tracking
- Create campaign roadmaps

You have access to tools to:
- Create campaign structures
- Define audience segments
- Get platform specs
- Build campaign roadmaps

Always design scalable, testable campaign structures.
For new accounts, recommend a simple launch structure.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_platform_specs",
        description: "Get platform-specific requirements and best practices",
        input_schema: {
          type: "object",
          properties: {
            platform: {
              type: "string",
              description: "Platform (meta, google, linkedin)",
            },
          },
          required: ["platform"],
        },
      },
      {
        name: "create_audience_segments",
        description: "Define audience segments for targeting",
        input_schema: {
          type: "object",
          properties: {
            targetAudience: {
              type: "string",
              description: "Primary target audience description",
            },
          },
          required: ["targetAudience"],
        },
      },
      {
        name: "design_campaign_structure",
        description: "Design the campaign hierarchy and structure",
        input_schema: {
          type: "object",
          properties: {
            campaignName: {
              type: "string",
              description: "Name of the campaign",
            },
            objective: {
              type: "string",
              description: "Campaign objective",
            },
          },
          required: ["campaignName", "objective"],
        },
      },
      {
        name: "setup_conversion_tracking",
        description: "Create conversion tracking plan",
        input_schema: {
          type: "object",
          properties: {
            conversionEvents: {
              type: "array",
              items: { type: "string" },
              description: "Key conversion events to track",
            },
          },
          required: ["conversionEvents"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_platform_specs": {
        const platform = toolInput.platform || "meta";

        const specs: Record<string, any> = {
          meta: {
            minDailyBudget: 5,
            adFormats: [
              "Image",
              "Video",
              "Carousel",
              "Collection",
              "Instant Experience",
            ],
            audiences: "Broad, Interest, Lookalike, Custom",
            placements: "Feed, Stories, Reels, Audience Network",
          },
          google: {
            minDailyBudget: 10,
            campaignTypes: [
              "Search",
              "Display",
              "Shopping",
              "Performance Max",
            ],
            audiences: "Affinity, Intent, Detailed Demographics",
            placements: "Search Network, Display Network, YouTube",
          },
          linkedin: {
            minDailyBudget: 10,
            adFormats: ["Sponsored Content", "InMail", "Lead Gen Forms"],
            audiences: "Job Title, Company, Industry, Skills",
            placements: "Feed, Sidebar",
          },
        };

        return JSON.stringify(specs[platform] || specs.meta);
      }

      case "create_audience_segments": {
        return JSON.stringify({
          success: true,
          segments: [
            {
              name: "High-Intent",
              description:
                "Recently engaged, high purchase probability",
              targeting: "Past visitors, engaged users",
              size: "Small, high conversion potential",
            },
            {
              name: "Awareness",
              description: "Broad audience discovery",
              targeting: "Interest-based, lookalike audiences",
              size: "Large, for brand awareness",
            },
            {
              name: "Retargeting",
              description: "Previous website visitors",
              targeting: "Website pixel audiences",
              size: "Medium, warm audiences",
            },
          ],
        });
      }

      case "design_campaign_structure": {
        return JSON.stringify({
          success: true,
          structure: {
            campaignName: toolInput.campaignName,
            objective: toolInput.objective,
            adSets: [
              {
                name: "Audience 1 - High Intent",
                budget: "50%",
                audience: "High-intent users",
              },
              {
                name: "Audience 2 - Awareness",
                budget: "30%",
                audience: "Broad interest match",
              },
              {
                name: "Audience 3 - Retargeting",
                budget: "20%",
                audience: "Website visitors",
              },
            ],
            testStrategy: "A/B test creative and audiences",
          },
        });
      }

      case "setup_conversion_tracking": {
        const events = toolInput.conversionEvents || [
          "ViewContent",
          "AddToCart",
          "Purchase",
        ];

        return JSON.stringify({
          success: true,
          tracking: {
            events,
            implementation: "Pixel/API setup required",
            valueTracking: true,
            attributionWindow: "7-day click, 1-day view",
            verification: "Test conversions before launch",
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
