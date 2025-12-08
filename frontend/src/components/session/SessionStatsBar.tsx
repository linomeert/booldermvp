import type { Climb } from "../../types";

interface SessionStatsBarProps {
  climbs: Climb[];
  durationSeconds?: number;
  syncedToStrava?: boolean;
}

const formatDuration = (seconds?: number) => {
  if (!seconds) return "In progress";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const SessionStatsBar = ({
  climbs,
  durationSeconds,
  syncedToStrava,
}: SessionStatsBarProps) => {
  return (
    <div className="text-sm text-[#6b7f98] w-full pt-3 flex justify-between gap-4">
      <span className="flex items-center gap-1">
        {/* Clock Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-[#6b7f98]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{formatDuration(durationSeconds)}</span>
      </span>

      <span className="flex items-center gap-1">
        {/* Mountain Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 20l7.89-13.26a2 2 0 013.42 0L22 20M16 20V9"
          />
        </svg>
        <span>{climbs.filter((c) => c.status === "top").length}</span>
      </span>

      <span className="flex items-center gap-1">
        {/* Flash Icon (Lightning Bolt) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span>
          {climbs.filter((c) => c.status === "top" && c.attempts === 1).length}
        </span>
      </span>

      {syncedToStrava && (
        <span className="ml-3 text-orange-600">🏃 Strava</span>
      )}
    </div>
  );
};
