import { Link } from "react-router-dom";
import { Comment } from "../../types";

type CommentItemProps = {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
  compact?: boolean;
};

export const CommentItem = ({
  comment,
  currentUserId,
  onDelete,
  compact = false,
}: CommentItemProps) => {
  const date = new Date(comment.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={
        compact
          ? "bg-[#151920] border border-[#2c2f36] p-3"
          : "bg-[#151920] border border-[#2c2f36] shadow-md p-4"
      }
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <Link
            to={`/profile/${comment.user?.username}`}
            className="flex-shrink-0"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100">
              <img
                src={
                  comment.user?.avatarUrl ??
                  `https://avatar.iran.liara.run/public?username=${comment.user?.username}`
                }
                alt={comment.user?.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link
              to={`/profile/${comment.user?.username}`}
              className="font-semibold text-sm text-gray-500 hover:text-primary-600"
            >
              {comment.user?.name}
            </Link>

            {!compact && (
              <p className="text-sm text-gray-600">@{comment.user?.username}</p>
            )}

            <p className="mt-1 text-white text-lg">{comment.text}</p>
            <p className="text-xs text-gray-500 mt-1">{date}</p>
          </div>
        </div>

        {currentUserId === comment.userId && (
          <button
            onClick={() => {
              if (window.confirm("Delete this comment?")) {
                onDelete(comment.id);
              }
            }}
            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 ml-2"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
