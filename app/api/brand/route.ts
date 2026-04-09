import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brand = await prisma.brand.findUnique({
      where: { userId: session.user.id },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand" },
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

    const {
      name,
      industry,
      website,
      brandVoice,
      brandTagline,
      brandMission,
      brandValues,
      targetAudience,
      primaryColor,
      secondaryColor,
      accentColor,
      tertiaryColor,
      supplementaryColor,
      instagramHandle,
    } = await request.json();

    // Check if brand exists
    let brand = await prisma.brand.findUnique({
      where: { userId: session.user.id },
    });

    if (brand) {
      // Update existing brand
      brand = await prisma.brand.update({
        where: { userId: session.user.id },
        data: {
          ...(name && { name }),
          ...(industry && { industry }),
          ...(website && { website }),
          ...(brandVoice && { brandVoice }),
          ...(brandTagline !== undefined && { brandTagline }),
          ...(brandMission !== undefined && { brandMission }),
          ...(brandValues !== undefined && { brandValues }),
          ...(targetAudience !== undefined && { targetAudience }),
          ...(primaryColor && { primaryColor }),
          ...(secondaryColor && { secondaryColor }),
          ...(accentColor && { accentColor }),
          ...(tertiaryColor && { tertiaryColor }),
          ...(supplementaryColor && { supplementaryColor }),
          ...(instagramHandle !== undefined && { instagramHandle }),
        },
      });
    } else {
      // Create new brand
      brand = await prisma.brand.create({
        data: {
          userId: session.user.id,
          name: name || "My Brand",
          industry: industry || undefined,
          website: website || undefined,
          brandVoice: brandVoice || "professional",
          brandTagline: brandTagline || undefined,
          brandMission: brandMission || undefined,
          brandValues: brandValues || undefined,
          targetAudience: targetAudience || undefined,
          primaryColor: primaryColor || undefined,
          secondaryColor: secondaryColor || undefined,
          accentColor: accentColor || undefined,
          tertiaryColor: tertiaryColor || undefined,
          supplementaryColor: supplementaryColor || undefined,
          instagramHandle: instagramHandle || undefined,
        },
      });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error("Error saving brand:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return NextResponse.json(
      { error: `Failed to save brand: ${errorMessage}` },
      { status: 500 }
    );
  }
}
