import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";

type EndSessionPayload = {
  rating?: number;
  feeling?: string;
};

export const useSessionDetail = (id?: string) => {
  const queryClient = useQueryClient();

  // ── Queries ──────────────────────────────────────
  const sessionQuery = useQuery({
    queryKey: ["session", id],
    queryFn: () => api.getSessionById(id!),
    enabled: !!id,
  });

  const friendsQuery = useQuery({
    queryKey: ["friends"],
    queryFn: api.getFriends,
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.getMyClimbs({ status: "project" }),
    enabled: !!sessionQuery.data && !sessionQuery.data.endedAt,
  });

  const commentsQuery = useQuery({
    queryKey: ["comments", id],
    queryFn: () => api.getSessionComments(id!),
    enabled: !!id,
  });

  const invalidateSession = () => {
    queryClient.invalidateQueries({ queryKey: ["session", id] });
    queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["feed-sessions"] });
  };

  // ── Mutations ────────────────────────────────────
  const endSessionMutation = useMutation({
    mutationFn: (payload: EndSessionPayload) => api.endSession(id!, payload),
    onSuccess: () => {
      invalidateSession();
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: () => api.deleteSession(id!),
    onSuccess: () => {
      invalidateSession();
    },
  });

  const addParticipantMutation = useMutation({
    mutationFn: (friendId: string) => api.addParticipant(id!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (friendId: string) => api.removeParticipant(id!, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", id] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (text: string) => api.createComment(id!, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
    },
  });

  return {
    // main session query
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,

    // related data
    friends: friendsQuery.data,
    projects: projectsQuery.data,
    comments: commentsQuery.data,

    // mutations
    endSessionMutation,
    deleteSessionMutation,
    addParticipantMutation,
    removeParticipantMutation,
    createCommentMutation,
    deleteCommentMutation,
  };
};
