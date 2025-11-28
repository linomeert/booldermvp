import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../api";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const ClimbDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: climb, isLoading } = useQuery({
    queryKey: ["climb", id],
    queryFn: () => api.getClimbById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center text-gray-600">Loading climb...</div>
      </div>
    );
  }

  if (!climb) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          Climb not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Image Section */}
        {(climb.images && climb.images.length > 0) || climb.mediaUrl ? (
          <div className="w-full">
            {climb.images && climb.images.length > 0 ? (
              <div
                className={
                  climb.images.length === 1
                    ? "w-full aspect-square bg-gray-200"
                    : "grid grid-cols-2 gap-1 bg-gray-200"
                }
              >
                {climb.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Climb ${climb.grade} - Photo ${index + 1}`}
                    className={
                      climb.images!.length === 1
                        ? "w-full h-full object-cover"
                        : "w-full aspect-square object-cover"
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="w-full aspect-square bg-gray-200">
                <img
                  src={climb.mediaUrl}
                  alt={`Climb ${climb.grade}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <span className="text-9xl opacity-50">🧗</span>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6">
          {/* Header with Status and Grade */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-bold ${
                  climb.status === "top"
                    ? "bg-green-100 text-green-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {climb.status === "top" ? "✓ TOPPED" : "📍 PROJECT"}
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {climb.grade}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-2xl">
                {climb.locationType === "indoor" ? "🏢" : "⛰️"}
              </span>
              <span className="text-lg font-medium">
                {climb.gym?.name || climb.crag?.name}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                ({climb.locationType})
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {climb.style && (
              <div>
                <div className="text-sm text-gray-600">Style</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {climb.style}
                </div>
              </div>
            )}
            {climb.attempts && (
              <div>
                <div className="text-sm text-gray-600">Attempts</div>
                <div className="text-lg font-semibold text-gray-900">
                  {climb.attempts}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-gray-600">Date</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatDate(climb.createdAt)}
              </div>
            </div>
          </div>

          {/* Notes */}
          {climb.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{climb.notes}</p>
            </div>
          )}

          {/* Session Info */}
          {climb.sessionId && (
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600 mb-2">Part of session</div>
              <button
                onClick={() => {
                  const sessionId =
                    typeof climb.sessionId === "string"
                      ? climb.sessionId
                      : (climb.sessionId as any).id ||
                        (climb.sessionId as any)._id;
                  navigate(`/sessions/${sessionId}`);
                }}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View full session →
              </button>
            </div>
          )}

          {/* Climber Info */}
          {climb.user && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://avatar.iran.liara.run/public?username=${climb.user.username}`}
                    alt={climb.user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Climbed by</div>
                  <button
                    onClick={() => navigate(`/profile/${climb.user?.username}`)}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {climb.user?.name}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
