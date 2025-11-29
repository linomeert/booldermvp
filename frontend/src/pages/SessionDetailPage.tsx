import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import * as api from "../api";
import { ClimbCard } from "../components/ClimbCard";
import { QuickLogModal } from "../components/QuickLogModal";
import { Climb } from "../types";
import { useAuth } from "../context/AuthContext";

export const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentDuration, setCurrentDuration] = useState<number>(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Climb | null>(null);
  const [logMode, setLogMode] = useState<"flash" | "top">("top");
  const [commentText, setCommentText] = useState("");
  const [sessionRating, setSessionRating] = useState<number>(0);
  const [sessionFeeling, setSessionFeeling] = useState("");

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", id],
    queryFn: () => api.getSessionById(id!),
    enabled: !!id,
  });

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: api.getFriends,
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.getMyClimbs({ status: "project" }),
    enabled: !!session && !session.endedAt,
  });

  const { data: comments } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => api.getSessionComments(id!),
    enabled: !!id,
  });

  const endSessionMutation = useMutation({
    mutationFn: () =>
      api.endSession(id!, {
        rating: sessionRating || undefined,
        feeling: sessionFeeling || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["feed-sessions"] });
      setShowEndModal(false);
      setSessionRating(0);
      setSessionFeeling("");
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: () => api.deleteSession(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["feed-sessions"] });
      // Navigate back to home after deleting
      window.location.href = "/";
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: (friendId: string) => api.addParticipant(id!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
      setShowAddFriendModal(false);
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (friendId: string) => api.removeParticipant(id!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (text: string) => api.createComment(id!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      createCommentMutation.mutate(commentText.trim());
    }
  };

  // Live timer for active sessions
  useEffect(() => {
    if (!session || session.endedAt) return;

    const updateDuration = () => {
      const start = new Date(session.startedAt).getTime();
      const now = Date.now();
      const durationInSeconds = Math.floor((now - start) / 1000);
      setCurrentDuration(durationInSeconds);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="text-center text-gray-600">Loading session...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Session not found
        </div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Add Climb Button - Sticky at top for active sessions */}
      {!session.endedAt && (
        <div className="sticky top-14 z-30 mb-4">
          <Link
            to={`/log?sessionId=${id}`}
            className="w-full bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-colors"
          >
            <span className="text-2xl">+</span>
            <span>Add Climb</span>
          </Link>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">
              {session.locationType === "indoor" ? "🏢" : "⛰️"}
            </span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {session.locationType === "indoor" ? "Indoor" : "Outdoor"}{" "}
                climbing session
                {session.gym?.name || session.crag?.name
                  ? ` at ${session.gym?.name || session.crag?.name}`
                  : ""}
              </h1>
              <p className="text-gray-600 mt-1">
                {formatDate(session.startedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        {!session.endedAt && session.participants && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Are you climbing with your crew?
              </h3>
              <button
                onClick={() => setShowAddFriendModal(true)}
                className="bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span>+</span>
                <span>Add Friend</span>
              </button>
            </div>
            {session.participants.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {session.participants.map((participant: any) => (
                  <div
                    key={participant.id || participant}
                    className="bg-gray-100 rounded-full px-4 py-2 flex items-center gap-2"
                  >
                    <span className="text-sm font-medium">
                      {participant.name || participant.username}
                    </span>
                    <button
                      onClick={() =>
                        removeParticipantMutation.mutate(
                          participant.id || participant
                        )
                      }
                      className="text-red-600 hover:text-red-700 text-lg font-bold"
                      title="Remove participant"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Solo sesh for now</p>
            )}
          </div>
        )}

        {/* Row of hardest grades (color/count) */}
        {session.climbs && session.climbs.length > 0 && (
          <div className="flex flex-row justify-center gap-6 mb-6">
            {(() => {
              // Count grades
              const gradeCounts: Record<string, number> = {};
              session.climbs.forEach((climb) => {
                const grade = climb.grade;
                if (!grade) return;
                gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
              });
              // Sort grades by difficulty (color order, fallback string sort)
              const colorOrder = [
                "white",
                "yellow",
                "orange",
                "green",
                "blue",
                "red",
                "purple",
                "black",
              ];
              const gradesSorted = Object.keys(gradeCounts)
                .sort((a, b) => {
                  const aIdx = colorOrder.indexOf(a.toLowerCase());
                  const bIdx = colorOrder.indexOf(b.toLowerCase());
                  if (aIdx !== -1 && bIdx !== -1) return bIdx - aIdx; // hardest first
                  if (aIdx !== -1) return 1;
                  if (bIdx !== -1) return -1;
                  return b.localeCompare(a); // fallback: string sort desc
                })
                .slice(0, 4);
              // Render
              return gradesSorted.map((grade) => {
                const count = gradeCounts[grade];
                // Color mapping for color grades
                const colorMap: Record<string, string> = {
                  white: "bg-white border-2 border-gray-300 text-gray-800",
                  yellow: "bg-yellow-400 text-gray-800",
                  orange: "bg-orange-500 text-white",
                  green: "bg-green-600 text-white",
                  blue: "bg-blue-600 text-white",
                  red: "bg-red-600 text-white",
                  purple: "bg-purple-600 text-white",
                  black: "bg-gray-900 text-white",
                };
                const colorKey = grade.toLowerCase();
                return (
                  <div
                    key={grade}
                    className="flex flex-col items-center justify-center"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold mb-1 text-base ${
                        colorMap[colorKey] || "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {count}
                    </div>
                    <div className="text-xs text-gray-700 font-medium capitalize">
                      {grade}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Row of other stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">
              {session.climbCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Climbs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {session.topsCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Tops</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-600">
              {session.projectsCount}
            </div>
            <div className="text-sm text-gray-600 mt-1">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">
              {session.hardestGrade || "N/A"}
            </div>
            <div className="text-sm text-gray-600 mt-1">Hardest Grade</div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <span className="font-semibold text-gray-700">Duration</span>
              <div
                className={`text-4xl font-mono font-bold ${
                  !session.endedAt ? "text-primary-600" : "text-gray-900"
                }`}
              >
                {formatDuration(
                  !session.endedAt
                    ? currentDuration
                    : session.durationSeconds || 0
                )}
              </div>
            </div>

            {!session.endedAt && (
              <button
                onClick={() => setShowEndModal(true)}
                disabled={endSessionMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-medium disabled:bg-gray-400 transition-colors"
              >
                {endSessionMutation.isPending ? "Ending..." : "End Session"}
              </button>
            )}

            {/* Rating Display */}
            {session.endedAt && session.rating && (
              <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200 w-full">
                <span className="font-semibold text-gray-700">
                  Session Rating
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-3xl">
                      {i < session.rating! ? "⭐" : "☆"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Feeling Display */}
            {session.endedAt && session.feeling && (
              <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200 w-full">
                <span className="font-semibold text-gray-700">How I Felt</span>
                <p className="text-gray-900 text-center italic">
                  "{session.feeling}"
                </p>
              </div>
            )}

            {session.endedAt && !session.syncedToStrava && (
              <button
                onClick={() => alert("Strava sync coming soon!")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <span className="text-xl">🏃</span>
                <span>Sync to Strava</span>
              </button>
            )}

            {session.syncedToStrava && (
              <div className="flex items-center text-orange-600">
                <span className="text-xl mr-2">🏃</span>
                <span className="text-sm font-medium">Synced to Strava</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects section - only show in active sessions */}
      {!session.endedAt && projects && projects.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <span className="text-sm text-gray-600">
              Quick add from your projects
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((climb) => (
              <ClimbCard
                key={climb.id}
                climb={climb}
                showDelete={false}
                showQuickLog={true}
                sessionId={id}
                onQuickLog={(mode) => {
                  setSelectedProject(climb);
                  setLogMode(mode);
                  setShowQuickLogModal(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Session Climbs</h2>
      </div>

      {session.climbs && session.climbs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {session.climbs.map((climb) => (
            <ClimbCard
              key={climb.id}
              climb={climb}
              showDelete={!session.endedAt}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-600">
          <p>No climbs logged in this session</p>
        </div>
      )}

      {/* End Session Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div>
              <div className="text-center">
                <div className="text-5xl mb-4">⏱️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  End Session
                </h3>
                <p className="text-gray-600 mb-6">
                  Rate your session and share how you felt!
                </p>
              </div>

              {/* Rating Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rate the session (1-5)
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSessionRating(star)}
                      className="text-4xl transition-transform hover:scale-110"
                    >
                      {star <= sessionRating ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feeling Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How did you feel? (optional)
                </label>
                <textarea
                  value={sessionFeeling}
                  onChange={(e) => setSessionFeeling(e.target.value)}
                  placeholder="Strong, tired, pumped, motivated..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to discard this session? All climbs will be permanently deleted."
                      )
                    ) {
                      deleteSessionMutation.mutate();
                    }
                  }}
                  disabled={
                    endSessionMutation.isPending ||
                    deleteSessionMutation.isPending
                  }
                  className="w-full bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 px-6 py-3 rounded-md font-medium transition-colors disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-400"
                >
                  {deleteSessionMutation.isPending
                    ? "Discarding..."
                    : "Discard Session"}
                </button>
                <button
                  onClick={() => endSessionMutation.mutate()}
                  disabled={
                    endSessionMutation.isPending ||
                    deleteSessionMutation.isPending
                  }
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors disabled:bg-gray-400"
                >
                  {endSessionMutation.isPending ? "Ending..." : "End Session"}
                </button>
                <button
                  onClick={() => {
                    setShowEndModal(false);
                    setSessionRating(0);
                    setSessionFeeling("");
                  }}
                  disabled={
                    endSessionMutation.isPending ||
                    deleteSessionMutation.isPending
                  }
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors disabled:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Friend to Session Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Add Friend to Session
              </h3>
              <button
                onClick={() => setShowAddFriendModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {friends && friends.length > 0 ? (
              <div className="space-y-2">
                {friends
                  .filter((friend) => {
                    const participantIds =
                      session.participants?.map((p: any) =>
                        typeof p === "string" ? p : p.id
                      ) || [];
                    return !participantIds.includes(friend.id);
                  })
                  .map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => addParticipantMutation.mutate(friend.id)}
                      disabled={addParticipantMutation.isPending}
                      className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            {friend.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            @{friend.username}
                          </div>
                        </div>
                      </div>
                      <span className="text-primary-600 font-bold text-xl">
                        +
                      </span>
                    </button>
                  ))}
                {friends.filter((friend) => {
                  const participantIds =
                    session.participants?.map((p: any) =>
                      typeof p === "string" ? p : p.id
                    ) || [];
                  return !participantIds.includes(friend.id);
                }).length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    All your friends are already in this session!
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You don't have any friends yet
                </p>
                <Link
                  to="/search"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                  onClick={() => setShowAddFriendModal(false)}
                >
                  Find friends
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>

        {/* Comment Form */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={
                  !commentText.trim() || createCommentMutation.isPending
                }
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {createCommentMutation.isPending
                  ? "Posting..."
                  : "Post Comment"}
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        {comments && comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg shadow-md p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Link
                      to={`/profile/${comment.user?.username}`}
                      className="flex-shrink-0"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        <img
                          src={`https://avatar.iran.liara.run/public?username=${comment.user?.username}`}
                          alt={comment.user?.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    </Link>
                    <div className="flex-1">
                      <Link
                        to={`/profile/${comment.user?.username}`}
                        className="font-semibold text-gray-900 hover:text-primary-600"
                      >
                        {comment.user?.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        @{comment.user?.username}
                      </p>
                      <p className="mt-2 text-gray-800">{comment.text}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                  {user?.id === comment.userId && (
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this comment?")) {
                          deleteCommentMutation.mutate(comment.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                      title="Delete comment"
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
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-600">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>

      {/* Quick Log Modal */}
      {showQuickLogModal && selectedProject && (
        <QuickLogModal
          climb={selectedProject}
          sessionId={id!}
          mode={logMode}
          onClose={() => {
            setShowQuickLogModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};
