import { Comment } from "../../types";
import { CommentItem } from "./CommentItem";

type CommentListProps = {
  comments?: Comment[];
  currentUserId?: string;
  onDelete: (id: string) => void;
  compact?: boolean;
};

export const CommentList = ({
  comments,
  currentUserId,
  onDelete,
  compact,
}: CommentListProps) => {
  if (!comments || comments.length === 0) {
    return (
      <p
        className={
          compact
            ? "text-sm text-gray-600 text-center py-2"
            : "bg-white rounded-lg shadow-md p-8 text-center text-gray-600"
        }
      >
        No comments yet{compact ? "" : ". Be the first to comment!"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onDelete={onDelete}
          compact={compact}
        />
      ))}
    </div>
  );
};
