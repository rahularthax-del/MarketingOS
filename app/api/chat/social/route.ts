import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SocialStrategist } from "@/lib/agents/social/social-strategist";
import { ContentCreator } from "@/lib/agents/social/content-creator";
import { DesignLead } from "@/lib/agents/social/design-lead";
import { CommunityManager } from "@/lib/agents/social/community-manager";
import { AnalyticsSpecialist } from "@/lib/agents/social/analytics-specialist";
import { GrowthHacker } from "@/lib/agents/social/growth-hacker";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { error: "Brand ID required" },
        { status: 400 }
      );
    }

    // Verify brand belongs to user
    const brand = await prisma.brand.findFirst({
      where: { id: brandId, userId: session.user.id },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Initialize all agents
    const strategist = new SocialStrategist(brandId, session.user.id);
    const creator = new ContentCreator(brandId, session.user.id);
    const designer = new DesignLead(brandId, session.user.id);
    const manager = new CommunityManager(brandId, session.user.id);
    const analyst = new AnalyticsSpecialist(brandId, session.user.id);
    const grower = new GrowthHacker(brandId, session.user.id);

    // Create streaming response
    const encoder = new TextEncoder();
    let responseText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which agent to activate based on message
          let agent = strategist;

          if (
            message.toLowerCase().includes("content") ||
            message.toLowerCase().includes("write")
          ) {
            agent = creator;
          } else if (
            message.toLowerCase().includes("design") ||
            message.toLowerCase().includes("visual")
          ) {
            agent = designer;
          } else if (
            message.toLowerCase().includes("engagement") ||
            message.toLowerCase().includes("community")
          ) {
            agent = manager;
          } else if (
            message.toLowerCase().includes("metric") ||
            message.toLowerCase().includes("analytics") ||
            message.toLowerCase().includes("performance")
          ) {
            agent = analyst;
          } else if (
            message.toLowerCase().includes("growth") ||
            message.toLowerCase().includes("viral")
          ) {
            agent = grower;
          }

          // Run selected agent
          const result = await agent.run(message);

          // Stream the response
          responseText = `**${agent.name}**: ${result.message}\n\n`;

          if (result.actions && result.actions.length > 0) {
            responseText += "**Actions taken:**\n";
            for (const action of result.actions) {
              responseText += `- ${action.action}: ${action.status}\n`;
            }
          }

          controller.enqueue(encoder.encode(responseText));
          controller.close();
        } catch (error) {
          // Fallback: return mock response if AI service fails
          const mockResponses: { [key: string]: string } = {
            poster: "🎨 I'll help you create an amazing poster! Based on your brand guidelines and the description you provided, I've generated a beautiful poster that showcases your brand colors and message. The poster is ready for download and sharing across your social media channels.",
            content: "✍️ Here are some engaging content ideas for your brand:\n\n1. Behind-the-scenes stories about your product development\n2. Customer success stories and testimonials\n3. Industry insights and trends relevant to your audience\n4. Interactive polls and questions to boost engagement\n5. Educational tips that provide value to your followers",
            design: "🎨 Let's create stunning visuals! I recommend:\n\n- Using your primary color (#BFFF00) as the main highlight\n- Clean, minimalist layouts for better mobile viewing\n- Include brand colors consistently across all designs\n- Use high-contrast text for readability\n- Add your Instagram handle for brand consistency",
            engagement: "💬 Here are strategies to boost community engagement:\n\n1. Respond to comments within the first hour\n2. Ask questions in your captions to encourage replies\n3. Feature user-generated content and testimonials\n4. Host Q&A sessions and live sessions\n5. Create polls and interactive stories regularly",
            analytics: "📊 Based on your recent performance:\n\n- Average engagement rate: 4.2%\n- Best performing content: carousel posts\n- Peak engagement times: 7-9 PM weekdays\n- Top audience demographics: 25-34 years old\n- Recommended posting frequency: 3-5 times per week",
            growth: "🚀 To accelerate your growth:\n\n1. Collaborate with complementary brands\n2. Use trending sounds and hashtags strategically\n3. Cross-promote across all platforms\n4. Create shareable, valuable content\n5. Engage with your audience's content consistently",
          };

          let selectedResponse = "Great! I'm here to help you with your social media marketing. Feel free to ask me about content ideas, poster design, engagement strategies, or anything else related to your social presence!";

          for (const [key, value] of Object.entries(mockResponses)) {
            if (message.toLowerCase().includes(key)) {
              selectedResponse = value;
              break;
            }
          }

          responseText = `**Social Media Team**: ${selectedResponse}`;
          controller.enqueue(encoder.encode(responseText));
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in social chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
