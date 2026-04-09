"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Message {
  role: string;
  content: string;
  imageUrl?: string;
}

export default function SocialChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Social Media team. I can help you create content, plan posting schedules, and generate detailed poster design concepts. Try asking me to 'Design a poster for...' and I'll create a complete design concept for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [brandId, setBrandId] = useState<string>("");

  // Get brand ID
  useEffect(() => {
    const fetchBrand = async () => {
      const res = await fetch("/api/brand");
      if (res.ok) {
        const brandData = await res.json();
        setBrandId(brandData.id);
      }
    };
    if (session?.user?.id) {
      fetchBrand();
    }
  }, [session]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Check if user is asking for poster/image generation
      const isPosterRequest = /poster|design|image|visual|graphic|create.*post|generate.*post|prepare.*poster|similar.*poster|inspiration/i.test(userMessage);

      console.log("User message:", userMessage);
      console.log("Is poster request:", isPosterRequest);
      console.log("Brand ID:", brandId);

      if (isPosterRequest && brandId) {
        console.log("Generating poster for:", userMessage);

        // Add loading message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "🎨 Generating your poster... This may take a moment...",
          },
        ]);

        const res = await fetch("/api/social/generate-poster", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userMessage,
            brandId,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => {
            const newMessages = [...prev];
            // Remove the loading message and add the poster
            newMessages.pop();
            return [
              ...newMessages,
              {
                role: "assistant",
                content: `✨ Your poster for: "${userMessage}"\n\n💡 **Tip:** For better posters, provide more details like:\n- "Design a poster for [specific product/service]\n- Target audience: [who you're reaching]\n- Key message: [what you want to communicate]"`,
                imageUrl: data.imageUrl,
              },
            ];
          });
        } else {
          const error = await res.json();
          console.error("API error:", error);
          setMessages((prev) => {
            const newMessages = [...prev];
            // Remove loading message
            newMessages.pop();
            return [
              ...newMessages,
              {
                role: "assistant",
                content: `I'd love to create a better poster! Please tell me more:\n\n**What is your product/service?**\n- ArthaxAI is: [AI marketing platform, tool, service?]\n- We help: [target audience] with [specific problem]\n- Key features: [main selling points]\n\nOnce I understand what you offer, I can create much better posters that match your brand!`,
              },
            ];
          });
        }
      } else {
        // Generic response for non-poster requests
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I can help! For poster generation, try asking:\n- 'Design a poster for...'\n- 'Create a visual for...'\n- 'Generate an image for...'\n\nYou can also upload reference images for inspiration!",
          },
        ]);
      }
    } catch (error) {
      console.error("Error in handleSend:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold mb-2">Social Media Team Chat</h1>
        <p className="text-gray-600">Chat with your AI-powered Social Media team</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-2xl px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.imageUrl && (
                <div className="mt-4">
                  <img
                    src={msg.imageUrl}
                    alt="Generated poster"
                    className="w-full rounded-lg max-w-lg border border-gray-300"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("Image failed to load:", msg.imageUrl);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="mt-3 flex gap-2">
                    <a
                      href={msg.imageUrl}
                      download={`poster-${Date.now()}.png`}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 inline-block"
                    >
                      📥 Download Poster
                    </a>
                    <a
                      href={msg.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 inline-block"
                    >
                      🔗 Open in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <p>Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask your Social Media team... e.g., 'Design a poster for our product launch'"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
