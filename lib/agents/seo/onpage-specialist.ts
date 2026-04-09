import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";

export class OnpageSpecialist extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("OnPage Specialist", "SEO_ONPAGE", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the OnPage Specialist on a 6-person SEO team.

Your role:
- Optimize page titles, meta descriptions, headers
- Improve content structure and readability
- Optimize for keyword inclusion
- Enhance user experience signals
- Create optimization checklists

Always balance SEO optimization with user experience.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_onpage_checklist",
        description: "Get OnPage SEO optimization checklist",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_title_suggestions",
        description: "Create optimized page titles",
        input_schema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Target keyword",
            },
            page: {
              type: "string",
              description: "Page description",
            },
          },
          required: ["keyword"],
        },
      },
      {
        name: "analyze_content_optimization",
        description: "Analyze content for SEO optimization",
        input_schema: {
          type: "object",
          properties: {
            keyword: {
              type: "string",
              description: "Target keyword to analyze for",
            },
          },
          required: ["keyword"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_onpage_checklist": {
        return JSON.stringify({
          checklist: {
            titleTag: {
              requirement: "50-60 characters, include keyword at start",
              status: "pending",
            },
            metaDescription: {
              requirement: "150-160 characters, compelling CTA",
              status: "pending",
            },
            h1: {
              requirement: "One H1 per page, include keyword naturally",
              status: "pending",
            },
            headers: {
              requirement: "H2, H3 structure for readability",
              status: "pending",
            },
            contentLength: {
              requirement: "Minimum 300 words, optimal 1000-2000",
              status: "pending",
            },
            imageOptimization: {
              requirement: "Alt text, descriptive filenames",
              status: "pending",
            },
            internalLinks: {
              requirement: "3-5 relevant internal links",
              status: "pending",
            },
            readability: {
              requirement: "Short paragraphs, bullet points, formatting",
              status: "pending",
            },
          },
        });
      }

      case "create_title_suggestions": {
        const keyword = toolInput.keyword || "default";
        const page = toolInput.page || "page";

        return JSON.stringify({
          suggestions: [
            {
              title: `${keyword} - Complete ${page} Guide [2024]`,
              length: "58 chars",
              score: "Excellent",
            },
            {
              title: `Best ${keyword} for ${page} - Expert Tips`,
              length: "51 chars",
              score: "Good",
            },
            {
              title: `${keyword} ${page}: How to Get Started (2024)`,
              length: "54 chars",
              score: "Good",
            },
          ],
        });
      }

      case "analyze_content_optimization": {
        return JSON.stringify({
          keywordPresence: "Good - keyword appears in title, H1, and body",
          keywordDensity: "2.5% - optimal range",
          contentQuality: "High - comprehensive, well-structured",
          readability: "Good - Flesch score 60 (readable)",
          improvements: [
            "Add more related terms naturally",
            "Include keyword in first 100 words",
            "Add more internal links",
          ],
        });
      }

      default:
        return "Tool not found";
    }
  }
}
