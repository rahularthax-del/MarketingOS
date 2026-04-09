"use client";

import { useState } from "react";

interface Discussion {
  userQuery: string;
  teamMembers: {
    [key: string]: string;
  };
  debate: string[];
  consensus: string;
  actionItems: string[];
}

const SAMPLE_DISCUSSIONS: { [key: string]: Discussion } = {
  content: {
    userQuery: "What content should we create for next month?",
    teamMembers: {
      "🎯 Alex Rivera (Strategist)":
        "I propose 40% Reels (high engagement), 30% educational posts, 20% behind-the-scenes, 10% user-generated content. Focus on trending sounds and hashtags.",
      "✍️ Jordan Lee (Content Creator)":
        "I can produce 3-4 Reels weekly + 5-6 feed posts. Suggest mix: 2 product demos, 2 customer stories, 2 tips/hacks, 1 trending sound per week.",
      "🎨 Maya Patel (Design Lead)":
        "I'll create visual assets for each post. Recommend consistent branding: primary color (#BFFF00) in 80% of posts, varied formats for A/B testing.",
      "👥 Chris Johnson (Community Manager)":
        "From engagement perspective: Reels with CTAs get 4.2% engagement. I suggest questions in captions to drive comments. Can manage responses daily.",
      "📊 Priya Singh (Analytics)":
        "Data shows Reels under 30 seconds get 25% more views. Peak engagement: 7-9 PM. Recommend 3 Reels + 2 posts daily at optimal times.",
      "🚀 Marcus Chen (Growth Hacker)":
        "For growth: collaborate with 3-5 complementary brands monthly, run 2 contests, use trending sounds 48 hours after launch. This can drive 20% follower growth.",
    },
    debate: [
      "Alex: 'Are we ready for daily Reels + posts? That's intensive production.'",
      "Jordan: 'Honestly, yes - but we need batching. Can we film 2 weeks of Reels in one session?'",
      "Maya: 'Absolutely. One design session for a week of posts. Batch by content type.'",
      "Marcus: 'Perfect! More consistent quality. Recommend 2-day batching sessions weekly.'",
      "Priya: 'Data supports this. Consistency matters more than volume for algorithm.'",
      "Chris: 'And I can prep community response templates in advance. Let's do it.'",
    ],
    consensus:
      "Weekly batching: 2-day content production (Reels + posts + assets). Daily posting: 3 Reels + 2 posts at 7-9 PM. Batch community management with pre-planned responses.",
    actionItems: [
      "Jordan: Create content calendar and batching schedule for next month",
      "Maya: Design branded templates for Reels, posts, and stories",
      "Alex: Research trending sounds/hashtags and plan content angles",
      "Chris: Create community response templates for common questions",
      "Priya: Set up analytics dashboard to track Reel vs post performance",
      "Marcus: Identify 5 brand collaboration opportunities and reach out",
    ],
  },
  engagement: {
    userQuery: "How can we improve our engagement rate from 2.8% to 5%?",
    teamMembers: {
      "🎯 Alex Rivera (Strategist)":
        "Current rate is 2.8%. To hit 5%, recommend: (1) More Reels (proven 4.7% engagement), (2) 100% CTAs on posts, (3) Response time < 1 hour, (4) Partnerships with larger accounts.",
      "✍️ Jordan Lee (Content Creator)":
        "Our Reels already hit 4.7% engagement. Problem: posts only 1.2%. Solution: Turn top-performing posts into Reel format. More calls-to-action in captions.",
      "🎨 Maya Patel (Design Lead)":
        "Visual engagement matters. Recommend: carousel posts (156 saves avg) over static posts (89 saves). Use contrasting colors, clear CTAs visually.",
      "👥 Chris Johnson (Community Manager)":
        "I see the data - we're slow to respond. Average response time: 4 hours. Influencers respond in <30 min. Let me commit to <1 hour response on all comments.",
      "📊 Priya Singh (Analytics)":
        "Analysis: Reels = 4.7%, Carousels = 3.5%, Static posts = 1.2%. We should shift mix: 50% Reels, 30% Carousels, 20% Static. This alone could hit 4%.",
      "🚀 Marcus Chen (Growth Hacker)":
        "Growth angle: Collaborations with accounts 10x our size boost engagement 80%. Can line up 4 collabs monthly. Plus: host bi-weekly Q&A lives (proven 6% engagement).",
    },
    debate: [
      "Jordan: 'Shifting to 50% Reels means heavy production. We have capacity?'",
      "Maya: 'If we batch smart - yes. One session produces 3 weeks of Reels.'",
      "Priya: 'Data is clear though. Reel format is non-negotiable for 5% engagement.'",
      "Alex: 'Agreed. Let's allocate resources. Priya, what if we did partnership posts?'",
      "Marcus: 'Partnership posts get 6.8% engagement! That's our secret weapon.'",
      "Chris: 'Cool, but I need response team scaled. Can't manage 6-8% engagement volume alone.'",
      "Alex: 'We'll hire one more. Budget approved for Q2. Let's commit to 5%.'",
    ],
    consensus:
      "Three-pronged approach: (1) Shift to 50% Reels, 30% Carousels, 20% Static posts, (2) Launch monthly brand partnerships (6.8% engagement), (3) Hire additional community manager. Target: 5% engagement by Q2 end.",
    actionItems: [
      "Priya: Create new posting mix and schedule",
      "Jordan: Ramp up Reel production (batching 3x weekly)",
      "Maya: Design carousel templates and partnership graphics",
      "Marcus: Close 4 brand partnership deals by month-end",
      "Chris: Hire second community manager and train on processes",
      "Alex: Weekly review meetings to track engagement progress",
    ],
  },
};

export default function SocialChatPage() {
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "discussion"; content: string | Discussion }>
  >([
    {
      type: "user",
      content: "Ask our 6-person social media team about content, engagement, growth, or strategy!",
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
        input.toLowerCase().includes("content") ||
        input.toLowerCase().includes("create")
      ) {
        discussion = SAMPLE_DISCUSSIONS.content;
      } else if (
        input.toLowerCase().includes("engagement") ||
        input.toLowerCase().includes("improve")
      ) {
        discussion = SAMPLE_DISCUSSIONS.engagement;
      } else {
        discussion = SAMPLE_DISCUSSIONS.content; // Default
      }

      discussion.userQuery = input;
      setMessages((prev) => [...prev, { type: "discussion", content: discussion! }]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-2">📱 Social Media Team Discussion</h1>
        <p className="text-gray-600">
          6 social media experts (Strategist, Content Creator, Design Lead, Community Manager, Analytics, Growth Hacker) discussing strategy
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
                        className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border-l-4 border-pink-500"
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
                      ✅ Team Consensus & Strategy
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
            <p className="text-gray-600">Team is discussing strategy...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your social team (try: content strategy, engagement, growth)..."
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
