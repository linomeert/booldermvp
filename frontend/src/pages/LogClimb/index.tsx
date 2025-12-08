import { useState, FormEvent, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../../api";
import type { ClimbStatus, LocationType } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { GradeSelector } from "./GradeSelector";
import { SuccessModal } from "./SuccessModal";
import { updateForm, type FormData } from "./updateForm";

export const LogClimbPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const sessionIdFromUrl = searchParams.get("sessionId");
  const { user } = useAuth();

  const [gradeType, setGradeType] = useState<"us" | "fr" | "color">("us");
  const [customGrading, setCustomGrading] = useState<string[] | null>(null);
  const [climberId, setClimberId] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>({
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

  useEffect(() => {
    if (currentSession?.gym?.grading && currentSession.gym.grading.length > 0) {
      setCustomGrading(currentSession.gym.grading);
    } else {
      setCustomGrading(null);
    }
  }, [currentSession]);

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
    if (images.length > 0) data.images = images;
    if (formData.notes) data.notes = formData.notes;
    if (formData.sessionId) data.sessionId = formData.sessionId;
    if (climberId) data.climberId = climberId;

    createClimbMutation.mutate(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        api.uploadImage(file)
      );
      const results = await Promise.all(uploadPromises);
      const urls = results.map((result) => result.url);
      setImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Failed to upload images:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to upload images: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const activeSessions = useMemo(
    () => sessions?.filter((s) => !s.endedAt) || [],
    [sessions]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center md:justify-center z-50">
      {/* Mobile: Bottom Sheet | Desktop: Center Modal */}
      <div className="bg-white w-full md:max-w-2xl md:mx-4 rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Handle bar (mobile only) */}
        <div className="flex justify-center pt-3 pb-2 md:hidden">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Add New Climb</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form
          id="climb-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Status
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData(updateForm(formData, { status: "top" }))
                }
                className={`py-3 px-4 rounded-2xl font-medium transition-colors ${
                  formData.status === "top"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ✓ Top
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData(updateForm(formData, { status: "project" }))
                }
                className={`py-3 px-4 rounded-2xl font-medium transition-colors ${
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
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Climber
                </label>
                <select
                  value={climberId}
                  onChange={(e) => setClimberId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
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
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Location Type
                </label>
                <select
                  value={formData.locationType}
                  onChange={(e) =>
                    setFormData(
                      updateForm(formData, {
                        locationType: e.target.value as LocationType,
                        gymId: "",
                        cragId: "",
                      })
                    )
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              {formData.locationType === "indoor" ? (
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Gym
                  </label>
                  <select
                    value={formData.gymId}
                    onChange={(e) =>
                      setFormData(
                        updateForm(formData, { gymId: e.target.value })
                      )
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
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
                  <label className="block text-base font-semibold text-gray-900 mb-3">
                    Crag
                  </label>
                  <select
                    value={formData.cragId}
                    onChange={(e) =>
                      setFormData(
                        updateForm(formData, { cragId: e.target.value })
                      )
                    }
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
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
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Grade *
            </label>
            <GradeSelector
              gradeType={gradeType}
              onGradeTypeChange={setGradeType}
              selectedGrade={formData.grade}
              onGradeSelect={(grade) =>
                setFormData(updateForm(formData, { grade }))
              }
              customGrading={customGrading}
            />
            {!formData.grade && (
              <p className="mt-2 text-sm text-red-600">Please select a grade</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Style
              </label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) =>
                  setFormData(updateForm(formData, { style: e.target.value }))
                }
                placeholder="e.g., flash, onsight"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Attempts
              </label>
              <input
                type="number"
                min="1"
                value={formData.attempts}
                onChange={(e) =>
                  setFormData(
                    updateForm(formData, { attempts: e.target.value })
                  )
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
              />
            </div>
          </div>

          {!sessionIdFromUrl && (
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-3">
                Add to Session (optional)
              </label>
              <select
                value={formData.sessionId}
                onChange={(e) =>
                  setFormData(
                    updateForm(formData, { mediaUrl: e.target.value })
                  )
                }
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
              >
                <option value="">No session</option>
                {sessionsLoading && (
                  <option disabled>Loading sessions...</option>
                )}
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
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Media URL
            </label>
            <input
              type="url"
              value={formData.mediaUrl}
              onChange={(e) =>
                setFormData({ ...formData, mediaUrl: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              📷 Photos
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {uploading && (
                <p className="text-sm text-gray-500">Uploading images...</p>
              )}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-gray-900 mb-3">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              placeholder="What was this for?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700 placeholder:text-gray-400 resize-none"
            />
          </div>

          {createClimbMutation.isError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              Failed to log climb. Please try again.
            </div>
          )}
        </form>

        {/* Fixed Bottom Button */}
        <div className="border-t border-gray-200 px-6 py-4 bg-white">
          <button
            type="submit"
            form="climb-form"
            disabled={createClimbMutation.isPending}
            className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 font-medium text-lg"
          >
            {createClimbMutation.isPending ? "Adding..." : "Add Climb"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onContinue={() => {
          if (sessionIdFromUrl) {
            navigate(`/sessions/${sessionIdFromUrl}`);
          } else {
            navigate("/");
          }
        }}
      />
    </div>
  );
};
