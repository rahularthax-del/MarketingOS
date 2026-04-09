"use client";

import { useEffect, useState } from "react";

interface ActivityItem {
  id: string;
  agent: string;
  action: string;
  reasoning?: string;
  result?: string;
  status: "success" | "error" | "warning";
  createdAt: string;
}

export default function ActivityLog({ brandId }: { brandId: string }) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [brandId]);

  const fetchActivities = async () => {
    try {
      const res = await fetch(`/api/logs?brandId=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading activity log...</div>;
  }

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-sm">No activities yet</p>
      ) : (
        activities.map((item) => (
          <div
            key={item.id}
            className={`border-l-4 pl-4 py-3 ${
              item.status === "success"
                ? "border-green-500 bg-green-50"
                : item.status === "error"
                  ? "border-red-500 bg-red-50"
                  : "border-yellow-500 bg-yellow-50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {item.agent}
                  <span className="ml-2 text-xs font-normal text-gray-600">
                    {item.action}
                  </span>
                </p>
                {item.reasoning && (
                  <p className="text-xs text-gray-700 mt-1">{item.reasoning}</p>
                )}
                {item.result && (
                  <p className="text-xs text-gray-600 mt-1">
                    Result: {item.result}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {new Date(item.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
