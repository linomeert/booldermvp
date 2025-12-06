// src/hooks/useProfile.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import { useAuth } from "../context/AuthContext";
import type { User, Climb, Session } from "../types";

export type ProfileTabId = "tops" | "projects" | "sessions" | "friends";

export const useProfile = (
  username?: string,
  activeTab: ProfileTabId = "tops"
) => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // --- User data ---
  const {
    data: user,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<User>({
    queryKey: ["user", username],
    queryFn: () => api.getUserByUsername(username!),
    enabled: !!username,
  });

  const isOwnProfile = !!currentUser && currentUser.username === username;

  // --- Climbs for Tops / Projects ---
  const { data: climbs } = useQuery<Climb[]>({
    queryKey: ["climbs", username, activeTab],
    queryFn: () => {
      if (!username) return [];

      if (activeTab === "tops") {
        return isOwnProfile
          ? api.getMyClimbs({ status: "top" })
          : api.getUserClimbs(username, { status: "top" });
      }

      if (activeTab === "projects") {
        return isOwnProfile
          ? api.getMyClimbs({ status: "project" })
          : api.getUserClimbs(username, { status: "project" });
      }

      return [];
    },
    enabled:
      !!user &&
      !!username &&
      (activeTab === "tops" || activeTab === "projects"),
  });

  // If you ever need “all climbs” for stats etc.
  const { data: allClimbs } = useQuery<Climb[]>({
    queryKey: ["allClimbs", user?.id],
    queryFn: () => api.getMyClimbs({}),
    enabled: !!user && isOwnProfile,
  });

  // --- Sessions tab ---
  const { data: sessions } = useQuery<Session[]>({
    queryKey: ["sessions", username],
    queryFn: () =>
      isOwnProfile ? api.getMySessions() : api.getUserSessions(username!),
    enabled: !!user && !!username && activeTab === "sessions",
  });

  // --- Friends tab ---
  const { data: friends } = useQuery<User[]>({
    queryKey: ["friends", user?.id],
    queryFn: api.getFriends,
    enabled: !!user && activeTab === "friends",
  });

  // --- Friendship status & actions ---
  const { data: friendshipStatus } = useQuery({
    queryKey: ["friendship", user?.id],
    queryFn: () => api.checkFriendship(user!.id),
    enabled: !!user && !isOwnProfile,
  });

  const invalidateFriendData = () => {
    queryClient.invalidateQueries({ queryKey: ["friendship"] });
    queryClient.invalidateQueries({ queryKey: ["friends"] });
  };

  const addFriendMutation = useMutation({
    mutationFn: api.addFriend,
    onSuccess: invalidateFriendData,
  });

  const removeFriendMutation = useMutation({
    mutationFn: api.removeFriend,
    onSuccess: invalidateFriendData,
  });

  const isFriend = !!friendshipStatus?.isFriend;
  const isPending = friendshipStatus?.status === "pending";
  const isFriendBusy =
    addFriendMutation.isPending || removeFriendMutation.isPending;

  const handleFriendAction = () => {
    if (!user || isPending) return;
    if (isFriend) {
      removeFriendMutation.mutate(user.id);
    } else {
      addFriendMutation.mutate(user.id);
    }
  };

  return {
    // core user
    user,
    userLoading,
    userError,
    isOwnProfile,

    // data per tab
    climbs,
    allClimbs,
    sessions,
    friends,

    // friendship
    friendshipStatus,
    isFriend,
    isPending,
    isFriendBusy,
    handleFriendAction,
  };
};
