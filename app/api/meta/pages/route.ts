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
    if (!brandId) {
      return NextResponse.json(
        { error: "brandId query param required" },
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

    // Fetch pages
    const pages = await client.getPages();

    // Fetch Instagram accounts for each page
    const pagesWithInstagram = await Promise.all(
      pages.map(async (page) => {
        const igAccounts = await client.getInstagramAccounts(page.id);
        return {
          ...page,
          instagram_accounts: igAccounts,
        };
      })
    );

    return NextResponse.json({
      pages: pagesWithInstagram,
      connected: true,
    });
  } catch (error) {
    console.error("Error fetching Meta pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch Meta pages" },
      { status: 500 }
    );
  }
}
