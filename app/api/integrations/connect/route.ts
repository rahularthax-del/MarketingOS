import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetaAPIClient } from "@/lib/integrations/meta";
import { GoogleAdsAPIClient } from "@/lib/integrations/google-ads";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId, platform, credentials } = await request.json();

    if (!brandId || !platform || !credentials) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Test connection for Meta
    if (platform === "meta_ads") {
      const client = new MetaAPIClient(credentials);
      const testResult = await client.testConnection();

      if (!testResult.success) {
        return NextResponse.json(
          { error: `Invalid Meta credentials: ${testResult.error}` },
          { status: 401 }
        );
      }
    }

    // Test connection for Google Ads
    if (platform === "google_ads") {
      const client = new GoogleAdsAPIClient(credentials);
      const testResult = await client.testConnection();

      if (!testResult.success) {
        return NextResponse.json(
          { error: `Invalid Google Ads credentials: ${testResult.error}` },
          { status: 401 }
        );
      }
    }

    // Check if integration already exists
    let integration = await prisma.integration.findFirst({
      where: { brandId, platform },
    });

    if (integration) {
      // Update existing integration
      integration = await prisma.integration.update({
        where: { id: integration.id },
        data: {
          credentials: JSON.stringify(credentials),
          isConnected: true,
          lastTested: new Date(),
        },
      });
    } else {
      // Create new integration
      integration = await prisma.integration.create({
        data: {
          brandId,
          platform,
          credentials: JSON.stringify(credentials),
          isConnected: true,
          lastTested: new Date(),
        },
      });
    }

    // Create notification
    try {
      await prisma.notification.create({
        data: {
          brandId,
          title: `${platform} Connected`,
          message: `Your ${platform} account has been successfully connected.`,
          type: "success",
        },
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the integration if notification fails
    }

    return NextResponse.json(integration);
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 }
    );
  }
}
