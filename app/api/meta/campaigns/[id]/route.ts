import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MetaAPIClient } from "@/lib/integrations/meta";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { brandId, budget, budgetType, status } = await request.json();
    const campaignId = params.id;

    if (!brandId) {
      return NextResponse.json({ error: "brandId required" }, { status: 400 });
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

    // Update budget if provided
    if (budget) {
      const success = await client.updateCampaignBudget(
        campaignId,
        budget,
        budgetType || "daily"
      );

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update budget" },
          { status: 500 }
        );
      }
    }

    // Update status if provided
    if (status) {
      const success = await client.updateCampaignStatus(campaignId, status);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to update status" },
          { status: 500 }
        );
      }
    }

    // Update in database
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(budget && { budget }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}
