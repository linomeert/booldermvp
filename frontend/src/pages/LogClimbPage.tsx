import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { ClimbStatus, LocationType } from "../types";
import { useAuth } from "../context/AuthContext";

export const LogClimbPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");
  const { user } = useAuth();

  const [gradeType, setGradeType] = useState<"us" | "fr" | "color">("us");
  const [climberId, setClimberId] = useState<string>("");
  const [formData, setFormData] = useState({
    status: "top" as ClimbStatus,
    locationType: "indoor" as LocationType,
    gymId: "",
    cragId: "",
    grade: "",
    style: "",
    attempts: "",
    mediaUrl: "",
    notes: "",
    sessionId: sessionIdFromUrl || "",
  });

  // Grade options
  const usGrades = [
    "V0",
    "V1",
    "V2",
    "V3",
    "V4",
    "V5",
    "V6",
    "V7",
    "V8",
    "V9",
    "V10",
    "V11",
    "V12",
    "V13",
    "V14",
    "V15",
    "V16",
    "V17",
  ];
  const frGrades = [
    "3",
    "4",
    "4+",
    "5",
    "5+",
    "6A",
    "6A+",
    "6B",
    "6B+",
    "6C",
    "6C+",
    "7A",
    "7A+",
    "7B",
    "7B+",
    "7C",
    "7C+",
    "8A",
    "8A+",
    "8B",
    "8B+",
    "8C",
    "8C+",
    "9A",
  ];
  const colors = [
    "White",
    "Yellow",
    "Orange",
    "Green",
    "Blue",
    "Red",
    "Purple",
    "Black",
  ];

  const { data: gyms } = useQuery({
    queryKey: ["gyms"],
    queryFn: api.getGyms,
  });

  const { data: crags } = useQuery({
    queryKey: ["crags"],
    queryFn: api.getCrags,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: api.getMySessions,
  });

  const { data: currentSession } = useQuery({
    queryKey: ["session", sessionIdFromUrl],
    queryFn: () => api.getSessionById(sessionIdFromUrl!),
    enabled: !!sessionIdFromUrl,
  });

  // Pre-fill location data from session and initialize climber as current user
  useEffect(() => {
    if (currentSession) {
      const gymId =
        typeof currentSession.gymId === "string"
          ? currentSession.gymId
          : (currentSession.gymId as any)?.id ||
            (currentSession.gym as any)?.id ||
            "";
      const cragId =
        typeof currentSession.cragId === "string"
          ? currentSession.cragId
          : (currentSession.cragId as any)?.id ||
            (currentSession.crag as any)?.id ||
            "";

      setFormData((prev) => ({
        ...prev,
        locationType: currentSession.locationType,
        gymId,
        cragId,
      }));

      // Initialize climber as current user if session has participants
      if (
        currentSession.participants &&
        currentSession.participants.length > 0 &&
        user
      ) {
        setClimberId(user.id);
      }
    }
  }, [currentSession, user]);

  const [showSuccess, setShowSuccess] = useState(false);

  const createClimbMutation = useMutation({
    mutationFn: api.createClimb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["climbs"] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({
        queryKey: ["session", sessionIdFromUrl],
      });
      setShowSuccess(true);

      // Auto-navigate after 3 seconds if no action taken
      setTimeout(() => {
        if (sessionIdFromUrl) {
          navigate(`/sessions/${sessionIdFromUrl}`);
        } else {
          navigate("/");
        }
      }, 3000);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const data: any = {
      status: formData.status,
      locationType: formData.locationType,
      grade: formData.grade,
    };

    if (formData.locationType === "indoor" && formData.gymId) {
      data.gymId = formData.gymId;
    } else if (formData.locationType === "outdoor" && formData.cragId) {
      data.cragId = formData.cragId;
    }

    if (formData.style) data.style = formData.style;
    if (formData.attempts) data.attempts = parseInt(formData.attempts);
    if (formData.mediaUrl) data.mediaUrl = formData.mediaUrl;
    if (formData.notes) data.notes = formData.notes;
    if (formData.sessionId) data.sessionId = formData.sessionId;
    if (climberId) data.climberId = climberId;

    createClimbMutation.mutate(data);
  };

  const activeSessions = sessions?.filter((s) => !s.endedAt) || [];

  // Debug logging
  console.log("Sessions data:", sessions);
  console.log("Active sessions:", activeSessions);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Log Climb</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "top" })}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                formData.status === "top"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              ✓ Top
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: "project" })}
              className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                formData.status === "project"
                  ? "bg-amber-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📍 Project
            </button>
          </div>
        </div>

        {/* Climber selector for shared sessions */}
        {currentSession &&
          currentSession.participants &&
          currentSession.participants.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Climber
              </label>
              <select
                value={climberId}
                onChange={(e) => setClimberId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={user?.id || ""}>{user?.name || "Me"}</option>
                {currentSession.participants.map((participant: any) => (
                  <option
                    key={participant.id || participant}
                    value={participant.id || participant}
                  >
                    {typeof participant === "object"
                      ? participant.name
                      : participant}
                  </option>
                ))}
              </select>
            </div>
          )}

        {!sessionIdFromUrl && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Type
              </label>
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    locationType: e.target.value as LocationType,
                    gymId: "",
                    cragId: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            {formData.locationType === "indoor" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gym
                </label>
                <select
                  value={formData.gymId}
                  onChange={(e) =>
                    setFormData({ ...formData, gymId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a gym</option>
                  {gyms?.map((gym) => (
                    <option key={gym.id} value={gym.id}>
                      {gym.name} {gym.city && `- ${gym.city}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crag
                </label>
                <select
                  value={formData.cragId}
                  onChange={(e) =>
                    setFormData({ ...formData, cragId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a crag</option>
                  {crags?.map((crag) => (
                    <option key={crag.id} value={crag.id}>
                      {crag.name} {crag.area && `- ${crag.area}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade *
          </label>

          {/* Grade Type Tabs */}
          <div className="flex border-b border-gray-200 mb-3">
            <button
              type="button"
              onClick={() => setGradeType("us")}
              className={`px-4 py-2 font-medium transition-colors ${
                gradeType === "us"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              US (V-Scale)
            </button>
            <button
              type="button"
              onClick={() => setGradeType("fr")}
              className={`px-4 py-2 font-medium transition-colors ${
                gradeType === "fr"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              FR (Fontainebleau)
            </button>
            <button
              type="button"
              onClick={() => setGradeType("color")}
              className={`px-4 py-2 font-medium transition-colors ${
                gradeType === "color"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Color
            </button>
          </div>

          {/* Grade Selection */}
          <div className="grid grid-cols-6 gap-2">
            {gradeType === "us" &&
              usGrades.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade })}
                  className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                    formData.grade === grade
                      ? "bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {grade}
                </button>
              ))}
            {gradeType === "fr" &&
              frGrades.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade })}
                  className={`py-3 px-2 rounded-lg font-semibold transition-all ${
                    formData.grade === grade
                      ? "bg-primary-600 text-white ring-2 ring-primary-600 ring-offset-2"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {grade}
                </button>
              ))}
            {gradeType === "color" &&
              colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, grade: color })}
                  className="p-2 transition-all flex items-center justify-center"
                >
                  <div
                    className={`w-14 h-14 rounded-full shadow-md transition-all ${
                      formData.grade === color
                        ? "ring-4 ring-primary-600 ring-offset-2 scale-110"
                        : "hover:scale-105"
                    } ${
                      color === "White"
                        ? "bg-white border-2 border-gray-300"
                        : color === "Yellow"
                        ? "bg-yellow-400"
                        : color === "Orange"
                        ? "bg-orange-500"
                        : color === "Green"
                        ? "bg-green-600"
                        : color === "Blue"
                        ? "bg-blue-600"
                        : color === "Red"
                        ? "bg-red-600"
                        : color === "Purple"
                        ? "bg-purple-600"
                        : "bg-gray-900"
                    }`}
                  />
                </button>
              ))}
          </div>
          {!formData.grade && (
            <p className="mt-2 text-sm text-red-600">Please select a grade</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Style
            </label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) =>
                setFormData({ ...formData, style: e.target.value })
              }
              placeholder="e.g., flash, onsight, redpoint"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attempts
            </label>
            <input
              type="number"
              min="1"
              value={formData.attempts}
              onChange={(e) =>
                setFormData({ ...formData, attempts: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {!sessionIdFromUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add to Session (optional)
            </label>
            <select
              value={formData.sessionId}
              onChange={(e) =>
                setFormData({ ...formData, sessionId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">No session</option>
              {sessionsLoading && <option disabled>Loading sessions...</option>}
              {!sessionsLoading &&
                activeSessions.map((session: any) => (
                  <option
                    key={session.id || session._id}
                    value={session.id || session._id}
                  >
                    {session.gym?.name ||
                      session.crag?.name ||
                      (session.locationType === "indoor"
                        ? "Indoor Session"
                        : "Outdoor Session")}{" "}
                    - {new Date(session.startedAt).toLocaleDateString()}
                  </option>
                ))}
            </select>
            {!sessionsLoading && activeSessions.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                No active sessions. Sessions help track multiple climbs
                together.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media URL
          </label>
          <input
            type="url"
            value={formData.mediaUrl}
            onChange={(e) =>
              setFormData({ ...formData, mediaUrl: e.target.value })
            }
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={createClimbMutation.isPending}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {createClimbMutation.isPending ? "Logging..." : "Log Climb"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        {createClimbMutation.isError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            Failed to log climb. Please try again.
          </div>
        )}
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Climb Logged!
              </h3>
              <p className="text-gray-600 mb-6">
                Your climb has been successfully logged.
              </p>
              <button
                onClick={() => {
                  if (sessionIdFromUrl) {
                    navigate(`/sessions/${sessionIdFromUrl}`);
                  } else {
                    navigate("/");
                  }
                }}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
