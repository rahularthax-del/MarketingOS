import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class ContentWriter extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Content Writer", "SEO_CONTENT", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Content Writer on a 6-person SEO team.

Your role:
- Create SEO-optimized content
- Write for target keywords
- Ensure content quality and readability
- Structure content for featured snippets
- Create content outlines

Always prioritize user value over keyword stuffing.
Create content people want to read and share.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_content_ideas",
        description: "Get content ideas for target keywords",
        input_schema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Target keyword",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "create_content_outline",
        description: "Create an optimized content outline",
        input_schema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Target keyword",
            },
            intent: {
              type: "string",
              description: "Search intent (informational, commercial, etc)",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "analyze_gap_content",
        description: "Identify content gaps to fill",
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
      case "get_content_ideas": {
        const keyword = toolInput.keyword || "topic";

        return JSON.stringify({
          ideas: [
            {
              title: `${keyword} Guide: Everything You Need to Know`,
              type: "Comprehensive guide",
              targetLength: "2000+ words",
            },
            {
              title: `${keyword}: Step-by-Step Beginner Tutorial`,
              type: "Tutorial",
              targetLength: "1500+ words",
            },
            {
              title: `Top Tools for ${keyword} [Reviewed in 2024]`,
              type: "Comparison",
              targetLength: "1800+ words",
            },
            {
              title: `Common ${keyword} Mistakes and How to Avoid Them`,
              type: "Problem-solution",
              targetLength: "1200+ words",
            },
          ],
          recommendation: "Start with comprehensive guides - they rank well and provide value.",
        });
      }

      case "create_content_outline": {
        const keyword = toolInput.keyword || "topic";

        return JSON.stringify({
          outline: {
            keyword,
            intent: toolInput.intent || "informational",
            sections: [
              {
                section: "Introduction",
                points: [
                  "What is [keyword]",
                  "Why it matters",
                  "What you'll learn",
                ],
              },
              {
                section: "Fundamentals",
                points: [
                  "Core concepts",
                  "Key terminology",
                  "Common misconceptions",
                ],
              },
              {
                section: "How-to / Implementation",
                points: [
                  "Step-by-step guide",
                  "Tools and resources",
                  "Best practices",
                ],
              },
              {
                section: "Advanced Tips",
                points: [
                  "Pro strategies",
                  "Common challenges",
                  "Optimization tips",
                ],
              },
              {
                section: "Conclusion",
                points: ["Key takeaways", "Next steps", "Resources"],
              },
            ],
            estimatedLength: "1500-2000 words",
            features: ["Code examples", "Visual aids", "Data/stats"],
          },
        });
      }

      case "analyze_gap_content": {
        const contentPieces = await prisma.contentPiece.findMany({
          where: { brandId: this.brandId },
        });

        if (contentPieces.length === 0) {
          return "No content yet. Start by creating foundational content around your main topics.";
        }

        return JSON.stringify({
          gapAnalysis: {
            coveredTopics: contentPieces.length,
            gaps: [
              "Long-tail keyword variations not covered",
              "Related subtopics missing",
              "Comparison content needed",
            ],
            opportunities: [
              "Create pillar content around main topics",
              "Add cluster content for long-tails",
              "Update old content with new information",
            ],
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
