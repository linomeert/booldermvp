import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as api from "../api";
import { FeedItemCard } from "../components/FeedItemCard";
import { SessionCard } from "../components/SessionCard";
import { FloatingActionButton } from "../components/FloatingActionButton";
import { useAuth } from "../context/AuthContext";
import type { Climb, Session } from "../types";

type FeedItem =
  | { type: "climb"; data: Climb }
  | { type: "session"; data: Session };

export const FeedPage = () => {
  const { user: currentUser } = useAuth();

  const { data: climbs, isLoading: climbsLoading } = useQuery({
    queryKey: ["feed"],
    queryFn: api.getFeed,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["feed-sessions"],
    queryFn: api.getFeedSessions,
  });

  const isLoading = climbsLoading || sessionsLoading;

  // Merge and sort climbs and sessions by date
  const feedItems: FeedItem[] = [];

  // Get session IDs to filter out climbs that are part of sessions
  const sessionIds = new Set(sessions?.map((s) => s.id) || []);

  if (climbs) {
    // Only show climbs that are NOT part of a session
    climbs.forEach((climb) => {
      if (!climb.sessionId || !sessionIds.has(climb.sessionId)) {
        feedItems.push({ type: "climb", data: climb });
      }
    });
  }

  if (sessions) {
    // Show all sessions (both active and completed)
    sessions.forEach((session) => {
      feedItems.push({ type: "session", data: session });
    });
  }

  feedItems.sort((a, b) => {
    const dateA = new Date(
      a.type === "climb"
        ? a.data.createdAt
        : a.data.startedAt || a.data.endedAt || a.data.createdAt
    ).getTime();
    const dateB = new Date(
      b.type === "climb"
        ? b.data.createdAt
        : b.data.startedAt || b.data.endedAt || b.data.createdAt
    ).getTime();
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center text-gray-600">Loading feed...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Recent Activity</h1>

      <div className="space-y-6">
        {feedItems.length > 0 ? (
          feedItems.map((item) =>
            item.type === "climb" ? (
              <FeedItemCard
                key={`climb-${item.data.id}`}
                climb={item.data}
                showDelete={false}
              />
            ) : (
              <SessionCard
                key={`session-${item.data.id}`}
                session={item.data}
                showDelete={false}
              />
            )
          )
        ) : (
          <div className="text-center text-gray-600 py-12">
            No activity yet. Start logging climbs or sessions!
          </div>
        )}
      </div>

      <FloatingActionButton />
    </div>
  );
};
