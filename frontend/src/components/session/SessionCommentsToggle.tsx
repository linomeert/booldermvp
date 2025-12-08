import { useState } from "react";
import { Comment } from "../../types";
import { Avatar } from "../Avatar";
import { CommentsSection } from "../comments/CommentsSection";

interface SessionCommentsToggleProps {
  comments: Comment[];
  currentUserId?: string;
  commentText: string;
  onChangeCommentText: (text: string) => void;
  onSubmitComment: (text: string) => void;
  onDeleteComment: (commentId: string) => void;
  isSubmitting: boolean;
}

export const SessionCommentsToggle = ({
  comments,
  currentUserId,
  commentText,
  onChangeCommentText,
  onSubmitComment,
  onDeleteComment,
  isSubmitting,
}: SessionCommentsToggleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique commenters (showing avatars of people who commented)
  const uniqueCommenters = Array.from(
    new Map(comments.map((c) => [c.user?.id, c.user])).values()
  ).slice(0, 5);

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-6 py-3 flex items-center gap-3 hover:bg-[#252d37] transition-colors"
        >
          {/* Comment icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>

          {/* Comment count */}
          <span className="text-sm text-gray-400">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>

          {/* Commenter avatars */}
          <div className="flex -space-x-2 ml-auto">
            {uniqueCommenters.map((user, idx) => (
              <div
                key={user?.id || idx}
                className="w-6 h-6 rounded-full border-2 border-[#1e252e] overflow-hidden bg-primary-100"
                title={user?.name}
              >
                <Avatar
                  src={user?.avatarUrl}
                  username={user?.username}
                  alt={user?.name}
                  size={24}
                />
              </div>
            ))}
            {comments.length > uniqueCommenters.length && (
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white border-2 border-[#1e252e]">
                +{comments.length - uniqueCommenters.length}
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className="px-6 py-4 bg-[#1e252e]">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-gray-400 hover:text-gray-300 mb-3 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Collapse
          </button>
          <CommentsSection
            comments={comments}
            currentUserId={currentUserId}
            commentText={commentText}
            onChangeCommentText={onChangeCommentText}
            onSubmitComment={onSubmitComment}
            onDeleteComment={onDeleteComment}
            isSubmitting={isSubmitting}
            hideTitle
            compact
          />
        </div>
      )}
    </div>
  );
};
