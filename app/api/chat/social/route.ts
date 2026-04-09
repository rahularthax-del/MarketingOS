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
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`Error: ${errorMsg}`)
          );
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
