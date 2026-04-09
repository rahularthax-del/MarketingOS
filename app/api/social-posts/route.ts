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

    const posts = await prisma.socialPost.findMany({
      where: {
        brand: { userId: session.user.id },
      },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching social posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
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

    const { brandId, platform, content, hashtags, imageUrl, scheduledAt } =
      await request.json();

    if (!brandId || !platform || !content) {
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

    const post = await prisma.socialPost.create({
      data: {
        brandId,
        platform,
        content,
        hashtags: hashtags || "",
        imageUrl: imageUrl || "",
        status: scheduledAt ? "scheduled" : "draft",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating social post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
