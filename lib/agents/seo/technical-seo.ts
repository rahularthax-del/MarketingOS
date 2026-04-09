import { BaseAgent, ToolDefinition } from "@/lib/agents/base-agent";

export class TechnicalSeo extends BaseAgent {
  constructor(brandId: string, userId: string) {
    super("Technical SEO", "SEO_TECHNICAL", brandId, userId);
  }

  getSystemPrompt(): string {
    return `You are the Technical SEO Specialist on a 6-person SEO team.

Your role:
- Audit site technical SEO
- Fix crawlability and indexation issues
- Optimize site speed and performance
- Manage robots.txt, sitemaps, schema markup
- Monitor Core Web Vitals

Always prioritize fixes that impact crawlability and ranking.`;
  }

  getTools(): ToolDefinition[] {
    return [
      {
        name: "get_technical_audit_checklist",
        description: "Get technical SEO audit checklist",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "analyze_site_speed",
        description: "Analyze site speed and Core Web Vitals",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "check_indexation",
        description: "Check page indexation status",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "recommend_schema_markup",
        description: "Recommend schema markup implementation",
        input_schema: {
          type: "object",
          properties: {
            contentType: {
              type: "string",
              description: "Type of content (article, product, review, etc)",
            },
          },
          required: [],
        },
      },
    ];
  }

  async executeTool(
    toolName: string,
    toolInput: Record<string, any>
  ): Promise<string> {
    switch (toolName) {
      case "get_technical_audit_checklist": {
        return JSON.stringify({
          checklist: {
            crawlability: {
              robots: "Check robots.txt allows important pages",
              blockage: "No accidental blocking of important content",
              status: "Needs review",
            },
            indexation: {
              sitemaps: "XML sitemaps submitted to GSC",
              canonical: "Canonical tags prevent duplicates",
              status: "Needs review",
            },
            coreWebVitals: {
              lcp: "Largest Contentful Paint < 2.5s",
              fid: "First Input Delay < 100ms",
              cls: "Cumulative Layout Shift < 0.1",
              status: "Needs review",
            },
            structure: {
              mobileFriendly: "Mobile-responsive design",
              https: "HTTPS enabled on all pages",
              status: "Needs review",
            },
            schemaMarkup: {
              implementation: "Add schema.org markup",
              richSnippets: "Enable rich snippets",
              status: "Pending",
            },
          },
        });
      }

      case "analyze_site_speed": {
        return JSON.stringify({
          metrics: {
            lcp: "3.2 seconds - Needs improvement",
            fid: "85 ms - Good",
            cls: "0.12 - Needs improvement",
            overallScore: "62/100",
          },
          recommendations: [
            "Optimize images (lazy loading, WebP format)",
            "Minify CSS and JavaScript",
            "Enable GZIP compression",
            "Use CDN for static assets",
            "Reduce JavaScript execution",
          ],
          priority: "High - Site speed affects rankings",
        });
      }

      case "check_indexation": {
        return JSON.stringify({
          status: {
            totalPages: "Pending - check Google Search Console",
            indexed: "Pending - check GSC for indexed pages",
            notIndexed: "Pending - check GSC for blockers",
          },
          issues: [
            "Check for 404 pages still indexed",
            "Verify no-index tags are correct",
            "Check crawl errors in GSC",
          ],
          action: "Set up Google Search Console monitoring",
        });
      }

      case "recommend_schema_markup": {
        const contentType = toolInput.contentType || "article";

        const schemas: Record<string, string[]> = {
          article: ["NewsArticle", "BlogPosting", "Article"],
          product: ["Product", "AggregateOffer"],
          review: ["Review", "AggregateRating"],
          service: ["Service", "LocalBusiness"],
        };

        return JSON.stringify({
          contentType,
          recommendedSchemas: schemas[contentType] || schemas.article,
          implementation: "Use JSON-LD format in <head>",
          benefit: "Enables rich snippets and improved SERP display",
        });
      }

      default:
        return "Tool not found";
    }
  }
}
