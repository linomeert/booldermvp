import { useMemo, useState } from "react";
import type { Climb } from "../types";

interface StatsViewProps {
  climbs: Climb[];
}

export const StatsView = ({ climbs }: StatsViewProps) => {
  const [view, setView] = useState<"calendar" | "graph">("calendar");

  // Get calendar data for the last 12 weeks
  const calendarData = useMemo(() => {
    const weeks: { date: Date; climbs: Climb[]; grade?: string }[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83); // 12 weeks back

    // Group climbs by date
    const climbsByDate = new Map<string, Climb[]>();
    climbs.forEach((climb) => {
      const date = new Date(climb.createdAt).toDateString();
      if (!climbsByDate.has(date)) {
        climbsByDate.set(date, []);
      }
      climbsByDate.get(date)!.push(climb);
    });

    // Build 12 weeks of data
    for (let week = 0; week < 12; week++) {
      const weekData: { date: Date; climbs: Climb[]; grade?: string }[] = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        const dateStr = date.toDateString();
        const dayClimbs = climbsByDate.get(dateStr) || [];

        // Get highest grade for the day
        let highestGrade: string | undefined;
        if (dayClimbs.length > 0) {
          const topped = dayClimbs.filter((c) => c.status === "top");
          if (topped.length > 0) {
            highestGrade = topped[0].grade; // Could sort by difficulty
          }
        }

        weekData.push({ date, climbs: dayClimbs, grade: highestGrade });
      }
      weeks.push(weekData);
    }

    return weeks;
  }, [climbs]);

  // Get graph data - grade progression over time
  const graphData = useMemo(() => {
    const toppedClimbs = climbs
      .filter((c) => c.status === "top")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    // Convert grades to numeric values for charting
    const gradeToNumber = (grade: string): number => {
      if (grade.startsWith("V")) {
        return parseInt(grade.substring(1)) || 0;
      }
      if (grade.match(/^\d/)) {
        // French grades (3-9A)
        const num = parseFloat(grade) || 0;
        return (num - 3) * 2; // Approximate conversion
      }
      return 0;
    };

    return toppedClimbs.map((climb) => ({
      date: new Date(climb.createdAt),
      grade: climb.grade,
      numericGrade: gradeToNumber(climb.grade),
    }));
  }, [climbs]);

  const getIntensityColor = (climbCount: number) => {
    if (climbCount === 0) return "bg-gray-100";
    if (climbCount === 1) return "bg-green-200";
    if (climbCount <= 3) return "bg-green-400";
    if (climbCount <= 5) return "bg-green-600";
    return "bg-green-800";
  };

  const maxGrade = useMemo(() => {
    return Math.max(...graphData.map((d) => d.numericGrade), 0);
  }, [graphData]);

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setView("calendar")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === "calendar"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setView("graph")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            view === "graph"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Progress Graph
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-gray-900">
            {climbs.filter((c) => c.status === "top").length}
          </div>
          <div className="text-sm text-gray-600">Total Tops</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-gray-900">
            {climbs.filter((c) => c.status === "project").length}
          </div>
          <div className="text-sm text-gray-600">Active Projects</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-gray-900">
            {
              climbs.filter((c) => c.status === "top" && c.attempts === 1)
                .length
            }
          </div>
          <div className="text-sm text-gray-600">Flashes ⚡</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-2xl font-bold text-gray-900">
            {graphData.length > 0 ? graphData[graphData.length - 1].grade : "-"}
          </div>
          <div className="text-sm text-gray-600">Latest Top</div>
        </div>
      </div>

      {/* Calendar View */}
      {view === "calendar" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Climbing Activity (Last 12 Weeks)
          </h3>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Day labels */}
              <div className="flex gap-1 mb-2 ml-8">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="w-10 text-xs text-gray-600 text-center"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar grid */}
              <div className="space-y-1">
                {calendarData.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex gap-1 items-center">
                    <div className="w-6 text-xs text-gray-600">
                      W{weekIdx + 1}
                    </div>
                    {week.map((day, dayIdx) => {
                      const isToday =
                        day.date.toDateString() === new Date().toDateString();
                      const isFuture = day.date > new Date();

                      return (
                        <div
                          key={dayIdx}
                          className={`w-10 h-10 rounded ${
                            isFuture
                              ? "bg-gray-50"
                              : getIntensityColor(day.climbs.length)
                          } ${
                            isToday ? "ring-2 ring-primary-500" : ""
                          } flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-gray-400 transition-all`}
                          title={`${day.date.toDateString()}: ${
                            day.climbs.length
                          } climbs${day.grade ? ` (best: ${day.grade})` : ""}`}
                        >
                          {day.climbs.length > 0 && (
                            <span className="text-xs font-semibold text-white">
                              {day.climbs.length}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                <span>Less</span>
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <div className="w-4 h-4 bg-green-200 rounded"></div>
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <div className="w-4 h-4 bg-green-800 rounded"></div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph View */}
      {view === "graph" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Grade Progression
          </h3>
          {graphData.length > 0 ? (
            <div className="relative h-64">
              <svg className="w-full h-full">
                {/* Y-axis labels */}
                {Array.from({ length: maxGrade + 2 }, (_, i) => i).map((i) => (
                  <g key={i}>
                    <line
                      x1="40"
                      y1={240 - (i / (maxGrade + 1)) * 220}
                      x2="100%"
                      y2={240 - (i / (maxGrade + 1)) * 220}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <text
                      x="5"
                      y={245 - (i / (maxGrade + 1)) * 220}
                      fill="#6b7280"
                      fontSize="12"
                    >
                      V{i}
                    </text>
                  </g>
                ))}

                {/* Plot points and line */}
                <polyline
                  points={graphData
                    .map((d, i) => {
                      const x =
                        50 +
                        (i / Math.max(graphData.length - 1, 1)) *
                          (window.innerWidth * 0.8 - 60);
                      const y = 240 - (d.numericGrade / (maxGrade + 1)) * 220;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {graphData.map((d, i) => {
                  const x =
                    50 +
                    (i / Math.max(graphData.length - 1, 1)) *
                      (window.innerWidth * 0.8 - 60);
                  const y = 240 - (d.numericGrade / (maxGrade + 1)) * 220;

                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#3b82f6"
                        className="cursor-pointer hover:r-6 transition-all"
                      >
                        <title>
                          {d.date.toLocaleDateString()}: {d.grade}
                        </title>
                      </circle>
                    </g>
                  );
                })}
              </svg>
              <div className="mt-2 text-xs text-gray-600 text-center">
                {graphData.length} tops over time
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 py-12">
              No topped climbs yet. Start climbing to see your progress!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
