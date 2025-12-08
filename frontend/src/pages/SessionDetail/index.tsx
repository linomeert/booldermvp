// src/pages/SessionDetailPage.tsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ClimbCard } from "../../components/ClimbCard";
import { QuickLogModal } from "../../components/QuickLogModal";
import { Climb } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useSessionDetail } from "../../hooks/useSessionDetail";
import { SessionGradeSummary } from "./SessionGradeSummary";
import { SessionStats } from "./SessionStats";
import { SessionParticipants } from "./SessionParticipants";
import { formatDuration, formatDate } from "../../utils/date";
import { CommentsSection } from "../../components/comments/CommentsSection";

export const SessionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    session,
    isLoading,
    error,
    friends,
    projects,
    comments,
    endSessionMutation,
    deleteSessionMutation,
    addParticipantMutation,
    removeParticipantMutation,
    createCommentMutation,
    deleteCommentMutation,
  } = useSessionDetail(id);

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
          <SessionParticipants
            participants={session.participants}
            onAddFriendClick={() => setShowAddFriendModal(true)}
            onRemoveParticipant={(friendId) =>
              removeParticipantMutation.mutate(friendId)
            }
          />
        )}

        {session.climbs && session.climbs.length > 0 && (
          <SessionGradeSummary climbs={session.climbs} />
        )}

        {/* Row of other stats */}
        <SessionStats session={session} />

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

      {/* Session climbs */}
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
                      deleteSessionMutation.mutate(undefined, {
                        onSuccess: () => navigate("/"),
                      });
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
                  onClick={() =>
                    endSessionMutation.mutate(
                      {
                        rating: sessionRating || undefined,
                        feeling: sessionFeeling || undefined,
                      },
                      {
                        onSuccess: () => {
                          setShowEndModal(false);
                          setSessionRating(0);
                          setSessionFeeling("");
                        },
                      }
                    )
                  }
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
                      onClick={() =>
                        addParticipantMutation.mutate(friend.id, {
                          onSuccess: () => setShowAddFriendModal(false),
                        })
                      }
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
      <CommentsSection
        comments={comments}
        currentUserId={user?.id}
        commentText={commentText}
        onChangeCommentText={setCommentText}
        onSubmitComment={(text: string) => {
          const trimmed = text.trim();
          if (!trimmed) return;
          createCommentMutation.mutate(trimmed);
        }}
        onDeleteComment={(commentId: string) =>
          deleteCommentMutation.mutate(commentId)
        }
        isSubmitting={createCommentMutation.isPending}
        compact={false}
      />

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
