import type { Climb } from "../../types";

interface GradeSummaryGridProps {
  climbs: Climb[];
}

export const GradeSummaryGrid = ({ climbs }: GradeSummaryGridProps) => {
  // Count grades
  const gradeCounts: Record<string, number> = {};
  climbs.forEach((climb) => {
    const grade = climb.grade;
    if (!grade) return;
    gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
  });

  // Sort grades by difficulty (try color order, fallback to string sort)
  const colorOrder = [
    "white",
    "yellow",
    "orange",
    "green",
    "blue",
    "red",
    "purple",
    "black",
  ];
  const gradesSorted = Object.keys(gradeCounts)
    .sort((a, b) => {
      const aIdx = colorOrder.indexOf(a.toLowerCase());
      const bIdx = colorOrder.indexOf(b.toLowerCase());
      if (aIdx !== -1 && bIdx !== -1) return bIdx - aIdx; // hardest first
      if (aIdx !== -1) return 1;
      if (bIdx !== -1) return -1;
      return b.localeCompare(a); // fallback: string sort desc
    })
    .slice(0, 4);

  // Color mapping for circles
  const colorCircleMap: Record<string, string> = {
    white: "bg-white border border-gray-300 text-gray-800",
    yellow: "bg-yellow-400 text-yellow-900",
    orange: "bg-orange-500 text-white",
    green: "bg-green-600 text-white",
    blue: "bg-blue-600 text-white",
    red: "bg-red-600 text-white",
    purple: "bg-purple-600 text-white",
    black: "bg-gray-900 text-white",
  };

  return (
    <div className="grid grid-cols-4 gap-3 mb-4 mt-5">
      {gradesSorted.map((grade) => {
        const count = gradeCounts[grade];
        const colorKey = grade.toLowerCase();
        const isColorGrade = colorCircleMap[colorKey] !== undefined;
        const isVGrade = /^v\d+$/i.test(grade);

        return (
          <div
            key={grade}
            className="flex flex-col items-center justify-center"
          >
            {isColorGrade ? (
              <span
                className={`w-7 h-7 p-4 bagel-font rounded-full flex items-center justify-center mb-1 font-bold text-xl ${colorCircleMap[colorKey]}`}
                style={{ transform: "skewY(10deg)" }}
              >
                {count}
              </span>
            ) : isVGrade ? (
              <span className="w-9 h-9 bagel-font rounded-full flex items-center justify-center mb-1 text-lg font-bold text-gray-700 ">
                {grade.toUpperCase()}
              </span>
            ) : (
              <span className="w-9 h-9 rounded-full flex items-center justify-center mb-1 text-sm font-bold text-gray-100 bg-[#2566ec]">
                {grade}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
