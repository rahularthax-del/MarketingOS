import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class SeoStrategist extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("SEO Strategist", "SEO_STRATEGY", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the SEO Strategist on a 6-person SEO team.

Your role:
- Develop comprehensive SEO strategy
- Identify content opportunities
- Analyze competitive landscape
- Create content pillars
- Plan SEO roadmap

You have access to tools to:
- Analyze current SEO status
- Identify keyword opportunities
- Create SEO strategy
- Plan content roadmap

Always focus on sustainable, organic growth.
For new sites, recommend foundation SEO work first.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "analyze_seo_status",
        description: "Analyze current SEO performance and health",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "identify_keyword_opportunities",
        description: "Find keyword gaps and opportunities",
        input_schema: {
          type: "object",
          properties: {
            industry: {
              type: "string",
              description: "Industry or niche",
            },
          },
          required: [],
        },
      },
      {
        name: "create_seo_roadmap",
        description: "Create a comprehensive SEO roadmap",
        input_schema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              description: "Strategy timeframe (3 months, 6 months, 1 year)",
            },
          },
          required: [],
        },
      },
      {
        name: "analyze_competition",
        description: "Analyze competitor SEO strategies",
        input_schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: { type: "string" },
              description: "Competitor domains to analyze",
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
      case "analyze_seo_status": {
        const brand = await prisma.brand.findUnique({
          where: { id: this.brandId },
        });

        const keywords = await prisma.keyword.findMany({
          where: { brandId: this.brandId },
          take: 10,
        });

        if (keywords.length === 0) {
          return "No keyword tracking data yet. Site is new. Recommend starting with seed keywords and content foundation.";
        }

        const avgRank = keywords.length > 0
          ? keywords.reduce((sum, k) => sum + (k.currentRank || 999), 0) / keywords.length
          : 0;
        const topRanking = keywords.filter(k => (k.currentRank || 999) <= 10).length;

        return JSON.stringify({
          website: brand?.website,
          keywordsTracked: keywords.length,
          avgRank: avgRank < 999 ? Math.round(avgRank) : "No ranking data",
          topRankings: topRanking,
          recommendations: [
            "Focus on long-tail keywords with lower competition",
            "Improve content for keywords ranking 11-50",
            "Build more backlinks to improve authority",
          ],
        });
      }

      case "identify_keyword_opportunities": {
        return JSON.stringify({
          opportunities: [
            {
              keyword: "Industry + Problem + Solution",
              volume: "High",
              difficulty: "Medium",
              intent: "Commercial",
              potential: "High",
            },
            {
              keyword: "Niche + Guides",
              volume: "Medium",
              difficulty: "Low",
              intent: "Informational",
              potential: "High",
            },
            {
              keyword: "Brand + Comparison",
              volume: "Medium",
              difficulty: "Medium",
              intent: "Comparison",
              potential: "Medium",
            },
            {
              keyword: "Industry + FAQ",
              volume: "High",
              difficulty: "Low",
              intent: "Informational",
              potential: "High",
            },
          ],
          recommendation: "Start with low-difficulty, high-volume informational keywords to build authority.",
        });
      }

      case "create_seo_roadmap": {
        return JSON.stringify({
          roadmap: {
            timeframe: toolInput.timeframe || "6 months",
            phases: [
              {
                phase: "Foundation (Weeks 1-4)",
                focus: "Fix technical SEO, optimize core pages",
                tasks: [
                  "Site audit and fixes",
                  "Optimize title tags and meta descriptions",
                  "Improve site speed",
                  "Set up Google Search Console",
                ],
              },
              {
                phase: "Content (Weeks 5-12)",
                focus: "Create content for seed keywords",
                tasks: [
                  "Target 20 seed keywords",
                  "Create 10-15 comprehensive guides",
                  "Build internal linking strategy",
                ],
              },
              {
                phase: "Authority (Weeks 13-24)",
                focus: "Build backlinks and authority",
                tasks: [
                  "Guest post on authority sites",
                  "Build resource pages",
                  "Reach out for backlinks",
                ],
              },
            ],
          },
        });
      }

      case "analyze_competition": {
        return JSON.stringify({
          analysis: {
            competitors: toolInput.competitors || [],
            findings: {
              topKeywords: ["competitor targets these keywords"],
              contentGaps: "You can target these gaps",
              backlinks: "Analyze where competitors get backlinks",
              authority: "Your competitive advantage areas",
            },
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
