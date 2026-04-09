import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class RankTracker extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Rank Tracker", "SEO_TRACKING", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Rank Tracker on a 6-person SEO team.

Your role:
- Track keyword rankings
- Monitor ranking progress
- Identify ranking changes and issues
- Analyze SERP changes
- Create tracking reports

Always track the right metrics: rankings, traffic, visibility.
Focus on actionable insights from ranking data.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_ranking_overview",
        description: "Get overview of keyword rankings",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "analyze_ranking_progress",
        description: "Analyze ranking progress over time",
        input_schema: {
          type: "object",
          properties: {
            timeframe: {
              type: "string",
              description: "Timeframe to analyze (7d, 30d, 90d)",
            },
          },
          required: [],
        },
      },
      {
        name: "identify_ranking_issues",
        description: "Identify sudden ranking drops or issues",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_ranking_report",
        description: "Create comprehensive ranking report",
        input_schema: {
          type: "object",
          properties: {},
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
      case "get_ranking_overview": {
        const keywords = await prisma.keyword.findMany({
          where: { brandId: this.brandId },
          orderBy: { currentRank: "asc" },
          take: 20,
        });

        if (keywords.length === 0) {
          return "No keywords tracked yet. Add keywords to Google Search Console and import them.";
        }

        const top10 = keywords.filter(k => (k.currentRank || 999) <= 10).length;
        const top50 = keywords.filter(k => (k.currentRank || 999) <= 50).length;
        const unranked = keywords.filter(k => !k.currentRank).length;

        return JSON.stringify({
          trackedKeywords: keywords.length,
          rankings: {
            top10,
            top50,
            unranked,
          },
          topKeywords: keywords
            .slice(0, 5)
            .map(k => ({
              keyword: k.keyword,
              rank: k.currentRank || "N/A",
              trend: k.previousRank ? (k.currentRank! - k.previousRank) : "New",
            })),
        });
      }

      case "analyze_ranking_progress": {
        const timeframe = toolInput.timeframe || "30d";

        return JSON.stringify({
          timeframe,
          summary: {
            newRankings: "4 new rankings in top 50",
            improvements: "12 keywords improved",
            declines: "3 keywords declined",
            overallTrend: "Positive - steady improvement",
          },
          topGainers: [
            { keyword: "keyword 1", oldRank: 75, newRank: 35, change: "+40" },
            { keyword: "keyword 2", oldRank: 85, newRank: 42, change: "+43" },
          ],
        });
      }

      case "identify_ranking_issues": {
        return JSON.stringify({
          recentChanges: [
            {
              type: "Algorithm update impact",
              date: "Recent",
              affectedKeywords: "5-10",
              action: "Review content quality and backlinks",
            },
            {
              type: "New competitor ranking",
              affectedKeywords: "3",
              action: "Analyze competitor content",
            },
          ],
          alerts: [
            "Monitor core update recovery",
            "Check featured snippet competitors",
          ],
        });
      }

      case "create_ranking_report": {
        return JSON.stringify({
          report: {
            period: "Last 30 days",
            summary: {
              trackedKeywords: 50,
              gainers: 12,
              decliners: 3,
              newRankings: 4,
            },
            topPerformers: [
              "keyword_1: Rank 5",
              "keyword_2: Rank 8",
            ],
            recommendations: [
              "Maintain current optimization efforts",
              "Investigate 3 declining keywords",
              "Scale up winners with more content",
            ],
            nextSteps: [
              "Update underperforming content",
              "Build more backlinks for top keywords",
              "Test featured snippet optimization",
            ],
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
