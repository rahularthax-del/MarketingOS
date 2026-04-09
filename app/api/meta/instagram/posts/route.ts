import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetaAPIClient } from "@/lib/integrations/meta";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brandId = request.nextUrl.searchParams.get("brandId");
    const igAccountId = request.nextUrl.searchParams.get("igAccountId");

    if (!brandId || !igAccountId) {
      return NextResponse.json(
        { error: "brandId and igAccountId query params required" },
        { status: 400 }
      );
    }

    // Get Meta integration
    const integration = await prisma.integration.findFirst({
      where: {
        brandId,
        platform: "meta_ads",
      },
    });

    if (!integration || !integration.credentials) {
      return NextResponse.json(
        { error: "Meta Ads not connected" },
        { status: 404 }
      );
    }

    const credentials = JSON.parse(integration.credentials);
    const client = new MetaAPIClient(credentials);

    // Fetch posts
    const posts = await client.getInstagramPosts(igAccountId);

    return NextResponse.json({
      posts,
      total: posts.length,
    });
  } catch (error) {
    console.error("Error fetching Instagram posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch Instagram posts" },
      { status: 500 }
    );
  }
}
