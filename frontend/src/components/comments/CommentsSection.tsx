import { Comment } from "../../types";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

type CommentsSectionProps = {
  comments?: Comment[];
  currentUserId?: string;

  commentText: string;
  onChangeCommentText: (text: string) => void;
  onSubmitComment: (text: string) => void;
  onDeleteComment: (id: string) => void;
  isSubmitting: boolean;

  hideTitle?: boolean;
  compact?: boolean;
  title?: string;
};

export const CommentsSection = ({
  comments,
  currentUserId,
  commentText,
  onChangeCommentText,
  onSubmitComment,
  onDeleteComment,
  isSubmitting,
  hideTitle = false,
  compact = false,
  title = "Comments",
}: CommentsSectionProps) => {
  return (
    <div className={compact ? "" : "mt-8"}>
      {!hideTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      )}

      <CommentForm
        value={commentText}
        onChange={onChangeCommentText}
        onSubmit={() => onSubmitComment(commentText)}
        isSubmitting={isSubmitting}
        compact={compact}
      />

      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        onDelete={onDeleteComment}
        compact={compact}
      />
    </div>
  );
};
