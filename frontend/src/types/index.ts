export type ClimbStatus = 'top' | 'project';
export type LocationType = 'indoor' | 'outdoor';

export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  stats?: {
    totalTops: number;
    totalProjects: number;
    sessions: number;
    hardestGrade: string;
  };
}

export interface Climb {
  id: string;
  userId: string;
  sessionId?: string;
  climberId?: string | User;
  status: ClimbStatus;
  locationType: LocationType;
  gymId?: string;
  cragId?: string;
  grade: string;
  style?: string;
  attempts?: number;
  mediaUrl?: string;
  notes?: string;
  projectDate?: string;
  createdAt: string;
  user?: User;
  gym?: Gym;
  crag?: Crag;
}

export interface Session {
  id: string;
  userId: string;
  locationType: LocationType;
  gymId?: string;
  cragId?: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  climbCount: number;
  topsCount: number;
  projectsCount: number;
  hardestGrade?: string;
  syncedToStrava: boolean;
  fistbumps: string[];
  fistbumpCount: number;
  participants: string[] | User[];
  user?: User;
  gym?: Gym;
  crag?: Crag;
  climbs?: Climb[];
}

export interface Gym {
  id: string;
  name: string;
  city?: string;
  country?: string;
}

export interface Crag {
  id: string;
  name: string;
  area?: string;
  country?: string;
}

export interface Comment {
  id: string;
  sessionId: string;
  userId: string;
  user?: User;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'fistbump' | 'comment';
  fromUserId: string;
  fromUser?: User;
  sessionId?: string;
  commentId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateClimbRequest {
  sessionId?: string;
  climberId?: string;
  status: ClimbStatus;
  locationType: LocationType;
  gymId?: string;
  cragId?: string;
  grade: string;
  style?: string;
  attempts?: number;
  mediaUrl?: string;
  notes?: string;
}

export interface CreateSessionRequest {
  locationType: LocationType;
  gymId?: string;
  cragId?: string;
}
