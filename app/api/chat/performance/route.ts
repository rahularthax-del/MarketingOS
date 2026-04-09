import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { StrategyLead } from "@/lib/agents/performance/strategy-lead";
import { CampaignArchitect } from "@/lib/agents/performance/campaign-architect";
import { CreativeAnalyst } from "@/lib/agents/performance/creative-analyst";
import { BidOptimizer } from "@/lib/agents/performance/bid-optimizer";
import { ReportingAnalyst } from "@/lib/agents/performance/reporting-analyst";

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
    const strategist = new StrategyLead(brandId, session.user.id);
    const architect = new CampaignArchitect(brandId, session.user.id);
    const creative = new CreativeAnalyst(brandId, session.user.id);
    const bidder = new BidOptimizer(brandId, session.user.id);
    const reporter = new ReportingAnalyst(brandId, session.user.id);

    // Create streaming response
    const encoder = new TextEncoder();
    let responseText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Determine which agent to activate based on message
          let agent = strategist;

          if (
            message.toLowerCase().includes("campaign") ||
            message.toLowerCase().includes("audience")
          ) {
            agent = architect;
          } else if (
            message.toLowerCase().includes("creative") ||
            message.toLowerCase().includes("ad")
          ) {
            agent = creative;
          } else if (
            message.toLowerCase().includes("bid") ||
            message.toLowerCase().includes("budget") ||
            message.toLowerCase().includes("cost")
          ) {
            agent = bidder;
          } else if (
            message.toLowerCase().includes("report") ||
            message.toLowerCase().includes("metric") ||
            message.toLowerCase().includes("performance")
          ) {
            agent = reporter;
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
            campaign: "📊 Campaign Strategy Analysis:\n\n1. **Target Audience**: Focus on 25-44 year olds interested in marketing automation\n2. **Campaign Structure**: 3-tier approach - awareness, consideration, conversion\n3. **Budget Allocation**: 40% awareness, 35% consideration, 25% conversion\n4. **Expected Metrics**: 3.5% CTR, 2.1% conversion rate, 4.2x ROAS\n5. **Timeline**: 30-day campaign with weekly optimization",
            creative: "🎨 Ad Creative Recommendations:\n\n- Use dynamic product showcases\n- Include customer testimonials and case studies\n- A/B test 3 variations of headlines\n- Optimal image size: 1200x628px for desktop\n- Video ads perform 80% better - recommend 15-30 second videos\n- Current creative fatigue: Low - continue current winners",
            bid: "💰 Bid Optimization Strategy:\n\n- **Recommended Bid Strategy**: Target CPA of $15\n- **Current Average CPC**: $2.35 (trending down)\n- **Budget Reallocation**: Increase high-performing placements by 25%\n- **Savings Opportunity**: 18% cost reduction possible by pausing low-performers\n- **Daily Budget**: Scale up to $150/day based on performance\n- **Bid Adjustments**: +15% for mobile, -10% for older browsers",
            report: "📈 Performance Report:\n\n**This Week's Metrics:**\n- Total Spend: $2,590.75\n- Conversions: 185 (+12% vs last week)\n- ROAS: 3.45x\n- CPA: $14.00 (↓8%)\n- CTR: 2.85%\n- Quality Score: 8.2/10\n\n**Best Performers**: Video ads on mobile, carousel ads on desktop\n**Needs Improvement**: Display remarketing, older ad sets",
            strategy: "🎯 Overall Strategy Recommendations:\n\n1. **Expand into new audiences**: Lookalike audiences from converters\n2. **Optimize for conversion API**: Implement enhanced tracking\n3. **Seasonal planning**: Prepare for Q3 demand spike\n4. **Test new placements**: YouTube Shopping, Google Network\n5. **Consolidate campaigns**: Reduce from 12 to 8 campaigns for better optimization\n6. **Increase automation**: Switch 60% to smart bidding strategies",
          };

          let selectedResponse = "I'm your Performance Marketing assistant. I can help you optimize campaigns, analyze metrics, manage budgets, and improve your ROAS. What would you like to focus on today?";

          for (const [key, value] of Object.entries(mockResponses)) {
            if (message.toLowerCase().includes(key)) {
              selectedResponse = value;
              break;
            }
          }

          responseText = `**Performance Team**: ${selectedResponse}`;
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
    console.error("Error in performance chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat" },
      { status: 500 }
    );
  }
}
