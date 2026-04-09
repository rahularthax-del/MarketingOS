import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SocialStrategist } from "@/lib/agents/social/social-strategist";
import { ContentCreator } from "@/lib/agents/social/content-creator";

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

    // Check if brand has any posts
    const postCount = await prisma.socialPost.count({
      where: { brandId },
    });

    // Run agents
    const strategist = new SocialStrategist(brandId, session.user.id);
    const creator = new ContentCreator(brandId, session.user.id);

    let strategistResult: any;
    let creatorResult: any;

    if (postCount === 0) {
      // Cold-start: generate initial recommendations
      strategistResult = await strategist.run(
        message ||
          "We're just starting out. Help us build our social media foundation."
      );
    } else {
      // Existing account: analyze performance
      strategistResult = await strategist.run(
        message || "Analyze our current social media performance and suggest optimizations."
      );
    }

    // Get content creator insights
    if (message?.toLowerCase().includes("content") || !message) {
      creatorResult = await creator.run(
        message || "Generate some content ideas for our next posts."
      );
    }

    return NextResponse.json({
      success: true,
      strategist: strategistResult,
      creator: creatorResult,
      isNewAccount: postCount === 0,
    });
  } catch (error) {
    console.error("Error running social team:", error);
    return NextResponse.json(
      { error: "Failed to run social team" },
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
    const posts = await prisma.socialPost.count({
      where: { brandId },
    });

    const accounts = await prisma.socialAccount.count({
      where: { brandId },
    });

    return NextResponse.json({
      teamReady: true,
      members: [
        { name: "Social Strategist", status: "ready" },
        { name: "Content Creator", status: "ready" },
        { name: "Design Lead", status: "ready" },
        { name: "Community Manager", status: "ready" },
        { name: "Analytics Specialist", status: "ready" },
        { name: "Growth Hacker", status: "ready" },
      ],
      accountStatus: {
        posts,
        accounts,
        isNew: posts === 0,
      },
    });
  } catch (error) {
    console.error("Error getting social team status:", error);
    return NextResponse.json(
      { error: "Failed to get team status" },
      { status: 500 }
    );
  }
}
