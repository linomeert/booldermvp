// src/hooks/useClimb.ts
import { useQuery } from "@tanstack/react-query";
import * as api from "../api";
import type { Climb } from "../types";

export const useClimb = (id?: string) => {
  return useQuery<Climb>({
    queryKey: ["climb", id],
    queryFn: () => api.getClimbById(id!),
    enabled: !!id,
    // optional tuning:
    staleTime: 5 * 60 * 1000, // cache for 5 min
    retry: 1, // don't hammer if it fails
  });
};
