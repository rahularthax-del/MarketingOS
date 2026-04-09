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

    // Fetch campaigns
    const campaigns = await client.getCampaigns();

    // Save to database
    for (const campaign of campaigns) {
      await prisma.campaign.upsert({
        where: {
          id: campaign.id,
        },
        create: {
          id: campaign.id,
          brandId,
          platform: "meta",
          externalId: campaign.id,
          name: campaign.name,
          objective: campaign.objective,
          status: campaign.status,
          budget: campaign.budget / 100,
          spend: campaign.spend,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          conversions: campaign.conversions,
          roas: campaign.roas,
          ctr: campaign.ctr,
          cpa: campaign.cpa,
        },
        update: {
          status: campaign.status,
          spend: campaign.spend,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          conversions: campaign.conversions,
          roas: campaign.roas,
          ctr: campaign.ctr,
          cpa: campaign.cpa,
        },
      });
    }

    return NextResponse.json({
      campaigns,
      total: campaigns.length,
    });
  } catch (error) {
    console.error("Error fetching Meta campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch Meta campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId, name, objective, daily_budget, lifetime_budget } =
      await request.json();

    if (!brandId || !name || !objective) {
      return NextResponse.json(
        { error: "brandId, name, and objective required" },
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

    // Create campaign
    const campaign = await client.createCampaign({
      name,
      objective,
      daily_budget,
      lifetime_budget,
    });

    // Save to database
    const savedCampaign = await prisma.campaign.create({
      data: {
        id: campaign.id,
        brandId,
        platform: "meta",
        externalId: campaign.id,
        name: campaign.name,
        objective: campaign.objective,
        status: campaign.status,
        budget: campaign.budget,
      },
    });

    return NextResponse.json(savedCampaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
