
import { Climb } from "../types";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteClimb } from "../api";
import { Avatar } from "./Avatar";

interface FeedItemCardProps {
  climb: Climb;
  showDelete?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const FeedItemCard = ({
  climb,
  showDelete = false,
}: FeedItemCardProps) => {
  const queryClient = useQueryClient();

  const deleteClimbMutation = useMutation({
    mutationFn: deleteClimb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["myClimbs"] });
    },
  });

  const handleDeleteClimb = () => {
    if (window.confirm("Are you sure you want to delete this climb?")) {
      deleteClimbMutation.mutate(climb.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
            <Avatar src={climb.user?.avatarUrl} username={climb.user?.username} alt={climb.user?.name} size={40} />
          </div>
          <div className="flex-1">
            <Link
              to={`/profile/${climb.user?.username}`}
              className="font-semibold text-gray-900 hover:text-primary-600"
            >
              {climb.user?.name}
            </Link>
            <p className="text-sm text-gray-600">
              sent{" "}
              <span className="font-bold text-primary-600">{climb.grade}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">
              {formatDate(climb.createdAt)}
            </div>
            {showDelete && (
              <button
                onClick={handleDeleteClimb}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
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
          </div>
        </div>
      </div>

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
            <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white text-sm px-3 py-1 rounded-full font-semibold">
              +{climb.images.length - 1}
            </div>
          )}
          {climb.status === "top" && climb.attempts === 1 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg animate-pulse">
              ⚡ FLASH!
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center relative">
          <span className="text-8xl opacity-50">🧗</span>
          {climb.status === "top" && climb.attempts === 1 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg animate-pulse">
              ⚡ FLASH!
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {climb.gym?.name || climb.crag?.name}
            </span>
            <span className="text-xs text-gray-500">
              {climb.locationType === "indoor" ? "🏢" : "⛰️"}
            </span>
          </div>
          {climb.style && (
            <span className="text-xs text-gray-500 capitalize">
              {climb.style}
            </span>
          )}
        </div>
        {climb.notes && (
          <p className="mt-2 text-sm text-gray-700">{climb.notes}</p>
        )}
      </div>
    </div>
  );
};
