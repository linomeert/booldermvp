import type { Climb } from "../../types";

type SessionGradeSummaryProps = {
  climbs: Climb[];
};

const COLOR_ORDER = [
  "white",
  "yellow",
  "orange",
  "green",
  "blue",
  "red",
  "purple",
  "black",
];

const COLOR_MAP: Record<string, string> = {
  white: "bg-white border-2 border-gray-300 text-gray-800",
  yellow: "bg-yellow-400 text-gray-800",
  orange: "bg-orange-500 text-white",
  green: "bg-green-600 text-white",
  blue: "bg-blue-600 text-white",
  red: "bg-red-600 text-white",
  purple: "bg-purple-600 text-white",
  black: "bg-gray-900 text-white",
};

export const SessionGradeSummary = ({ climbs }: SessionGradeSummaryProps) => {
  if (!climbs.length) return null;

  const gradeCounts: Record<string, number> = {};

  climbs.forEach((climb) => {
    const grade = climb.grade;
    if (!grade) return;
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });

  const gradesSorted = Object.keys(gradeCounts)
    .sort((a, b) => {
      const aIdx = COLOR_ORDER.indexOf(a.toLowerCase());
      const bIdx = COLOR_ORDER.indexOf(b.toLowerCase());
      if (aIdx !== -1 && bIdx !== -1) return bIdx - aIdx; // hardest first
      if (aIdx !== -1) return 1;
      if (bIdx !== -1) return -1;
      return b.localeCompare(a); // fallback
    })
    .slice(0, 4);

  return (
    <div className="flex flex-row justify-center gap-6 mb-6">
      {gradesSorted.map((grade) => {
        const count = gradeCounts[grade];
        const colorKey = grade.toLowerCase();
        return (
          <div
            key={grade}
            className="flex flex-col items-center justify-center"
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold mb-1 text-base ${
                COLOR_MAP[colorKey] || "bg-gray-200 text-gray-800"
              }`}
            >
              {count}
            </div>
            <div className="text-xs text-gray-700 font-medium capitalize">
              {grade}
            </div>
          </div>
        );
      })}
    </div>
  );
};
