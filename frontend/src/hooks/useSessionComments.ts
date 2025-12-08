import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { Comment } from "../types";

type UseSessionCommentsOptions = {
  enabled?: boolean;
};

export const useSessionComments = (
  sessionId: string,
  { enabled = true }: UseSessionCommentsOptions = {}
) => {
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  const {
    data: comments = [],
    isLoading,
    isError,
  } = useQuery<Comment[]>({
    queryKey: ["comments", sessionId],
    queryFn: () => api.getSessionComments(sessionId),
    enabled: !!sessionId && enabled,
  });

  const createCommentMutation = useMutation({
    mutationFn: (text: string) => api.createComment(sessionId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", sessionId] });
      setCommentText("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", sessionId] });
    },
  });

  const submitComment = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    createCommentMutation.mutate(trimmed);
  };

  const deleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  return {
    comments,
    commentText,
    setCommentText,
    submitComment,
    deleteComment,
    isLoading,
    isError,
    isSubmitting: createCommentMutation.isPending,
  };
};
