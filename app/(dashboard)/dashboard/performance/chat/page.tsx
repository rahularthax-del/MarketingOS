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
  campaign: {
    userQuery: "How should we structure our Q2 campaign strategy?",
    teamMembers: {
      "🎯 Sarah Kim (Strategy Lead)":
        "I recommend a 3-tier funnel: (1) Awareness - 40% budget on prospecting, (2) Consideration - 35% on engagement and retargeting, (3) Conversion - 25% on high-intent audiences. ROAS targets: Awareness 2x, Consideration 3x, Conversion 5x.",
      "🏗️ David Chen (Campaign Architect)":
        "For structure, I propose 12 campaigns total: 4 awareness, 5 consideration, 3 conversion. Each with 3-4 ad sets for testing. Use value-based lookalike audiences for prospecting.",
      "🎨 Lisa Rodriguez (Creative Analyst)":
        "On creatives: test 3 variations per campaign - video ads perform 2.3x better than static. Recommend mix: 60% video, 25% carousel, 15% static. Budget allocation per creative based on performance weekly.",
      "💰 Marcus Johnson (Bid Optimizer)":
        "For bidding, I suggest: Awareness campaigns = Cost Cap @$3, Consideration = Target CPA @$15, Conversion = Target ROAS @4x. Daily budgets: Awareness $500, Consideration $400, Conversion $200.",
      "📊 Emma Thompson (Reporting Analyst)":
        "I'll track KPIs: Awareness (CPM, CTR), Consideration (CPC, landing page CTR), Conversion (ROAS, CPA, conversion rate). Weekly reviews. Expected results by week 3: 2x ROAS average across all campaigns.",
    },
    debate: [
      "Sarah: 'That's aggressive. Can we scale from $1,100/day?'",
      "Marcus: 'Yes, but let's ramp: Week 1 $600, Week 2 $900, Week 3+ $1,100. Let algorithm learn.'",
      "David: 'Agreed. And we should pause underperformers by day 5 if ROAS < 1.5x.'",
      "Lisa: 'Fresh creatives matter. Can I add new variations weekly?'",
      "Emma: 'Yes. But let's keep winners 3+ weeks. I'll flag which to keep/rotate.'",
      "Sarah: 'Perfect. David, timeline for campaign setup?'",
      "David: 'I can have all 12 campaigns live by Friday if creatives are ready by Wednesday.'",
    ],
    consensus:
      "12-campaign strategy across 3 funnel tiers with progressive budget scaling ($600→$1,100/day). Weekly creative rotation, data-driven pausing at 1.5x ROAS threshold. Target 2x average ROAS by week 3.",
    actionItems: [
      "Sarah: Finalize audience segments and budget allocation",
      "David: Build 12 campaign structures and 24 ad sets by Wednesday",
      "Lisa: Create 36 creative variations (3 per campaign) - prioritize videos",
      "Marcus: Configure smart bidding strategies and daily budgets",
      "Emma: Set up reporting dashboard and automated alerts for underperformers",
      "Team: Review and launch Friday morning",
    ],
  },
  optimization: {
    userQuery: "We're spending $1,500/day but only getting 1.8x ROAS. How do we fix this?",
    teamMembers: {
      "🎯 Sarah Kim (Strategy Lead)":
        "1.8x ROAS means you're barely profitable. Issues likely: (1) Broad targeting, (2) Cold audience fatigue, (3) Weak landing page, (4) Poor bid strategy. Let's audit each. Target: 3.5x ROAS minimum.",
      "🏗️ David Chen (Campaign Architect)":
        "I see the issue - 8 campaigns, but 3 are completely dead (<1x ROAS). Pause those immediately, reallocate to winners. Also, audiences are too broad - 'interests in marketing' is massive. Tighten to specific interests + value-based lookalikes.",
      "🎨 Lisa Rodriguez (Creative Analyst)":
        "Creative fatigue is real. Same ads running 30 days. Frequency: 6.2x average. Solution: Pause all ads, rotate 100% new creatives. Switch 50% to video format. Test new messaging angles.",
      "💰 Marcus Johnson (Bid Optimizer)":
        "Bid strategy is problematic - using Maximize Conversion on awareness campaigns (wrong signal). Switch Awareness to Cost Cap @$2 (vs current $4). Consideration to Target CPA @$12 (vs $18). This alone could save 35%.",
      "📊 Emma Thompson (Reporting Analyst)":
        "Data analysis: Conversion campaigns performing well (3.2x ROAS) but awareness dragging (1.1x). Budget is misallocated - 50% on awareness at 1.1x. Reallocate: Awareness 25%, Consideration 30%, Conversion 45%.",
    },
    debate: [
      "Sarah: 'Okay, we pause 3 campaigns - that's -$500/day spend. Reallocate where?'",
      "Emma: 'Top performer is conversion at 3.2x. Put $400 there. Rest to consideration testing.'",
      "David: 'Agree. Let me also tighten targeting. Can probably cut audience by 70%, keep 95% of conversions.'",
      "Lisa: 'New creatives take time. Can I have 4 days? Or should we pause early and restart?'",
      "Marcus: 'Pause is safer. Better to restart right than limp along. I'm ready immediately with new bidding.'",
      "Sarah: 'Okay: pause all ads TODAY, update bidding, launch new creatives Friday. Emma, can you restart budget 50% on Conversion, 30% Consideration, 20% Awareness?'",
      "Emma: 'Done. I'll monitor hourly for first 48 hours.'",
    ],
    consensus:
      "Emergency optimization: Pause 3 underperforming campaigns immediately. Reallocate $1,500/day as: 45% Conversion, 30% Consideration, 25% Awareness. Launch 100% fresh creatives Friday with new bidding strategy. Expected result: 2.8-3.2x ROAS within 7 days.",
    actionItems: [
      "Sarah: Approve pause and reallocation today",
      "David: Tighten targeting to high-intent audiences only",
      "Lisa: Create 20 new creative variations with video focus - deliver by Thursday EOD",
      "Marcus: Update bid strategies to Cost Cap and Target CPA",
      "Emma: Reorganize budget allocation and set up hourly alerts Friday-Sunday",
      "Team: Daily optimization calls Mon-Wed to track performance",
    ],
  },
};

export default function PerformanceChatPage() {
  const [messages, setMessages] = useState<
    Array<{ type: "user" | "discussion"; content: string | Discussion }>
  >([
    {
      type: "user",
      content: "Ask our 5-person performance marketing team about campaign strategy, optimization, creatives, or bidding!",
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
        input.toLowerCase().includes("campaign") ||
        input.toLowerCase().includes("strategy") ||
        input.toLowerCase().includes("structure")
      ) {
        discussion = SAMPLE_DISCUSSIONS.campaign;
      } else if (
        input.toLowerCase().includes("optimize") ||
        input.toLowerCase().includes("improve") ||
        input.toLowerCase().includes("roas") ||
        input.toLowerCase().includes("fix")
      ) {
        discussion = SAMPLE_DISCUSSIONS.optimization;
      } else {
        discussion = SAMPLE_DISCUSSIONS.campaign; // Default
      }

      discussion.userQuery = input;
      setMessages((prev) => [...prev, { type: "discussion", content: discussion! }]);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-2">💰 Performance Marketing Team Discussion</h1>
        <p className="text-gray-600">
          5 performance experts (Strategy Lead, Campaign Architect, Creative Analyst, Bid Optimizer, Reporting) discussing ROI optimization
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
                        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500"
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
                      ✅ Team Consensus & Action Plan
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
            <p className="text-gray-600">Team is analyzing and debating strategy...</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your performance team (try: campaign structure, optimization, ROAS improvement)..."
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
