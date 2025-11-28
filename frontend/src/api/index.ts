import { apiGet, apiPost, apiPatch, apiDelete } from './client';
import type {
  User,
  Climb,
  Session,
  Gym,
  Crag,
  Comment,
  AuthResponse,
  CreateClimbRequest,
  CreateSessionRequest,
} from '../types';

// Auth
export const register = (data: {
  email: string;
  password: string;
  name: string;
  username: string;
}) => apiPost<AuthResponse>('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  apiPost<AuthResponse>('/auth/login', data);

// Users
export const getMe = () => apiGet<User>('/users/me');
export const getUserByUsername = (username: string) =>
  apiGet<User>(`/users/${username}`);
export const searchUsers = (query: string) =>
  apiGet<User[]>(`/users/search?query=${encodeURIComponent(query)}`);

// Climbs
export const createClimb = (data: CreateClimbRequest) =>
  apiPost<Climb>('/climbs', data);
export const getMyClimbs = (params?: {
  status?: string;
  locationType?: string;
}) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiGet<Climb[]>(`/climbs/me${query ? `?${query}` : ''}`);
};
export const getUserClimbs = (username: string, params?: {
  status?: string;
  locationType?: string;
}) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return apiGet<Climb[]>(`/climbs/user/${username}${query ? `?${query}` : ''}`);
};
export const getClimbById = (id: string) => apiGet<Climb>(`/climbs/${id}`);
export const deleteClimb = (id: string) =>
  apiDelete<{ message: string }>(`/climbs/${id}`);

// Sessions
export const createSession = (data: CreateSessionRequest) =>
  apiPost<Session>('/sessions', data);
export const endSession = (id: string) =>
  apiPatch<Session>(`/sessions/${id}/end`);
export const getMySessions = () => apiGet<Session[]>('/sessions/me');
export const getFeedSessions = () => apiGet<Session[]>('/sessions/feed');
export const getSessionById = (id: string) =>
  apiGet<Session>(`/sessions/${id}`);
export const deleteSession = (id: string) =>
  apiDelete<{ message: string }>(`/sessions/${id}`);
export const fistbumpSession = (id: string) =>
  apiPost<{ fistbumped: boolean; fistbumpCount: number }>(`/sessions/${id}/fistbump`, {});
export const addParticipant = (sessionId: string, friendId: string) =>
  apiPost<Session>(`/sessions/${sessionId}/participants`, { friendId });
export const removeParticipant = (sessionId: string, friendId: string) =>
  apiDelete<Session>(`/sessions/${sessionId}/participants/${friendId}`);

// Feed
export const getFeed = () => apiGet<Climb[]>('/feed');

// Locations
export const getGyms = () => apiGet<Gym[]>('/locations/gyms');
export const getCrags = () => apiGet<Crag[]>('/locations/crags');

// Friends
export const addFriend = (friendId: string) =>
  apiPost<{ message: string }>(`/friends/${friendId}`, {});
export const removeFriend = (friendId: string) =>
  apiDelete<{ message: string }>(`/friends/${friendId}`);
export const getFriends = () => apiGet<User[]>('/friends');
export const checkFriendship = (friendId: string) =>
  apiGet<{ isFriend: boolean }>(`/friends/check/${friendId}`);

// Comments
export const getSessionComments = (sessionId: string) =>
  apiGet<Comment[]>(`/sessions/${sessionId}/comments`);
export const createComment = (sessionId: string, text: string) =>
  apiPost<Comment>(`/sessions/${sessionId}/comments`, { text });
export const deleteComment = (commentId: string) =>
  apiDelete<{ message: string }>(`/comments/${commentId}`);
