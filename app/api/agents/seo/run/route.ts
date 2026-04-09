import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SeoStrategist } from "@/lib/agents/seo/seo-strategist";

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

    // Check if brand has any keywords
    const keywordCount = await prisma.keyword.count({
      where: { brandId },
    });

    // Run strategist
    const strategist = new SeoStrategist(brandId, session.user.id);

    const strategistResult = keywordCount === 0
      ? await strategist.run(
          message || "We're new to SEO. Help us build our foundation."
        )
      : await strategist.run(
          message || "Analyze our SEO performance and suggest optimizations."
        );

    return NextResponse.json({
      success: true,
      strategist: strategistResult,
      isNewAccount: keywordCount === 0,
    });
  } catch (error) {
    console.error("Error running SEO team:", error);
    return NextResponse.json(
      { error: "Failed to run SEO team" },
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
    const keywords = await prisma.keyword.count({
      where: { brandId },
    });

    const contentPieces = await prisma.contentPiece.count({
      where: { brandId },
    });

    return NextResponse.json({
      teamReady: true,
      members: [
        { name: "SEO Strategist", status: "ready" },
        { name: "Keyword Researcher", status: "ready" },
        { name: "OnPage Specialist", status: "ready" },
        { name: "Content Writer", status: "ready" },
        { name: "Technical SEO", status: "ready" },
        { name: "Rank Tracker", status: "ready" },
      ],
      accountStatus: {
        keywords,
        contentPieces,
        isNew: keywords === 0,
      },
    });
  } catch (error) {
    console.error("Error getting SEO team status:", error);
    return NextResponse.json(
      { error: "Failed to get team status" },
      { status: 500 }
    );
  }
}
