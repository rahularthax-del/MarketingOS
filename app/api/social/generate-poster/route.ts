import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FAL_AI_KEY = process.env.FAL_AI_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, brandId } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get brand info for context
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      select: {
        name: true,
        brandVoice: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        targetAudience: true,
        brandTagline: true,
        brandMission: true,
      },
    });

    // Step 1: Use Claude to generate a detailed prompt for image generation
    const systemPrompt = `You are an expert at creating detailed, visual prompts for AI image generators. Create a single paragraph prompt that will generate a professional social media poster.

CRITICAL REQUIREMENTS:
1. MUST use the brand colors prominently - use exact hex codes provided
2. MUST match the brand voice/tone
3. MUST have clean, readable text (avoid AI text glitches)
4. Use simple, clear imagery (avoid overly complex tech visuals)
5. Keep design minimal and professional
6. Use the primary color as the dominant color

Write ONE detailed paragraph that an image generator can use.`;

    const userPrompt = `Create a social media poster for: "${prompt}"

BRAND IDENTITY (MUST FOLLOW):
- Name: ${brand?.name || "Unknown"}
- Voice/Style: ${brand?.brandVoice || "professional"}
- PRIMARY COLOR (USE AS DOMINANT): ${brand?.primaryColor || "#000000"}
- Secondary Color: ${brand?.secondaryColor || "#FFFFFF"}
- Accent Color: ${brand?.accentColor || "optional"}
- Target Audience: ${brand?.targetAudience || "general audience"}
${brand?.brandMission ? `- Brand Mission: ${brand.brandMission}` : ""}
${brand?.brandTagline ? `- Tagline: ${brand.brandTagline}` : ""}

POSTER REQUIREMENTS:
- Dominant color MUST be ${brand?.primaryColor}
- Use ${brand?.brandVoice} style and tone
- Large, clear, readable text (avoid glitches)
- Professional and clean design
- Include the brand name prominently

Create a detailed visual description for an AI image generator now.`;

    console.log("Step 1: Generating image prompt with Claude...");

    const message = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const imagePrompt =
      message.content[0].type === "text" ? message.content[0].text : "";

    if (!imagePrompt) {
      throw new Error("Failed to generate image prompt");
    }

    console.log("Step 2: Generated image prompt:", imagePrompt);
    console.log("Step 3: Calling fal.ai to generate poster image...");

    // Step 2: Generate image using Pollinations.ai (completely free, no API key)
    console.log("Step 2: Generating poster image with Pollinations.ai...");
    console.log("Image prompt preview:", imagePrompt.substring(0, 80) + "...");

    // Encode the prompt properly for URL
    const encodedPrompt = encodeURIComponent(imagePrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    console.log("Step 3: Image URL generated");
    console.log("Image URL:", imageUrl);

    // Return the image URL immediately
    return NextResponse.json({
      success: true,
      imageUrl,
      prompt,
    });
  } catch (error) {
    console.error("Error generating poster:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Failed to generate poster: ${errorMessage}` },
      { status: 500 }
    );
  }
}
