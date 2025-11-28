import { useMemo } from "react";
import type { Climb, Session } from "../types";

interface CoachViewProps {
  climbs: Climb[];
  sessions: Session[];
}

export const CoachView = ({ climbs, sessions }: CoachViewProps) => {
  const insights = useMemo(() => {
    const tips: string[] = [];

    // Analyze recent activity
    const recentClimbs = climbs.slice(0, 20);
    const toppedClimbs = climbs.filter((c) => c.status === "top");
    const projects = climbs.filter((c) => c.status === "project");

    // Calculate success rate
    const successRate =
      climbs.length > 0
        ? Math.round((toppedClimbs.length / climbs.length) * 100)
        : 0;

    // Find common grades
    const gradeCount = new Map<string, number>();
    toppedClimbs.forEach((climb) => {
      gradeCount.set(climb.grade, (gradeCount.get(climb.grade) || 0) + 1);
    });
    const mostCommonGrade = Array.from(gradeCount.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Analyze flash rate
    const flashes = toppedClimbs.filter((c) => c.attempts === 1).length;
    const flashRate =
      toppedClimbs.length > 0
        ? Math.round((flashes / toppedClimbs.length) * 100)
        : 0;

    // Session analysis
    const avgSessionLength =
      sessions.length > 0
        ? Math.round(
            sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) /
              sessions.length /
              60
          )
        : 0;

    // Generate personalized tips
    if (successRate >= 80) {
      tips.push(
        "🎯 Great success rate! Consider pushing your grade range to keep challenging yourself."
      );
    } else if (successRate < 50) {
      tips.push(
        "💪 Focus on consolidating your current grade before moving up. Quality over quantity!"
      );
    }

    if (flashRate >= 30) {
      tips.push(
        "⚡ Excellent flash rate! Your reading and technique are strong. Try harder problems."
      );
    } else if (flashRate < 10) {
      tips.push(
        "📖 Work on route reading and visualization before attempting climbs to improve efficiency."
      );
    }

    if (projects.length > 10) {
      tips.push(
        "📍 You have many open projects. Try focusing on 2-3 to build momentum and confidence."
      );
    } else if (projects.length === 0) {
      tips.push(
        "🎯 Consider starting some projects! Long-term goals help develop perseverance and strategy."
      );
    }

    if (avgSessionLength > 180) {
      tips.push(
        "⏰ Long sessions detected. Remember that quality training in 90-120 minutes is often more effective."
      );
    } else if (avgSessionLength < 60 && sessions.length > 3) {
      tips.push(
        "📈 Consider longer sessions (90-120 min) to allow proper warm-up and working time."
      );
    }

    if (recentClimbs.length > 15) {
      const recentGrades = new Set(recentClimbs.map((c) => c.grade));
      if (recentGrades.size < 3) {
        tips.push(
          "🔄 Try varying your grade range more to develop different movement patterns."
        );
      }
    }

    // Add location-based tip
    const indoorCount = climbs.filter(
      (c) => c.locationType === "indoor"
    ).length;
    const outdoorCount = climbs.filter(
      (c) => c.locationType === "outdoor"
    ).length;
    if (indoorCount > 0 && outdoorCount === 0) {
      tips.push(
        "⛰️ Consider trying outdoor climbing to apply your gym skills in a natural setting!"
      );
    } else if (outdoorCount > indoorCount * 2) {
      tips.push(
        "🏢 Balance outdoor climbing with gym sessions for consistent technique development."
      );
    }

    return {
      tips: tips.slice(0, 3), // Show max 3 tips
      successRate,
      flashRate,
      mostCommonGrade,
      avgSessionLength,
    };
  }, [climbs, sessions]);

  if (climbs.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">🧗‍♂️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Start Your Climbing Journey
        </h3>
        <p className="text-gray-600">
          Log your first climbs to get personalized training insights from your
          AI coach!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Coach Header */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">🤖</div>
          <div>
            <h3 className="text-2xl font-bold">AI Coach</h3>
            <p className="text-purple-100 text-sm">
              Personalized training insights
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{insights.successRate}%</div>
            <div className="text-xs text-purple-100">Success Rate</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">{insights.flashRate}%</div>
            <div className="text-xs text-purple-100">Flash Rate</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {insights.mostCommonGrade || "N/A"}
            </div>
            <div className="text-xs text-purple-100">Top Grade</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3">
            <div className="text-2xl font-bold">
              {insights.avgSessionLength}m
            </div>
            <div className="text-xs text-purple-100">Avg Session</div>
          </div>
        </div>
      </div>

      {/* Training Tips */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>Training Recommendations</span>
        </h4>

        {insights.tips.length > 0 ? (
          <div className="space-y-3">
            {insights.tips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500"
              >
                <div className="flex-1 text-gray-700">{tip}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            Keep climbing to unlock personalized training recommendations!
          </p>
        )}
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gray-50 rounded-lg shadow-md p-6 border-2 border-dashed border-gray-300">
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🚀</span>
          <span>Coming Soon</span>
        </h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-purple-500">▸</span>
            <span>Personalized training plans based on your goals</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-500">▸</span>
            <span>Strength & conditioning recommendations</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-500">▸</span>
            <span>Injury prevention tips and rest day suggestions</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-500">▸</span>
            <span>Technique focus areas from your climbing patterns</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
