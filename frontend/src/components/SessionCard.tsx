import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "../types";
import { deleteSession, fistbumpSession } from "../api";
import { useAuth } from "../context/AuthContext";
import { useSessionComments } from "../hooks/useSessionComments";
import { SessionCardHeader } from "./session/SessionCardHeader";
import { GradeSummaryGrid } from "./session/GradeSummaryGrid";
import { SessionStatsBar } from "./session/SessionStatsBar";
import { SessionTitle } from "./session/SessionTitle";
import { SessionFistbumpSection } from "./session/SessionFistbumpSection";
import { SessionCommentsToggle } from "./session/SessionCommentsToggle";
import { ClimbCard } from "./ClimbCard";

interface SessionCardProps {
  session: Session;
  showDelete?: boolean;
}

export const SessionCard = ({
  session,
  showDelete = false,
}: SessionCardProps) => {
  const [showAllClimbs, setShowAllClimbs] = useState(false);
  const [isBuzzing, setIsBuzzing] = useState(false);
  const climbs = session.climbs || [];
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    comments,
    commentText,
    setCommentText,
    submitComment,
    deleteComment,
    isSubmitting,
  } = useSessionComments(session.id, { enabled: true });

  const hasFistbumped = user ? session.fistbumps?.includes(user.id) : false;

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["mySessions"] });
    },
  });

  // Sort climbs: flashes first, then tops, then projects
  const sortedClimbs = [...climbs].sort((a, b) => {
    const aIsFlash = a.status === "top" && a.attempts === 1;
    const bIsFlash = b.status === "top" && b.attempts === 1;
    const aIsTop = a.status === "top" && a.attempts !== 1;
    const bIsTop = b.status === "top" && b.attempts !== 1;

    if (aIsFlash && !bIsFlash) return -1;
    if (!aIsFlash && bIsFlash) return 1;
    if (aIsTop && !bIsTop) return -1;
    if (!aIsTop && bIsTop) return 1;
    return 0;
  });

  const visibleClimbs = showAllClimbs ? sortedClimbs : sortedClimbs.slice(0, 3);

  const fistbumpMutation = useMutation({
    mutationFn: fistbumpSession,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      await queryClient.cancelQueries({ queryKey: ["feed-sessions"] });

      // Snapshot previous values
      const previousFeed = queryClient.getQueryData(["feed"]);
      const previousFeedSessions = queryClient.getQueryData(["feed-sessions"]);

      // Optimistically update
      queryClient.setQueryData(
        ["feed-sessions"],
        (old: Session[] | undefined) => {
          if (!old) return old;
          return old.map((s) => {
            if (s.id === session.id) {
              const isCurrentlyFistbumped = s.fistbumps?.includes(
                user?.id || ""
              );
              return {
                ...s,
                fistbumps: isCurrentlyFistbumped
                  ? s.fistbumps.filter((id) => id !== user?.id)
                  : [...(s.fistbumps || []), user?.id || ""],
                fistbumpCount: isCurrentlyFistbumped
                  ? (s.fistbumpCount || 1) - 1
                  : (s.fistbumpCount || 0) + 1,
              };
            }
            return s;
          });
        }
      );

      return { previousFeed, previousFeedSessions };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(["feed"], context.previousFeed);
      }
      if (context?.previousFeedSessions) {
        queryClient.setQueryData(
          ["feed-sessions"],
          context.previousFeedSessions
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });

  const handleDeleteSession = (e: React.MouseEvent) => {
    e.preventDefault();
    if (
      window.confirm(
        "Are you sure you want to delete this session and all its climbs?"
      )
    ) {
      deleteSessionMutation.mutate(session.id);
    }
  };

  return (
    <div
      className={`shadow-xl hover:shadow-xl transition-shadow overflow-hidden ${
        isBuzzing ? "animate-buzz" : ""
      }`}
      style={{
        borderBottom: "1px solid #384152",
      }}
    >
      <div className="p-4">
        {/* User info header for feed */}
        <SessionCardHeader session={session} />

        <Link to={`/sessions/${session.id}`} className="block">
          <SessionTitle
            session={session}
            onDelete={handleDeleteSession}
            showDelete={showDelete}
          />

          {/* Custom grade summary grid */}
          {climbs.length > 0 && <GradeSummaryGrid climbs={climbs} />}

          <div className="text-sm text-white  pt-3 flex justify-between gap-4">
            <SessionStatsBar
              climbs={climbs}
              durationSeconds={session.durationSeconds}
              syncedToStrava={session.syncedToStrava}
            />
          </div>
        </Link>
      </div>

      <SessionFistbumpSection
        session={session}
        hasFistbumped={hasFistbumped}
        isPending={fistbumpMutation.isPending}
        onFistbump={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsBuzzing(true);
          fistbumpMutation.mutate(session.id);
          setTimeout(() => setIsBuzzing(false), 500);
        }}
      />

      {climbs.length > 0 && (
        <div className="bg-[#1e252e] px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            {visibleClimbs.map((climb) => (
              <ClimbCard
                key={climb.id}
                climb={climb}
                showDelete={!session.endedAt}
              />
            ))}
          </div>

          {climbs.length > 3 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowAllClimbs(!showAllClimbs);
              }}
              className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showAllClimbs ? "Show less" : `Show ${climbs.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {/* Comments Toggle Section */}
      <SessionCommentsToggle
        comments={comments}
        currentUserId={user?.id}
        commentText={commentText}
        onChangeCommentText={setCommentText}
        onSubmitComment={(text) => {
          const trimmed = text.trim();
          if (!trimmed) return;
          submitComment(text);
        }}
        onDeleteComment={deleteComment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
