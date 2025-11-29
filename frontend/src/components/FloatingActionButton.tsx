import { useState } from "react";
import { useSessionTimer, formatDuration } from "../utils/timer";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as api from "../api";

export const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const { data: sessions } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: api.getMySessions,
  });

  const activeSession = sessions?.find((s) => !s.endedAt);
  const timer = useSessionTimer(
    activeSession?.startedAt,
    activeSession?.endedAt
  );

  // If there's an active session, show half-circle popping out from bottom nav (mobile) or regular button (desktop)
  if (activeSession) {
    return (
      <>
        {/* Mobile: Timer-only red bubble */}
        <button
          onClick={() => navigate(`/sessions/${activeSession.id}`)}
          className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 font-mono text-2xl"
          title={`Active Session: ${
            activeSession.gym?.name || activeSession.crag?.name || "In Progress"
          }`}
        >
          {formatDuration(timer)}
        </button>

        {/* Desktop: Timer-only red bubble */}
        <button
          onClick={() => navigate(`/sessions/${activeSession.id}`)}
          className="hidden md:flex fixed bottom-8 right-8 z-40 bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 items-center justify-center shadow-lg transition-transform hover:scale-110 font-mono text-xl"
          title={`Active Session: ${
            activeSession.gym?.name || activeSession.crag?.name || "In Progress"
          }`}
        >
          {formatDuration(timer)}
        </button>
      </>
    );
  }

  return (
    <>
      {/* Mobile: Full circle popping from bottom nav */}
      <div className="md:hidden fixed bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 z-50">
        {isOpen && (
          <div className="flex flex-col items-center space-y-2 mb-2">
            <button
              className="bg-gradient-to-r from-primary-500 via-primary-600 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white rounded-full px-5 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
              title="Start Session"
              onClick={() => {
                setIsOpen(false);
                navigate("/sessions/start");
              }}
            >
              <span className="text-sm font-medium">Start Session</span>
              <span className="text-xl">🧗</span>
            </button>
            <Link
              to="/log"
              className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full px-5 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
              title="Log Climb"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-sm font-medium">Log Climb</span>
              <span className="text-xl">+</span>
            </Link>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-br from-primary-600 via-blue-600 to-cyan-400 hover:from-primary-700 hover:to-blue-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title="Actions"
        >
          <span className="text-2xl">{isOpen ? "×" : "+"}</span>
        </button>
      </div>

      {/* Desktop: Regular FAB */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col items-end space-y-3 z-40">
        {isOpen && (
          <>
            <button
              className="bg-gradient-to-r from-primary-500 via-primary-600 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white rounded-full px-5 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
              title="Start Session"
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent("openStartSessionModal"));
              }}
            >
              <span className="text-sm font-medium">Start Session</span>
              <span className="text-xl">🧗</span>
            </button>
            <Link
              to="/log"
              className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full px-5 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
              title="Log Climb"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-sm font-medium">Log Climb</span>
              <span className="text-xl">+</span>
            </Link>
          </>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-br from-primary-600 via-blue-600 to-cyan-400 hover:from-primary-700 hover:to-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title="Actions"
        >
          <span className="text-2xl">{isOpen ? "×" : "+"}</span>
        </button>
      </div>
    </>
  );
};
