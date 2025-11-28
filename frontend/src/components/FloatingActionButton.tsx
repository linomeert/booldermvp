import { useState } from "react";
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

  // If there's an active session, show half-circle popping out from bottom nav (mobile) or regular button (desktop)
  if (activeSession) {
    return (
      <>
        {/* Mobile: Full circle popping from bottom nav */}
        <button
          onClick={() => navigate(`/sessions/${activeSession.id}`)}
          className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 hover:bg-red-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title={`Active Session: ${
            activeSession.gym?.name || activeSession.crag?.name || "In Progress"
          }`}
        >
          <div className="relative">
            <span className="text-3xl">🧗</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
          </div>
        </button>

        {/* Desktop: Regular circular button */}
        <button
          onClick={() => navigate(`/sessions/${activeSession.id}`)}
          className="hidden md:flex fixed bottom-8 right-8 z-40 bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 items-center justify-center shadow-lg transition-transform hover:scale-110"
          title={`Active Session: ${
            activeSession.gym?.name || activeSession.crag?.name || "In Progress"
          }`}
        >
          <div className="relative">
            <span className="text-3xl">🧗</span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
            </span>
          </div>
        </button>
      </>
    );
  }

  return (
    <>
      {/* Mobile: Full circle popping from bottom nav */}
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 z-50">
        {isOpen && (
          <div className="flex flex-col items-center space-y-2 mb-2">
            <Link
              to="/sessions/start"
              className="bg-white hover:bg-gray-50 text-gray-700 rounded-full px-4 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
              title="Start Session"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-sm font-medium">Start Session</span>
              <span className="text-xl">🧗</span>
            </Link>
            <Link
              to="/log"
              className="bg-white hover:bg-gray-50 text-gray-700 rounded-full px-4 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
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
          className="bg-primary-600 hover:bg-primary-700 text-white w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title="Actions"
        >
          <span className="text-2xl">{isOpen ? "×" : "+"}</span>
        </button>
      </div>

      {/* Desktop: Regular FAB */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col items-end space-y-3 z-40">
        {isOpen && (
          <>
            <Link
              to="/sessions/start"
              className="bg-white hover:bg-gray-50 text-gray-700 rounded-full px-4 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
              title="Start Session"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-sm font-medium">Start Session</span>
              <span className="text-xl">🧗</span>
            </Link>
            <Link
              to="/log"
              className="bg-white hover:bg-gray-50 text-gray-700 rounded-full px-4 py-3 flex items-center shadow-lg gap-2 transition-transform hover:scale-105"
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
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
          title="Actions"
        >
          <span className="text-2xl">{isOpen ? "×" : "+"}</span>
        </button>
      </div>
    </>
  );
};
