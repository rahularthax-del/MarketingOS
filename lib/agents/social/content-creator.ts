import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";
import { prisma } from "@/lib/prisma";
import { anthropic } from "@/lib/anthropic";

export class ContentCreator extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Content Creator", "SOCIAL_CONTENT", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Content Creator on a 6-person social media marketing team.

Your role:
- Write compelling captions and copy for social media
- Create content ideas based on brand voice and audience
- Develop hashtag strategies
- Generate post copies optimized for each platform
- Create engaging calls-to-action

You have access to tools to:
- Generate post content
- Fetch brand guidelines
- Create social media captions
- Generate hashtag suggestions

Always write authentic, engaging content that matches the brand voice.
Keep captions concise but compelling.
Include strong CTAs when appropriate.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_brand_voice",
        description: "Get the brand voice and tone guidelines",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "generate_post_caption",
        description: "Generate a social media caption for a post",
        input_schema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "The topic or theme of the post",
            },
            platform: {
              type: "string",
              description: "Target platform (instagram, facebook, twitter, linkedin)",
            },
            includeHashtags: {
              type: "boolean",
              description: "Whether to include hashtags",
            },
            includeCta: {
              type: "boolean",
              description: "Whether to include a call-to-action",
            },
          },
          required: ["topic", "platform"],
        },
      },
      {
        name: "generate_hashtags",
        description: "Generate relevant hashtags for a post",
        input_schema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "The topic to generate hashtags for",
            },
            count: {
              type: "number",
              description: "Number of hashtags to generate (default: 10)",
            },
          },
          required: ["topic"],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_brand_voice": {
        const brand = await prisma.brand.findUnique({
          where: { id: this.brandId },
        });

        return JSON.stringify({
          voice: brand?.brandVoice || "professional",
          values: brand?.brandValues,
          tone: brand?.brandVoice === "friendly" ? "conversational" : "professional",
        });
      }

      case "generate_post_caption": {
        const { topic, platform } = toolInput;

        // Use Claude to generate caption
        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20251001",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: `Write a compelling social media caption for ${platform} about: ${topic}

Make it engaging, authentic, and optimized for the platform.
${toolInput.includeHashtags ? "Include 5-10 relevant hashtags." : "Do not include hashtags."}
${toolInput.includeCta ? "Include a strong call-to-action." : "Do not include a call-to-action."}

Keep it under 300 characters for Twitter, 2000 for Instagram/Facebook.`,
            },
          ],
        });

        const caption =
          response.content[0].type === "text" ? response.content[0].text : "";

        return JSON.stringify({
          caption,
          platform,
          length: caption.length,
        });
      }

      case "generate_hashtags": {
        const { topic, count = 10 } = toolInput;

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20251001",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Generate ${count} relevant hashtags for a social media post about: ${topic}

Return only the hashtags, one per line, without any other text.`,
            },
          ],
        });

        const hashtags =
          response.content[0].type === "text"
            ? response.content[0].text
                .split("\n")
                .filter((h) => h.trim())
                .map((h) => h.trim())
            : [];

        return JSON.stringify({
          hashtags,
          count: hashtags.length,
        });
      }

      default:
        return "Tool not found";
    }
  }
}
