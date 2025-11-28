import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Climb } from "../types";
import { deleteClimb } from "../api";

interface ClimbCardProps {
  climb: Climb;
  showDelete?: boolean;
  showQuickLog?: boolean;
  sessionId?: string;
  onQuickLog?: (mode: "flash" | "top") => void;
}

export const ClimbCard = ({
  climb,
  showDelete = false,
  showQuickLog = false,
  sessionId,
  onQuickLog,
}: ClimbCardProps) => {
  const queryClient = useQueryClient();

  const deleteClimbMutation = useMutation({
    mutationFn: deleteClimb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["climbs"] });
      queryClient.invalidateQueries({ queryKey: ["myClimbs"] });
    },
  });

  const handleDeleteClimb = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this climb?")) {
      deleteClimbMutation.mutate(climb.id);
    }
  };

  return (
    <Link
      to={`/climbs/${climb.id}`}
      className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
    >
      {(climb.images && climb.images.length > 0) || climb.mediaUrl ? (
        <div className="aspect-square bg-gray-200 relative">
          <img
            src={
              climb.images && climb.images.length > 0
                ? climb.images[0]
                : climb.mediaUrl
            }
            alt={`Climb ${climb.grade}`}
            className="w-full h-full object-cover"
          />
          {climb.images && climb.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-semibold">
              +{climb.images.length - 1}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <span className="text-6xl opacity-50">🧗</span>
        </div>
      )}

      <div
        className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-bold shadow-lg ${
          climb.grade.toLowerCase() === "white"
            ? "bg-white border-2 border-gray-300 text-gray-800"
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
            : "bg-primary-600 text-white"
        }`}
      >
        {climb.grade}
      </div>

      {showDelete && (
        <button
          onClick={handleDeleteClimb}
          className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete climb"
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

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {climb.gym?.name || climb.crag?.name || "Unknown location"}
          </span>
          <span className="text-xs text-gray-500">
            {climb.locationType === "indoor" ? "🏢" : "⛰️"}
          </span>
        </div>
        {climb.climberId && typeof climb.climberId === "object" && (
          <div className="mt-2 flex items-center gap-1">
            <span className="text-xs font-medium text-primary-600">
              {climb.climberId.name}
            </span>
          </div>
        )}
        {climb.style && (
          <div className="mt-2 text-xs text-gray-500">{climb.style}</div>
        )}
      </div>

      {/* Quick Log Buttons for Projects in Active Sessions */}
      {showQuickLog && sessionId && onQuickLog && (
        <div className="flex gap-2 px-4 pb-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickLog("flash");
            }}
            className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            ⚡ Flash
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickLog("top");
            }}
            className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            ✅ Top
          </button>
        </div>
      )}
    </Link>
  );
};
