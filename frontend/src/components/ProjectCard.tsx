import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Climb } from "../types";
import { deleteClimb } from "../api";

interface ProjectCardProps {
  climb: Climb;
  showDelete?: boolean;
}

export const ProjectCard = ({
  climb,
  showDelete = false,
}: ProjectCardProps) => {
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
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow group relative block"
    >
      <div className="flex items-start gap-4 p-4">
        {/* Image on left */}
        <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
          {climb.mediaUrl ? (
            <img
              src={climb.mediaUrl}
              alt={`Project ${climb.grade}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <span className="text-3xl opacity-50">🧗</span>
            </div>
          )}
        </div>

        {/* Content on right */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
              PROJECT
            </span>
            <span className="text-lg font-bold text-gray-900">
              {climb.grade}
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            {climb.gym?.name || climb.crag?.name}
          </div>

          {climb.attempts && (
            <div className="mt-1 text-sm text-gray-500">
              {climb.attempts} {climb.attempts === 1 ? "attempt" : "attempts"}
            </div>
          )}

          {climb.notes && (
            <div className="mt-2 text-sm text-gray-700 line-clamp-2">
              {climb.notes}
            </div>
          )}
        </div>

        {/* Delete button */}
        {showDelete && (
          <button
            onClick={handleDeleteClimb}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete climb"
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
    </Link>
  );
};
