import { useState, FormEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import type { LocationType } from "../types";

export const StartSessionPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showGymSelect, setShowGymSelect] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    locationType: "indoor" as LocationType,
    gymId: "",
    cragId: "",
  });

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
      navigate(`/sessions/${session.id}`);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const data: any = {
      locationType: formData.locationType,
    };

    if (formData.locationType === "indoor" && formData.gymId) {
      data.gymId = formData.gymId;
    } else if (formData.locationType === "outdoor" && formData.cragId) {
      data.cragId = formData.cragId;
    }

    createSessionMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Start Session</h1>
      <p className="text-gray-600 mb-8">
        Track multiple climbs together in a session. Perfect for logging your
        gym or crag visits.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="indoor">Indoor</option>
            <option value="outdoor">Outdoor</option>
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowGymSelect(!showGymSelect)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
          >
            {showGymSelect ? "−" : "+"}{" "}
            {formData.locationType === "indoor" ? "Add Gym" : "Add Crag"}
          </button>
        </div>

        {showGymSelect && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={
                formData.locationType === "indoor"
                  ? "Enter gym name..."
                  : "Enter crag name..."
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />

            {/* Autocomplete Suggestions */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredSuggestions.map((location, index) => (
                  <button
                    key={`${location.id}-${index}`}
                    type="button"
                    onClick={() => {
                      setLocationInput(location.name);
                      if (formData.locationType === "indoor") {
                        setFormData({ ...formData, gymId: location.id || "" });
                      } else {
                        setFormData({ ...formData, cragId: location.id || "" });
                      }
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-900">
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
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
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-gray-900">
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
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-gray-900">
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
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>What's a session?</strong> Track your climbing progress with
            sessions that group your sends together, making it easy to monitor
            your performance and sync your achievements to Strava.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSessionMutation.isPending}
            className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-gray-400"
          >
            {createSessionMutation.isPending ? "Starting..." : "Start Session"}
          </button>
        </div>
      </form>
    </div>
  );
};
