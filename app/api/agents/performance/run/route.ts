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

    const { brandId, message } = await request.json();

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

    // Check if brand has any campaigns
    const campaignCount = await prisma.campaign.count({
      where: { brandId },
    });

    // Run agents
    const strategist = new StrategyLead(brandId, session.user.id);

    let strategistResult: any;

    if (campaignCount === 0) {
      // Cold-start: recommend launch strategy
      strategistResult = await strategist.run(
        message ||
          "We're just starting out. Help us plan our first campaigns."
      );
    } else {
      // Existing campaigns: analyze and optimize
      strategistResult = await strategist.run(
        message || "Analyze our current campaigns and suggest optimizations."
      );
    }

    return NextResponse.json({
      success: true,
      strategist: strategistResult,
      isNewAccount: campaignCount === 0,
    });
  } catch (error) {
    console.error("Error running performance team:", error);
    return NextResponse.json(
      { error: "Failed to run performance team" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get("brandId");

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

    // Get team status
    const campaigns = await prisma.campaign.count({
      where: { brandId },
    });

    return NextResponse.json({
      teamReady: true,
      members: [
        { name: "Strategy Lead", status: "ready" },
        { name: "Campaign Architect", status: "ready" },
        { name: "Creative Analyst", status: "ready" },
        { name: "Bid Optimizer", status: "ready" },
        { name: "Reporting Analyst", status: "ready" },
      ],
      accountStatus: {
        campaigns,
        isNew: campaigns === 0,
      },
    });
  } catch (error) {
    console.error("Error getting performance team status:", error);
    return NextResponse.json(
      { error: "Failed to get team status" },
      { status: 500 }
    );
  }
}
