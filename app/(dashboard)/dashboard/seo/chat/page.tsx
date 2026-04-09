"use client";

import { useState } from "react";

interface TeamMember {
  name: string;
  role: string;
  color: string;
  perspective: string;
  icon: string;
}

interface Discussion {
  userQuery: string;
  teamMembers: {
    [key: string]: string;
  };
  debate: string[];
  consensus: string;
  actionItems: string[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Sarah Chen",
    role: "SEO Strategist",
    color: "bg-blue-100 text-blue-900",
    icon: "🎯",
    perspective: "Focuses on overall SEO strategy and roadmap",
  },
  {
    name: "Marcus Silva",
    role: "Keyword Researcher",
    color: "bg-purple-100 text-purple-900",
    icon: "🔍",
    perspective: "Identifies high-opportunity keywords",
  },
  {
    name: "Lisa Park",
    role: "Content Writer",
    color: "bg-green-100 text-green-900",
    icon: "✍️",
    perspective: "Creates SEO-optimized content",
  },
  {
    name: "James Rodriguez",
    role: "On-Page Specialist",
    color: "bg-orange-100 text-orange-900",
    icon: "🔧",
    perspective: "Optimizes individual page elements",
  },
  {
    name: "Dr. Patel",
    role: "Technical SEO Expert",
    color: "bg-red-100 text-red-900",
    icon: "⚙️",
    perspective: "Handles technical SEO implementation",
  },
  {
    name: "Emma Thompson",
    role: "Rank Tracker",
    color: "bg-yellow-100 text-yellow-900",
    icon: "📊",
    perspective: "Monitors and analyzes ranking progress",
  },
];

const SAMPLE_DISCUSSIONS: { [key: string]: Discussion } = {
  keyword: {
    userQuery: "What keywords should I target for my new product page?",
    teamMembers: {
      "🎯 Sarah Chen (Strategist)":
        "I recommend a three-tier keyword strategy: 3 main keywords with high value, 8-10 secondary keywords for conversion, and 15-20 long-tail keywords for quick wins.",
      "🔍 Marcus Silva (Researcher)":
        "I've identified 'AI marketing platform' (2,400 searches/mo, difficulty 68) as primary. Secondary: 'automated campaign optimization' (1,200 searches). Long-tail: 'AI tool for small business marketing'",
      "✍️ Lisa Park (Writer)":
        "I can craft compelling content targeting these. I'd focus 60% on the main keyword, 30% on secondaries, and 10% on long-tail. Each deserves unique angle.",
      "🔧 James Rodriguez (On-Page)":
        "For on-page optimization, I suggest H1 with main keyword, 2-3 H2s with secondary keywords, and strategic placement of long-tail in meta description.",
      "⚙️ Dr. Patel (Technical)":
        "I'll ensure proper schema markup, fast page load (< 2.5s), mobile optimization, and internal linking strategy to distribute authority.",
      "📊 Emma Thompson (Tracker)":
        "I'll monitor ranking progress for all keywords weekly. We should see movement on long-tail within 2-3 weeks, secondary keywords in 4-6 weeks.",
    },
    debate: [
      "Marcus: 'I think difficulty 68 might be too high. We should start with 55-60 difficulty keywords to build momentum.'",
      "Sarah: 'Good point. Let's do 2 high-difficulty + 3 medium-difficulty as primary targets. Marcus, can you filter those?'",
      "Lisa: 'Also, for content depth - should we do 2000-word articles or optimize multiple 1000-word pages?'",
      "James: 'Multiple pages perform better for this niche. Each keyword gets its own optimized page, then internal linking connects them.'",
      "Dr. Patel: 'Agreed. Easier to manage technical SEO with separate pages, and we can use topic clusters.'",
      "Sarah: 'Perfect! That's our approach - topic clusters with 1 pillar page + 4-5 sub-pages.'",
    ],
    consensus:
      "Target 5 primary keywords (2 high-difficulty, 3 medium) with topic clusters. Create pillar page + 4-5 supporting pages per cluster. Implement proper schema and internal linking.",
    actionItems: [
      "Marcus: Create keyword research spreadsheet with search volume, difficulty, intent, and CPC",
      "Lisa: Draft content outlines for pillar pages and supporting content",
      "James: Create on-page optimization checklist for each keyword",
      "Dr. Patel: Set up technical implementation plan and schema markup",
      "Emma: Configure rank tracking in Google Search Console and third-party tools",
      "Sarah: Review and approve final strategy document by EOD tomorrow",
    ],
  },
  content: {
    userQuery: "How should I structure my content strategy for the next quarter?",
    teamMembers: {
      "🎯 Sarah Chen (Strategist)":
        "Q2 focus: 12 pillar pages covering main topics, 36 supporting articles, 8 case studies, 4 whitepapers. Emphasis on topic clusters and content silos.",
      "🔍 Marcus Silva (Researcher)":
        "I recommend 40 long-tail keyword articles to capture quick wins. These have lower competition and can drive 200+ organic clicks monthly.",
      "✍️ Lisa Park (Writer)":
        "I can produce 20 articles/month. Suggest mix: 50% long-form (2000+ words), 30% mid-form (1000-1500 words), 20% short-form (500-800 words).",
      "🔧 James Rodriguez (On-Page)":
        "Each article needs: keyword-optimized title, compelling meta description, 2-3 H2s with semantic variations, internal links (3-5), and CTA.",
      "⚙️ Dr. Patel (Technical)":
        "Recommend: structured data for articles, optimized URL structure, fast loading, mobile responsiveness, and proper canonicalization.",
      "📊 Emma Thompson (Tracker)":
        "I'll track 200 keywords monthly. We should see 50+ keyword rankings by month 3, 150+ by month 6 if executed properly.",
    },
    debate: [
      "Lisa: 'Creating 20 articles/month plus optimization is aggressive. Can we prioritize?'",
      "Sarah: 'Let's start with 12 pillar articles + 8 long-tail articles. Focus quality over quantity first month.'",
      "Marcus: 'Agreed. Once we get momentum, we can scale. The long-tail articles will give quick wins.'",
      "James: 'But each needs full optimization. I need 2-3 days per article for complete on-page work.'",
      "Dr. Patel: 'We can batch similar topics for efficiency. Technical setup is similar across cluster articles.'",
      "Sarah: 'Good point. Let's work in topic clusters. One sprint = 1 pillar + supporting articles from same cluster.'",
    ],
    consensus:
      "Launch in 4 sprints: each sprint = 1 topic cluster with 1 pillar page + 3-4 supporting articles. Total: 4 pillar + 15 cluster articles/month. Batch work by topic.",
    actionItems: [
      "Sarah: Define 4 topic clusters and assign priorities",
      "Marcus: Research and validate keywords for each cluster",
      "Lisa: Create detailed content calendar and outlines",
      "James: Build on-page optimization templates for each article type",
      "Dr. Patel: Configure technical setup for topic clusters",
      "Emma: Create tracking dashboard for cluster performance",
    ],
  },
};

export default function SEOChatPage() {
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "discussion"; content: string | Discussion }>
  >([
    {
      type: "user",
      content: "Ask your SEO team about keywords, content strategy, technical SEO, or rankings!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setInput("");
    setLoading(true);

    // Simulate team discussion
    setTimeout(() => {
      let discussion: Discussion | null = null;

      if (
        input.toLowerCase().includes("keyword") ||
        input.toLowerCase().includes("target")
      ) {
        discussion = SAMPLE_DISCUSSIONS.keyword;
      } else if (
        input.toLowerCase().includes("content") ||
        input.toLowerCase().includes("strategy")
      ) {
        discussion = SAMPLE_DISCUSSIONS.content;
      } else {
        discussion = SAMPLE_DISCUSSIONS.keyword; // Default
      }

      discussion.userQuery = input;
      setMessages((prev) => [...prev, { type: "discussion", content: discussion! }]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-2">🎯 SEO Team Discussion</h1>
        <p className="text-gray-600">
          6 SEO experts discussing and debating the best approach for your site
        </p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx}>
            {msg.type === "user" && (
              <div className="flex justify-end mb-4">
                <div className="bg-blue-600 text-white px-4 py-3 rounded-lg max-w-md">
                  <p className="font-semibold">Your Question:</p>
                  <p className="text-sm mt-1">{msg.content as string}</p>
                </div>
              </div>
            )}

            {msg.type === "discussion" && (
              <div className="space-y-4">
                <div className="discussion">
                  <h3 className="font-bold text-lg mb-4">📋 Team Perspectives:</h3>

                  {/* Team Members Perspectives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {Object.entries(
                      (msg.content as Discussion).teamMembers
                    ).map(([member, perspective]) => (
                      <div
                        key={member}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-l-4 border-blue-500"
                      >
                        <p className="font-semibold text-sm mb-2">{member}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {perspective}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Team Debate */}
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-6">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      💬 Team Discussion & Debate
                    </h4>
                    <div className="space-y-2">
                      {(msg.content as Discussion).debate.map((point, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-yellow-600 font-bold">→</span>
                          <p className="text-gray-700">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Consensus */}
                  <div className="bg-green-50 rounded-lg p-4 border-2 border-green-500 mb-6">
                    <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      ✅ Team Consensus & Final Recommendation
                    </h4>
                    <p className="text-green-800 font-semibold">
                      {(msg.content as Discussion).consensus}
                    </p>
                  </div>

                  {/* Action Items */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      📌 Action Items by Team Member
                    </h4>
                    <ul className="space-y-2">
                      {(msg.content as Discussion).actionItems.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-blue-800">
                          <span className="font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="animate-spin">⏳</div>
            <p className="text-gray-600">Team is discussing and debating...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your SEO team (try: keywords, content strategy, technical SEO)..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Ask Team
        </button>
      </div>
    </div>
  );
}
