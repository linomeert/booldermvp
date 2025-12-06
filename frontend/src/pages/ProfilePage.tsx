import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import { useAuth } from "../context/AuthContext";
import { ProfileHeader } from "../components/ProfileHeader";
import { EditProfileModal } from "../components/EditProfileModal";
import { Tabs } from "../components/Tabs";
import { ClimbCard } from "../components/ClimbCard";
import { ProjectCard } from "../components/ProjectCard";
import { SessionCard } from "../components/SessionCard";
import type { User } from "../types";

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("tops");
  const [editOpen, setEditOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => api.getUserByUsername(username!),
    enabled: !!username,
  });

  const isOwnProfile = currentUser?.username === username;

  const { data: climbs } = useQuery({
    queryKey: ["climbs", username, activeTab],
    queryFn: () => {
      if (!username) return [];

      if (activeTab === "tops") {
        return isOwnProfile
          ? api.getMyClimbs({ status: "top" })
          : api.getUserClimbs(username, { status: "top" });
      } else if (activeTab === "projects") {
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

  const { data: allClimbs } = useQuery({
    queryKey: ["allClimbs", user?.id],
    queryFn: () => api.getMyClimbs({}),
    enabled: !!user,
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions", username],
    queryFn: () =>
      isOwnProfile ? api.getMySessions() : api.getUserSessions(username!),
    enabled: !!user && !!username && activeTab === "sessions",
  });

  const { data: friends } = useQuery({
    queryKey: ["friends", user?.id],
    queryFn: api.getFriends,
    enabled: !!user && activeTab === "friends",
  });

  const { data: friendshipStatus } = useQuery({
    queryKey: ["friendship", user?.id],
    queryFn: () => api.checkFriendship(user!.id),
    enabled: !!user && !isOwnProfile,
  });

  const addFriendMutation = useMutation({
    mutationFn: api.addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendship"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: api.removeFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendship"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  if (userLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="text-center text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          User not found
        </div>
      </div>
    );
  }

  const isFriend = friendshipStatus?.isFriend || false;
  const isPending = friendshipStatus?.status === "pending";

  const tabs = [
    { id: "tops", label: "Tops" },
    { id: "projects", label: "Projects" },
    { id: "sessions", label: "Sessions" },
    { id: "friends", label: "Friends" },
  ];

  const handleFriendAction = () => {
    if (isPending) return; // Don't allow action if pending
    if (isFriend) {
      removeFriendMutation.mutate(user!.id);
    } else {
      addFriendMutation.mutate(user!.id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          onEditProfile={() => setEditOpen(true)}
        />
        {!isOwnProfile && (
          <div className="mt-4">
            <button
              onClick={handleFriendAction}
              disabled={
                addFriendMutation.isPending ||
                removeFriendMutation.isPending ||
                isPending
              }
              className={`px-6 py-2 rounded-lg font-medium ${
                isFriend
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : isPending
                  ? "bg-yellow-100 text-yellow-800 cursor-not-allowed"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isFriend
                ? "Remove Friend"
                : isPending
                ? "Request Pending"
                : "Add Friend"}
            </button>
          </div>
        )}
      </div>
      {isOwnProfile && (
        <EditProfileModal
          user={user}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={async (formData) => {
            try {
              // Only handle avatar upload for now
              const updated = await api.updateProfileAvatar(formData);
              // Optimistically update avatarUrl in cache
              queryClient.setQueryData(["user", user.username], (old: any) =>
                old ? { ...old, avatarUrl: updated.avatarUrl } : old
              );
              queryClient.setQueryData(["me"], (old: any) =>
                old ? { ...old, avatarUrl: updated.avatarUrl } : old
              );
            } catch (e) {
              // Optionally show error
              // eslint-disable-next-line no-alert
              alert((e as Error).message);
            } finally {
              setEditOpen(false);
            }
          }}
        />
      )}

      <div className="mt-8">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "tops" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {climbs && climbs.length > 0 ? (
                climbs.map((climb) => (
                  <ClimbCard
                    key={climb.id}
                    climb={climb}
                    showDelete={isOwnProfile}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-white py-12">
                  No tops yet
                </div>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              {climbs && climbs.length > 0 ? (
                climbs.map((climb) => (
                  <ProjectCard
                    key={climb.id}
                    climb={climb}
                    showDelete={isOwnProfile}
                  />
                ))
              ) : (
                <div className="text-center text-gray-600 py-12">
                  No projects yet
                </div>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    showDelete={isOwnProfile}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-600 py-12">
                  No sessions yet
                </div>
              )}
            </div>
          )}
          {activeTab === "friends" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {friends && friends.length > 0 ? (
                friends.map((friend: User) => (
                  <button
                    key={friend.id}
                    onClick={() => navigate(`/profile/${friend.username}`)}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://avatar.iran.liara.run/public?username=${friend.username}`}
                        alt={friend.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="font-semibold text-gray-900">
                      {friend.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      @{friend.username}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-600 py-12">
                  No friends yet
                </div>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};
