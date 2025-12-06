import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../api";
import type { Notification } from "../types";
import { formatDistanceToNow } from "date-fns";

const getNotificationMessage = (notification: Notification) => {
  const username = notification.fromUser?.username || "Someone";
  switch (notification.type) {
    case "friend_request":
      return `${username} wants to add you as a friend`;
    case "fistbump":
      return `${username} fistbumped your session`;
    case "comment":
      return `${username} commented on your session`;
    default:
      return "New notification";
  }
};

const getNotificationLink = (notification: Notification) => {
  if (notification.sessionId) return `/sessions/${notification.sessionId}`;
  return null;
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const invalidateNotifications = () =>
    queryClient.invalidateQueries({ queryKey: ["notifications"] });

  const {
    data: notifications = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: invalidateNotifications,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: invalidateNotifications,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: invalidateNotifications,
  });

  const acceptFriendMutation = useMutation({
    mutationFn: (friendId: string) => acceptFriendRequest(friendId),
    onSuccess: () => {
      invalidateNotifications();
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      console.error("Accept friend error:", error);
      alert("Failed to accept friend request. Please try again.");
    },
  });

  const rejectFriendMutation = useMutation({
    mutationFn: (friendId: string) => rejectFriendRequest(friendId),
    onSuccess: () => {
      invalidateNotifications();
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: unknown) => {
      console.error("Reject friend error:", error);
      alert("Failed to reject friend request. Please try again.");
    },
  });

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAcceptFriend = (notification: Notification) => {
    acceptFriendMutation.mutate(notification.fromUserId);
  };

  const handleDenyFriend = (notification: Notification) => {
    rejectFriendMutation.mutate(notification.fromUserId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          Failed to load notifications. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-sm text-blue-600 hover:text-blue-700"
            disabled={markAllReadMutation.isPending}
          >
            {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const link = getNotificationLink(notification);
            const fromUser = notification.fromUser;

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg p-4 shadow ${
                  !notification.read ? "border-l-4 border-blue-600" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {fromUser ? (
                      <Link
                        to={`/profile/${fromUser.username}`}
                        className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={`https://avatar.iran.liara.run/public?username=${fromUser.username}`}
                          alt={fromUser.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {getNotificationMessage(notification)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="mb-2">
                        <p className="text-sm font-medium">
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                    )}

                    {notification.type === "friend_request" && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAcceptFriend(notification)}
                          disabled={
                            acceptFriendMutation.isPending ||
                            rejectFriendMutation.isPending
                          }
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {acceptFriendMutation.isPending
                            ? "Accepting..."
                            : "Accept"}
                        </button>
                        <button
                          onClick={() => handleDenyFriend(notification)}
                          disabled={
                            acceptFriendMutation.isPending ||
                            rejectFriendMutation.isPending
                          }
                          className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {rejectFriendMutation.isPending
                            ? "Denying..."
                            : "Deny"}
                        </button>
                      </div>
                    )}

                    {notification.type !== "friend_request" && (
                      <div className="flex gap-2 mt-3">
                        {link && (
                          <Link
                            to={link}
                            className="text-sm text-blue-600 hover:text-blue-700"
                            onClick={() =>
                              !notification.read &&
                              handleMarkAsRead(notification.id)
                            }
                          >
                            View
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
