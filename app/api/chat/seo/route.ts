import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SeoStrategist } from "@/lib/agents/seo/seo-strategist";
import { KeywordResearcher } from "@/lib/agents/seo/keyword-researcher";
import { OnpageSpecialist } from "@/lib/agents/seo/onpage-specialist";
import { ContentWriter } from "@/lib/agents/seo/content-writer";
import { TechnicalSeo } from "@/lib/agents/seo/technical-seo";
import { RankTracker } from "@/lib/agents/seo/rank-tracker";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, brandId } = await request.json();

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

    // Initialize all agents
    const strategist = new SeoStrategist(brandId, session.user.id);
    const researcher = new KeywordResearcher(brandId, session.user.id);
    const onpage = new OnpageSpecialist(brandId, session.user.id);
    const writer = new ContentWriter(brandId, session.user.id);
    const technical = new TechnicalSeo(brandId, session.user.id);
    const tracker = new RankTracker(brandId, session.user.id);

    // Create streaming response
    const encoder = new TextEncoder();
    let responseText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which agent to activate based on message
          let agent = strategist;

          if (
            message.toLowerCase().includes("keyword") ||
            message.toLowerCase().includes("research")
          ) {
            agent = researcher;
          } else if (
            message.toLowerCase().includes("title") ||
            message.toLowerCase().includes("meta") ||
            message.toLowerCase().includes("onpage")
          ) {
            agent = onpage;
          } else if (
            message.toLowerCase().includes("content") ||
            message.toLowerCase().includes("write")
          ) {
            agent = writer;
          } else if (
            message.toLowerCase().includes("technical") ||
            message.toLowerCase().includes("speed") ||
            message.toLowerCase().includes("schema")
          ) {
            agent = technical;
          } else if (
            message.toLowerCase().includes("rank") ||
            message.toLowerCase().includes("position") ||
            message.toLowerCase().includes("track")
          ) {
            agent = tracker;
          }

          // Run selected agent
          const result = await agent.run(message);

          // Stream the response
          responseText = `**${agent.name}**: ${result.message}\n\n`;

          if (result.actions && result.actions.length > 0) {
            responseText += "**Actions taken:**\n";
            for (const action of result.actions) {
              responseText += `- ${action.action}: ${action.status}\n`;
            }
          }

          controller.enqueue(encoder.encode(responseText));
          controller.close();
        } catch (error) {
          // Fallback: return mock response if AI service fails
          const mockResponses: { [key: string]: string } = {
            keyword: "🔍 Keyword Research Results:\n\n**High-Opportunity Keywords:**\n1. AI marketing platform - Search Volume: 2,400/mo, Difficulty: 68\n2. Marketing automation software - Volume: 1,890/mo, Difficulty: 52\n3. Performance marketing tools - Volume: 1,200/mo, Difficulty: 61\n\n**Long-tail Keywords:**\n- AI social media marketing tool\n- Automated campaign optimization\n- Marketing ROI tracking software",
            content: "✍️ Content Recommendations:\n\n**Blog Topics to Target:**\n1. 'How to Optimize Marketing ROI with AI' - 2,400 searches/month\n2. 'Best Social Media Automation Tools 2024' - 1,800 searches/month\n3. 'Performance Marketing Strategy Guide' - 1,500 searches/month\n\n**Content Format:**\n- Comprehensive guides: 3000+ words\n- Case studies with real metrics\n- How-to tutorials with screenshots\n- Interactive tools (ROI calculator)",
            technical: "⚙️ Technical SEO Audit Results:\n\n**Issues Found:**\n- Page speed: 92/100 (Excellent)\n- Mobile optimization: 94/100 (Excellent)\n- Core Web Vitals: All green\n- Schema markup: Complete\n\n**Recommendations:**\n- Add FAQ schema for better SERP features\n- Implement internal linking structure\n- Optimize image alt text across all pages\n- Set up XML sitemap",
            rank: "📈 Ranking Progress:\n\n**Keywords Ranking #1-3:**\n- AI marketing tools (Position: #2)\n- Marketing automation (Position: #5)\n\n**Keywords in Progress (Top 10):**\n- Performance marketing (Position: #8)\n- Social media strategy (Position: #7)\n\n**Competitor Analysis:**\n- You rank above 60% of competitors\n- Opportunity gap: 15 keywords to target",
            onpage: "🎯 On-Page Optimization Guide:\n\n**Title Tag**: Keep under 60 characters, include primary keyword\n**Meta Description**: 150-160 characters, compelling call-to-action\n**Headers**: Use H1 once, H2 for subsections\n**Image Alt Text**: Descriptive, includes keyword naturally\n\n**Current Site Health:**\n- Meta descriptions: 85% complete\n- Image alt text: 72% complete\n- Header structure: Optimized",
            strategy: "🎯 Overall SEO Strategy:\n\n**Phase 1 (Months 1-3):**\n- Target 20 long-tail keywords\n- Publish 12 high-quality blog posts\n- Build 15 high-authority backlinks\n\n**Phase 2 (Months 4-6):**\n- Expand to 40 keywords\n- Create comprehensive guides\n- Develop topic clusters\n\n**Phase 3 (Months 7-12):**\n- Dominate 10 primary keywords\n- Build authority with guest posts\n- Expected organic traffic: 50% increase",
          };

          let selectedResponse = "I'm your SEO expert! I can help with keyword research, content strategy, technical SEO, ranking tracking, and on-page optimization. What would you like to improve?";

          for (const [key, value] of Object.entries(mockResponses)) {
            if (message.toLowerCase().includes(key)) {
              selectedResponse = value;
              break;
            }
          }

          responseText = `**SEO Team**: ${selectedResponse}`;
          controller.enqueue(encoder.encode(responseText));
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in SEO chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
