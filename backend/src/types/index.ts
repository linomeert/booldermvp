export type ClimbStatus = "top" | "project";
export type LocationType = "indoor" | "outdoor";

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
  status: ClimbStatus;
  locationType: LocationType;
  gymId?: string;
  cragId?: string;
  grade: string;
  style?: string;
  attempts?: number;
  mediaUrl?: string;
  notes?: string;
  createdAt: string;
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
  rating?: number;
  feeling?: string;
  syncedToStrava: boolean;
  fistbumps: string[];
  fistbumpCount: number;
  participants: string[] | User[];
  user?: User;
  gym?: Gym;
  crag?: Crag;
  climbs?: Climb[];
}

export interface FeedItem {
  id: string;
  climbId: string;
  userId: string;
  createdAt: string;
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
