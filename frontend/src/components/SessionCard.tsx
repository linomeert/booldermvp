import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Session } from "../types";
import {
  deleteSession,
  deleteClimb,
  fistbumpSession,
  getSessionComments,
  createComment,
  deleteComment,
} from "../api";
import { useAuth } from "../context/AuthContext";

interface SessionCardProps {
  session: Session;
  showDelete?: boolean;
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return "In progress";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const SessionCard = ({
  session,
  showDelete = false,
}: SessionCardProps) => {
  const [showAllClimbs, setShowAllClimbs] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isBuzzing, setIsBuzzing] = useState(false);
  const [commentText, setCommentText] = useState("");
  const climbs = session.climbs || [];

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
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const hasFistbumped = user ? session.fistbumps?.includes(user.id) : false;

  const { data: comments } = useQuery({
    queryKey: ["comments", session.id],
    queryFn: () => getSessionComments(session.id),
    enabled: showComments,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["mySessions"] });
    },
  });

  const deleteClimbMutation = useMutation({
    mutationFn: deleteClimb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["mySessions"] });
    },
  });

  const fistbumpMutation = useMutation({
    mutationFn: fistbumpSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["feed-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (text: string) => createComment(session.id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", session.id] });
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", session.id] });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      createCommentMutation.mutate(commentText.trim());
    }
  };

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

  const handleDeleteClimb = (e: React.MouseEvent, climbId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this climb?")) {
      deleteClimbMutation.mutate(climbId);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden ${
        isBuzzing ? "animate-buzz" : ""
      }`}
    >
      <div className="p-6">
        {/* User info header for feed */}
        {session.user && (
          <div className="mb-4 pb-3 border-b">
            <Link
              to={`/profile/${session.user.username}`}
              className="flex items-center space-x-3 mb-2 hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://avatar.iran.liara.run/public?username=${session.user.username}`}
                  alt={session.user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {session.user.name}
                </div>
                <div className="text-sm text-gray-600">
                  @{session.user.username}
                </div>
              </div>
            </Link>
            {/* Participants */}
            {session.participants && session.participants.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <span>with</span>
                <div className="flex flex-wrap gap-1">
                  {session.participants.map(
                    (participant: any, index: number) => (
                      <Link
                        key={participant.id || participant}
                        to={`/profile/${
                          typeof participant === "object"
                            ? participant.username
                            : participant
                        }`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {typeof participant === "object"
                          ? participant.name
                          : participant}
                        {index < session.participants.length - 1 && ","}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <Link to={`/sessions/${session.id}`} className="block">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">
                {session.locationType === "indoor" ? "🏢" : "⛰️"}
              </span>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {session.gym?.name || session.crag?.name || "Session"}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(session.startedAt)}
                </p>
              </div>
            </div>
            {showDelete && (
              <button
                onClick={handleDeleteSession}
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                title="Delete session"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {session.climbCount}
              </div>
              <div className="text-xs text-gray-600">Climbs</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {session.topsCount}
              </div>
              <div className="text-xs text-gray-600">Tops</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {session.projectsCount}
              </div>
              <div className="text-xs text-gray-600">Projects</div>
            </div>

            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  session.hardestGrade?.toLowerCase() === "white"
                    ? "text-gray-800"
                    : session.hardestGrade?.toLowerCase() === "yellow"
                    ? "text-yellow-600"
                    : session.hardestGrade?.toLowerCase() === "orange"
                    ? "text-orange-600"
                    : session.hardestGrade?.toLowerCase() === "green"
                    ? "text-green-600"
                    : session.hardestGrade?.toLowerCase() === "blue"
                    ? "text-blue-600"
                    : session.hardestGrade?.toLowerCase() === "red"
                    ? "text-red-600"
                    : session.hardestGrade?.toLowerCase() === "purple"
                    ? "text-purple-600"
                    : session.hardestGrade?.toLowerCase() === "black"
                    ? "text-gray-900"
                    : "text-purple-600"
                }`}
              >
                {session.hardestGrade || "N/A"}
              </div>
              <div className="text-xs text-gray-600">Hardest</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 border-t pt-3">
            <span className="font-semibold">Duration:</span>{" "}
            {formatDuration(session.durationSeconds)}
            {session.syncedToStrava && (
              <span className="ml-3 text-orange-600">🏃 Strava</span>
            )}
          </div>
        </Link>
      </div>

      {/* Fistbump button */}
      <div className="px-6 pb-4 pt-3 border-t">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsBuzzing(true);
            fistbumpMutation.mutate(session.id);
            setTimeout(() => setIsBuzzing(false), 500);
          }}
          disabled={fistbumpMutation.isPending}
          className={`flex items-center gap-2 transition-colors ${
            hasFistbumped
              ? "text-orange-600"
              : "text-gray-500 hover:text-orange-600"
          }`}
        >
          <span className="text-2xl">👊</span>
          <span className="font-medium text-sm">
            {session.fistbumpCount || 0}
          </span>
        </button>
      </div>

      {climbs.length > 0 && (
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            {visibleClimbs.map((climb) => (
              <Link
                key={climb.id}
                to={`/climbs/${climb.id}`}
                className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow relative group ${
                  climb.status === "project" ? "opacity-60" : ""
                }`}
              >
                {climb.mediaUrl ? (
                  <div className="relative h-24 bg-gray-100">
                    <img
                      src={climb.mediaUrl}
                      alt={`Climb ${climb.grade}`}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute top-1 right-1 text-xs px-2 py-1 rounded shadow-md ${
                        climb.grade.toLowerCase() === "white"
                          ? "bg-white border border-gray-300 text-gray-800"
                          : climb.grade.toLowerCase() === "yellow"
                          ? "bg-yellow-400 text-gray-800"
                          : climb.grade.toLowerCase() === "orange"
                          ? "bg-orange-500 text-white"
                          : climb.grade.toLowerCase() === "green"
                          ? "bg-green-600 text-white"
                          : climb.grade.toLowerCase() === "blue"
                          ? "bg-blue-600 text-white"
                          : climb.grade.toLowerCase() === "red"
                          ? "bg-red-600 text-white"
                          : climb.grade.toLowerCase() === "purple"
                          ? "bg-purple-600 text-white"
                          : climb.grade.toLowerCase() === "black"
                          ? "bg-gray-900 text-white"
                          : "bg-black bg-opacity-70 text-white"
                      }`}
                    >
                      {climb.grade}
                    </div>
                    {showDelete && (
                      <button
                        onClick={(e) => handleDeleteClimb(e, climb.id)}
                        className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete climb"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={`h-24 flex items-center justify-center relative ${
                      climb.grade.toLowerCase() === "white"
                        ? "bg-white border-2 border-gray-300"
                        : climb.grade.toLowerCase() === "yellow"
                        ? "bg-yellow-400"
                        : climb.grade.toLowerCase() === "orange"
                        ? "bg-orange-500"
                        : climb.grade.toLowerCase() === "green"
                        ? "bg-green-600"
                        : climb.grade.toLowerCase() === "blue"
                        ? "bg-blue-600"
                        : climb.grade.toLowerCase() === "red"
                        ? "bg-red-600"
                        : climb.grade.toLowerCase() === "purple"
                        ? "bg-purple-600"
                        : climb.grade.toLowerCase() === "black"
                        ? "bg-gray-900"
                        : "bg-gradient-to-br from-gray-100 to-gray-200"
                    }`}
                  >
                    <span
                      className={`text-3xl font-bold ${
                        ["white", "yellow"].includes(climb.grade.toLowerCase())
                          ? "text-gray-800"
                          : [
                              "black",
                              "blue",
                              "red",
                              "purple",
                              "green",
                              "orange",
                            ].includes(climb.grade.toLowerCase())
                          ? "text-white"
                          : "text-gray-400"
                      }`}
                    >
                      {climb.grade}
                    </span>
                    {showDelete && (
                      <button
                        onClick={(e) => handleDeleteClimb(e, climb.id)}
                        className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete climb"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
                <div className="p-2 flex items-center justify-between">
                  {climb.status === "project" ? (
                    <span className="text-xs text-gray-600">project</span>
                  ) : (
                    <>
                      {climb.attempts === 1 && (
                        <span className="text-xs font-bold text-orange-600">
                          ⚡ Flash!
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Link>
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

      {/* Comments Section */}
      <div className="border-t">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowComments(!showComments);
          }}
          className="w-full px-6 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">
              {comments?.length || 0}{" "}
              {comments?.length === 1 ? "Comment" : "Comments"}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 transition-transform ${
              showComments ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {showComments && (
          <div className="px-6 pb-4 bg-gray-50">
            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    !commentText.trim() || createCommentMutation.isPending
                  }
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {createCommentMutation.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {comments && comments.length > 0 ? (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-white rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        <Link
                          to={`/profile/${comment.user?.username}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                            <img
                              src={`https://avatar.iran.liara.run/public?username=${comment.user?.username}`}
                              alt={comment.user?.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/profile/${comment.user?.username}`}
                            className="font-semibold text-sm text-gray-900 hover:text-primary-600"
                          >
                            {comment.user?.name}
                          </Link>
                          <p className="text-sm text-gray-800 mt-1">
                            {comment.text}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      {user?.id === comment.userId && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm("Delete this comment?")) {
                              deleteCommentMutation.mutate(comment.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete comment"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">
                No comments yet
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
