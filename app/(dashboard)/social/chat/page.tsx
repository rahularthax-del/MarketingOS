"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";
import ChatInterface from "@/components/shared/chat-interface";

export default function SocialTeamChatPage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const initSession = async () => {
      const session = await getSession();
      if (session?.user?.id) {
        // Fetch brand ID
        const res = await fetch("/api/brand");
        if (res.ok) {
          const brand = await res.json();
          setBrandId(brand.id);
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!brandId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-600">Please set up your brand first</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <ChatInterface
        endpoint="/api/chat/social"
        brandId={brandId}
        team="Social Media Marketing"
      />
    </div>
  );
}
