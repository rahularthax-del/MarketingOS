"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";

interface ContentItem {
  date: string;
  platform: string;
  theme: string;
  status: "draft" | "scheduled" | "published";
}

export default function ContentCalendarPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        const res = await fetch("/api/social-posts");
        if (res.ok) {
          const posts = await res.json();
          // Transform posts into calendar items
          const calendarItems: ContentItem[] = posts.map((p: any) => ({
            date: new Date(p.scheduledAt || p.createdAt).toLocaleDateString(),
            platform: p.platform,
            theme: p.content.substring(0, 50),
            status: p.status,
          }));
          setItems(calendarItems);
        }
      }
      setLoading(false);
    };

    loadItems();
  }, []);

  if (loading) {
    return <div>Loading calendar...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Calendar</h1>
        <p className="text-gray-600">Plan and manage your social content</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Add Content
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No content scheduled yet</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.date}</p>
                  <p className="text-sm text-gray-600">{item.platform}</p>
                  <p className="text-sm text-gray-700 mt-1">{item.theme}</p>
                </div>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    item.status === "published"
                      ? "bg-green-100 text-green-800"
                      : item.status === "scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
