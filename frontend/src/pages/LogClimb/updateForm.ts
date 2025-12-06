import type { ClimbStatus, LocationType } from "../../types";

export interface FormData {
  status: ClimbStatus;
  locationType: LocationType;
  gymId: string;
  cragId: string;
  grade: string;
  style: string;
  attempts: string;
  mediaUrl: string;
  notes: string;
  sessionId: string;
}

export const updateForm = (
  prev: FormData,
  updates: Partial<FormData>
): FormData => ({
  ...prev,
  ...updates,
});
