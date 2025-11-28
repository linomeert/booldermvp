import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { User } from "../types";

export const SearchUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: () => api.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const { data: friends } = useQuery({
    queryKey: ["friends"],
    queryFn: api.getFriends,
  });

  const addFriendMutation = useMutation({
    mutationFn: api.addFriend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const friendIds = new Set(friends?.map((f) => f.id) || []);

  const handleAddFriend = (userId: string) => {
    addFriendMutation.mutate(userId);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Users</h1>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-4 top-4 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {searchQuery.length < 2 ? (
        <div className="text-center text-gray-600 py-12">
          Enter at least 2 characters to search
        </div>
      ) : isLoading ? (
        <div className="text-center text-gray-600 py-12">Searching...</div>
      ) : searchResults && searchResults.length > 0 ? (
        <div className="space-y-3">
          {searchResults.map((user: User) => {
            const isFriend = friendIds.has(user.id);
            const isPending = addFriendMutation.isPending;

            return (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
              >
                <button
                  onClick={() => navigate(`/profile/${user.username}`)}
                  className="flex items-center space-x-3 flex-1"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      {user.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      @{user.username}
                    </div>
                  </div>
                </button>
                {!isFriend && (
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    disabled={isPending}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Friend
                  </button>
                )}
                {isFriend && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                    Friends ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-600 py-12">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};
