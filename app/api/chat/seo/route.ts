import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SeoStrategist } from "@/lib/agents/seo/seo-strategist";
import { KeywordResearcher } from "@/lib/agents/seo/keyword-researcher";
import { OnpageSpecialist } from "@/lib/agents/seo/onpage-specialist";
import { ContentWriter } from "@/lib/agents/seo/content-writer";
import { TechnicalSeo } from "@/lib/agents/seo/technical-seo";
import { RankTracker } from "@/lib/agents/seo/rank-tracker";

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
    const strategist = new SeoStrategist(brandId, session.user.id);
    const researcher = new KeywordResearcher(brandId, session.user.id);
    const onpage = new OnpageSpecialist(brandId, session.user.id);
    const writer = new ContentWriter(brandId, session.user.id);
    const technical = new TechnicalSeo(brandId, session.user.id);
    const tracker = new RankTracker(brandId, session.user.id);

    // Create streaming response
    const encoder = new TextEncoder();
    let responseText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which agent to activate based on message
          let agent = strategist;

          if (
            message.toLowerCase().includes("keyword") ||
            message.toLowerCase().includes("research")
          ) {
            agent = researcher;
          } else if (
            message.toLowerCase().includes("title") ||
            message.toLowerCase().includes("meta") ||
            message.toLowerCase().includes("onpage")
          ) {
            agent = onpage;
          } else if (
            message.toLowerCase().includes("content") ||
            message.toLowerCase().includes("write")
          ) {
            agent = writer;
          } else if (
            message.toLowerCase().includes("technical") ||
            message.toLowerCase().includes("speed") ||
            message.toLowerCase().includes("schema")
          ) {
            agent = technical;
          } else if (
            message.toLowerCase().includes("rank") ||
            message.toLowerCase().includes("position") ||
            message.toLowerCase().includes("track")
          ) {
            agent = tracker;
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
    console.error("Error in SEO chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
