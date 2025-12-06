import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import type { Climb, Session } from "../../../backend/src/types";

export type FeedItem =
  | { type: "climb"; data: Climb; sortDate: number }
  | { type: "session"; data: Session; sortDate: number };

export const useFeed = () => {
  const {
    data: climbs,
    isLoading: climbsLoading,
    error: climbsError,
  } = useQuery({
    queryKey: ["feed"],
    queryFn: api.getFeed,
  });

  const {
    data: sessions,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useQuery({
    queryKey: ["feed-sessions"],
    queryFn: api.getFeedSessions,
  });

  const isLoading = climbsLoading || sessionsLoading;
  const error = climbsError || sessionsError;

  const feedItems: FeedItem[] = useMemo(() => {
    if (!climbs && !sessions) return [];

    const sessionIds = new Set(sessions?.map((s) => s.id) ?? []);
    const items: FeedItem[] = [];

    climbs?.forEach((climb) => {
      if (!climb.sessionId || !sessionIds.has(climb.sessionId)) {
        items.push({
          type: "climb",
          data: climb,
          sortDate: new Date(climb.createdAt).getTime(),
        });
      }
    });

    sessions?.forEach((session) => {
      const dateString = session.endedAt ?? session.startedAt;
      items.push({
        type: "session",
        data: session,
        sortDate: new Date(dateString).getTime(),
      });
    });

    items.sort((a, b) => b.sortDate - a.sortDate);
    return items;
  }, [climbs, sessions]);

  return { feedItems, isLoading, error };
};
