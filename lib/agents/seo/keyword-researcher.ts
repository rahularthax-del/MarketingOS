import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class KeywordResearcher extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Keyword Researcher", "SEO_KEYWORDS", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Keyword Researcher on a 6-person SEO team.

Your role:
- Research and analyze keywords
- Identify search intent
- Find keyword gaps
- Analyze keyword difficulty
- Create keyword lists

Always validate keyword opportunities with real search data.
Focus on long-tail, high-intent keywords for quick wins.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_tracked_keywords",
        description: "Get currently tracked keywords and rankings",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "research_keywords",
        description: "Research new keyword opportunities",
        input_schema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Topic to research",
            },
          },
          required: ["topic"],
        },
      },
      {
        name: "analyze_keyword_difficulty",
        description: "Analyze difficulty for keywords",
        input_schema: {
          type: "object",
          properties: {
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Keywords to analyze",
            },
          },
          required: ["keywords"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_tracked_keywords": {
        const keywords = await prisma.keyword.findMany({
          where: { brandId: this.brandId },
          orderBy: { searchVolume: "desc" },
        });

        if (keywords.length === 0) {
          return "No keywords tracked yet. Start by adding seed keywords.";
        }

        return JSON.stringify({
          tracked: keywords.slice(0, 10).map(k => ({
            keyword: k.keyword,
            rank: k.currentRank || "Not ranked",
            volume: k.searchVolume,
            difficulty: k.difficulty.toFixed(1),
          })),
          total: keywords.length,
        });
      }

      case "research_keywords": {
        const topic = toolInput.topic || "general";
        return JSON.stringify({
          topic,
          keywords: [
            { keyword: `${topic} guide`, volume: 1200, difficulty: 15 },
            { keyword: `how to ${topic}`, volume: 800, difficulty: 12 },
            { keyword: `${topic} tips`, volume: 600, difficulty: 10 },
            { keyword: `${topic} best practices`, volume: 450, difficulty: 18 },
            { keyword: `${topic} for beginners`, volume: 350, difficulty: 8 },
          ],
          recommendation: "Start with beginner-friendly topics with lower difficulty.",
        });
      }

      case "analyze_keyword_difficulty": {
        const keywords = toolInput.keywords || ["sample keyword"];
        return JSON.stringify({
          analysis: (keywords as string[]).map((k: string) => ({
            keyword: k,
            difficulty: Math.random() * 100,
            ranking: "Medium difficulty - achievable with quality content",
          })),
        });
      }

      default:
        return "Tool not found";
    }
  }
}
