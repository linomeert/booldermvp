// src/pages/ProfilePage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import { ProfileHeader } from "../components/ProfileHeader";
import { EditProfileModal } from "../components/EditProfileModal";
import { Tabs } from "../components/Tabs";
import { Avatar } from "../components/Avatar";
import { ClimbCard } from "../components/ClimbCard";
import { ProjectCard } from "../components/ProjectCard";
import { SessionCard } from "../components/SessionCard";
import type { User } from "../types";
import { useProfile, type ProfileTabId } from "../hooks/useProfile";

const PROFILE_TABS = [
  { id: "tops", label: "Tops" },
  { id: "projects", label: "Projects" },
  { id: "sessions", label: "Sessions" },
  { id: "friends", label: "Friends" },
] as const;

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ProfileTabId>("tops");
  const [editOpen, setEditOpen] = useState(false);

  const {
    user,
    userLoading,
    isOwnProfile,
    climbs,
    sessions,
    friends,
    isFriend,
    isPending,
    isFriendBusy,
    handleFriendAction,
  } = useProfile(username, activeTab);

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

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <ProfileHeader
          user={user}
          isOwnProfile={isOwnProfile}
          onEditProfile={() => setEditOpen(true)}
        />

        <div className="mt-4">
          <FriendButton
            isOwnProfile={isOwnProfile}
            isFriend={isFriend}
            isPending={isPending}
            isBusy={isFriendBusy}
            onClick={handleFriendAction}
          />
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          user={user}
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSave={async (formData) => {
            try {
              const updated = await api.updateProfileAvatar(formData);

              queryClient.setQueryData<User | undefined>(
                ["user", user.username],
                (old) => (old ? { ...old, avatarUrl: updated.avatarUrl } : old)
              );

              queryClient.setQueryData<User | undefined>(["me"], (old) =>
                old ? { ...old, avatarUrl: updated.avatarUrl } : old
              );
            } catch (e) {
              alert((e as Error).message);
            } finally {
              setEditOpen(false);
            }
          }}
        />
      )}

      <div className="mt-8">
        <Tabs
          tabs={PROFILE_TABS}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId as ProfileTabId)}
        >
          {activeTab === "tops" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {climbs?.length ? (
                climbs.map((climb) => (
                  <ClimbCard
                    key={climb.id}
                    climb={climb}
                    showDelete={isOwnProfile}
                  />
                ))
              ) : (
                <EmptyState className="col-span-full text-white">
                  No tops yet
                </EmptyState>
              )}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-4">
              {climbs?.length ? (
                climbs.map((climb) => (
                  <ProjectCard
                    key={climb.id}
                    climb={climb}
                    showDelete={isOwnProfile}
                  />
                ))
              ) : (
                <EmptyState>No projects yet</EmptyState>
              )}
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions?.length ? (
                sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    showDelete={isOwnProfile}
                  />
                ))
              ) : (
                <EmptyState className="col-span-full">
                  No sessions yet
                </EmptyState>
              )}
            </div>
          )}

          {activeTab === "friends" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {friends?.length ? (
                friends.map((friend: User) => (
                  <button
                    key={friend.id}
                    onClick={() => navigate(`/profile/${friend.username}`)}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow text-center"
                  >
                    <div className="flex justify-center mb-3">
                      <Avatar
                        src={friend.avatarUrl}
                        username={friend.username}
                        alt={friend.name}
                        size={80}
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
                <EmptyState className="col-span-full">
                  No friends yet
                </EmptyState>
              )}
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
};

/* ─── Small page-local components ───────────────────────── */

type FriendButtonProps = {
  isOwnProfile: boolean;
  isFriend: boolean;
  isPending: boolean;
  isBusy: boolean;
  onClick: () => void;
};

const FriendButton = ({
  isOwnProfile,
  isFriend,
  isPending,
  isBusy,
  onClick,
}: FriendButtonProps) => {
  if (isOwnProfile) return null;

  const disabled = isBusy || isPending;
  const label = isFriend
    ? "Remove Friend"
    : isPending
    ? "Request Pending"
    : "Add Friend";

  const base =
    "px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed";

  const variant = isFriend
    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
    : isPending
    ? "bg-yellow-100 text-yellow-800 cursor-not-allowed"
    : "bg-primary-600 text-white hover:bg-primary-700";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variant}`}
    >
      {label}
    </button>
  );
};

const EmptyState = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`${className} text-center text-gray-600 py-12`}>
    {children}
  </div>
);
