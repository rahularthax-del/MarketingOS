import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { StrategyLead } from "@/lib/agents/performance/strategy-lead";
import { CampaignArchitect } from "@/lib/agents/performance/campaign-architect";
import { CreativeAnalyst } from "@/lib/agents/performance/creative-analyst";
import { BidOptimizer } from "@/lib/agents/performance/bid-optimizer";
import { ReportingAnalyst } from "@/lib/agents/performance/reporting-analyst";

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
    const strategist = new StrategyLead(brandId, session.user.id);
    const architect = new CampaignArchitect(brandId, session.user.id);
    const creative = new CreativeAnalyst(brandId, session.user.id);
    const bidder = new BidOptimizer(brandId, session.user.id);
    const reporter = new ReportingAnalyst(brandId, session.user.id);

    // Create streaming response
    const encoder = new TextEncoder();
    let responseText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which agent to activate based on message
          let agent = strategist;

          if (
            message.toLowerCase().includes("campaign") ||
            message.toLowerCase().includes("audience")
          ) {
            agent = architect;
          } else if (
            message.toLowerCase().includes("creative") ||
            message.toLowerCase().includes("ad")
          ) {
            agent = creative;
          } else if (
            message.toLowerCase().includes("bid") ||
            message.toLowerCase().includes("budget") ||
            message.toLowerCase().includes("cost")
          ) {
            agent = bidder;
          } else if (
            message.toLowerCase().includes("report") ||
            message.toLowerCase().includes("metric") ||
            message.toLowerCase().includes("performance")
          ) {
            agent = reporter;
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
    console.error("Error in performance chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
