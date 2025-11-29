import { useState, useEffect, useMemo, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { LocationType } from "../types";

const StartSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    locationType: "indoor" as LocationType,
    gymId: "",
    cragId: "",
  });

  // Show modal if route is /sessions/start
  useEffect(() => {
    if (location.pathname === "/sessions/start") {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [location.pathname]);

  const { data: gyms } = useQuery({
    queryKey: ["gyms"],
    queryFn: api.getGyms,
  });

  const { data: crags } = useQuery({
    queryKey: ["crags"],
    queryFn: api.getCrags,
  });

  const { data: previousSessions } = useQuery({
    queryKey: ["my-sessions"],
    queryFn: api.getMySessions,
  });

  // Get unique location names from previous sessions
  const previousLocations = useMemo(() => {
    if (!previousSessions) return [];
    const locations = previousSessions
      .map((session) => {
        if (session.locationType === "indoor" && session.gym) {
          return {
            name: session.gym.name,
            city: session.gym.city,
            type: "indoor" as LocationType,
            id: session.gymId,
          };
        } else if (session.locationType === "outdoor" && session.crag) {
          return {
            name: session.crag.name,
            area: session.crag.area,
            type: "outdoor" as LocationType,
            id: session.cragId,
          };
        }
        return null;
      })
      .filter(Boolean)
      .filter(
        (loc, index, self) => index === self.findIndex((l) => l?.id === loc?.id)
      );
    return locations as Array<{
      name: string;
      city?: string;
      area?: string;
      type: LocationType;
      id?: string;
    }>;
  }, [previousSessions]);

  // Filter suggestions based on current input and location type
  const filteredSuggestions = useMemo(() => {
    if (!locationInput)
      return previousLocations.filter(
        (loc) => loc.type === formData.locationType
      );
    return previousLocations.filter(
      (loc) =>
        loc.type === formData.locationType &&
        loc.name.toLowerCase().includes(locationInput.toLowerCase())
    );
  }, [locationInput, previousLocations, formData.locationType]);

  const createSessionMutation = useMutation({
    mutationFn: api.createSession,
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
      setShowModal(false);
      navigate(`/sessions/${session.id}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: any = {
      locationType: formData.locationType,
    };
    if (formData.locationType === "indoor") {
      if (formData.gymId) {
        data.gymId =
          typeof formData.gymId === "object"
            ? (formData.gymId as any).id || (formData.gymId as any)._id
            : formData.gymId;
      } else if (locationInput.trim()) {
        data.gymName = locationInput.trim();
      }
    } else if (formData.locationType === "outdoor") {
      if (formData.cragId) {
        data.cragId =
          typeof formData.cragId === "object"
            ? (formData.cragId as any).id || (formData.cragId as any)._id
            : formData.cragId;
      } else if (locationInput.trim()) {
        data.cragName = locationInput.trim();
      }
    }
    createSessionMutation.mutate(data);
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center md:justify-center z-50">
          {/* Mobile: Bottom Sheet | Desktop: Center Modal */}
          <div className="bg-white w-full md:max-w-2xl md:mx-4 rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
            {/* Handle bar (mobile only) */}
            <div className="flex justify-center pt-3 pb-2 md:hidden">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Start Session
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track your climbing visit
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  // If opened via route, go back
                  if (location.pathname === "/sessions/start") navigate(-1);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form
              id="session-form"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
            >
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  Location Type
                </label>
                <select
                  value={formData.locationType}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      locationType: e.target.value as LocationType,
                      gymId: "",
                      cragId: "",
                    });
                    setLocationInput("");
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-base font-semibold text-gray-900 mb-3">
                  {formData.locationType === "indoor" ? "Gym" : "Crag"}
                </label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => {
                    setLocationInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 200)
                  }
                  placeholder={
                    formData.locationType === "indoor"
                      ? "Enter gym name..."
                      : "Enter crag name..."
                  }
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white text-gray-700 placeholder:text-gray-400"
                />

                {/* Autocomplete Suggestions */}
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-auto">
                    {filteredSuggestions.map((location, index) => (
                      <button
                        key={`${location.id}-${index}`}
                        type="button"
                        onClick={() => {
                          setLocationInput(location.name);
                          if (formData.locationType === "indoor") {
                            setFormData({
                              ...formData,
                              gymId: location.id || "",
                            });
                          } else {
                            setFormData({
                              ...formData,
                              cragId: location.id || "",
                            });
                          }
                          setShowSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                      >
                        <div className="font-semibold text-gray-900">
                          {location.name}
                        </div>
                        {(location.city || location.area) && (
                          <div className="text-sm text-gray-500">
                            {location.city || location.area}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* All gyms/crags dropdown - fallback */}
                {showSuggestions &&
                  locationInput &&
                  filteredSuggestions.length === 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-auto">
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No previous locations found. Browse all:
                      </div>
                      {formData.locationType === "indoor"
                        ? gyms?.map((gym) => (
                            <button
                              key={gym.id}
                              type="button"
                              onClick={() => {
                                setLocationInput(gym.name);
                                setFormData({ ...formData, gymId: gym.id });
                                setShowSuggestions(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="font-semibold text-gray-900">
                                {gym.name}
                              </div>
                              {gym.city && (
                                <div className="text-sm text-gray-500">
                                  {gym.city}
                                </div>
                              )}
                            </button>
                          ))
                        : crags?.map((crag) => (
                            <button
                              key={crag.id}
                              type="button"
                              onClick={() => {
                                setLocationInput(crag.name);
                                setFormData({ ...formData, cragId: crag.id });
                                setShowSuggestions(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                              <div className="font-semibold text-gray-900">
                                {crag.name}
                              </div>
                              {crag.area && (
                                <div className="text-sm text-gray-500">
                                  {crag.area}
                                </div>
                              )}
                            </button>
                          ))}
                    </div>
                  )}
              </div>
            </form>

            {/* Fixed Bottom Button */}
            <div className="border-t border-gray-200 px-6 py-4 bg-white">
              <button
                type="submit"
                form="session-form"
                disabled={createSessionMutation.isPending}
                className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 font-medium text-lg"
              >
                {createSessionMutation.isPending
                  ? "Starting..."
                  : "Start Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartSessionPage;
