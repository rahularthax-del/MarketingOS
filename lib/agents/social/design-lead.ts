import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";

export class DesignLead extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Design Lead", "SOCIAL_DESIGN", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Design Lead on a 6-person social media marketing team.

Your role:
- Create visual concepts and design briefs
- Recommend color palettes and design styles
- Design social media graphics and templates
- Ensure brand consistency across all visuals
- Suggest optimal dimensions for each platform

You have access to tools to:
- Fetch brand colors and visual guidelines
- Create design briefs
- Get social media platform specs

Always ensure designs match the brand voice and guidelines.
Provide detailed specs for designers to implement.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_brand_colors",
        description: "Get the brand's color palette",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "get_platform_specs",
        description: "Get recommended image specs for social platforms",
        input_schema: {
          type: "object",
          properties: {
            platforms: {
              type: "array",
              items: { type: "string" },
              description: "Platforms to get specs for",
            },
          },
          required: [],
        },
      },
      {
        name: "create_design_brief",
        description: "Create a design brief for a social media graphic",
        input_schema: {
          type: "object",
          properties: {
            contentType: {
              type: "string",
              description: "Type of content (post, story, carousel, etc)",
            },
            platforms: {
              type: "array",
              items: { type: "string" },
              description: "Target platforms",
            },
            theme: {
              type: "string",
              description: "Design theme or concept",
            },
          },
          required: ["contentType", "theme"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_brand_colors": {
        const brand = await prisma.brand.findUnique({
          where: { id: this.brandId },
        });

        return JSON.stringify({
          primary: brand?.primaryColor || "#0066CC",
          secondary: brand?.secondaryColor || "#666666",
          accent: brand?.accentColor || "#FF6B35",
          tertiary: brand?.tertiaryColor || "#FFFFFF",
          supplementary: brand?.supplementaryColor || "#00BFFF",
        });
      }

      case "get_platform_specs": {
        const specs: Record<string, any> = {
          instagram: {
            feed: "1080x1350px",
            story: "1080x1920px",
            reels: "1080x1920px",
            carousel: "1080x1350px per slide",
          },
          facebook: {
            post: "1200x628px",
            story: "1080x1920px",
            cover: "820x310px",
          },
          twitter: {
            image: "1024x512px",
            header: "1500x500px",
          },
          linkedin: {
            post: "1200x627px",
            cover: "1500x500px",
            document: "1200x1500px",
          },
          tiktok: {
            video: "1080x1920px",
            ratio: "9:16",
          },
        };

        return JSON.stringify(specs);
      }

      case "create_design_brief": {
        return JSON.stringify({
          success: true,
          brief: {
            title: `Design Brief: ${toolInput.contentType}`,
            platforms: toolInput.platforms || ["instagram", "facebook"],
            theme: toolInput.theme,
            recommendations: {
              layout: "Center focal point with breathing room",
              textPlacement: "Bottom 1/3 for optimal visibility",
              calloutArea: "Bottom banner with CTA",
            },
            deliverables: [
              "2-3 design variations",
              "Responsive versions for each platform",
              "Color-coded for brand guidelines",
            ],
          },
        });
      }

      default:
        return "Tool not found";
    }
  }
}
