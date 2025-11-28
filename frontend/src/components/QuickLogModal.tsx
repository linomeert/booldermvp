import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import { Climb } from "../types";

interface QuickLogModalProps {
  climb: Climb;
  sessionId: string;
  mode: "top" | "flash";
  onClose: () => void;
}

export const QuickLogModal = ({
  climb,
  sessionId,
  mode,
  onClose,
}: QuickLogModalProps) => {
  const queryClient = useQueryClient();
  const [attempts, setAttempts] = useState(mode === "flash" ? "1" : "");
  const [notes, setNotes] = useState("");

  const createClimbMutation = useMutation({
    mutationFn: api.createClimb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["climbs"] });
      onClose();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const data: any = {
      sessionId,
      status: "top" as const,
      locationType: climb.locationType,
      grade: climb.grade,
      attempts: mode === "flash" ? 1 : parseInt(attempts) || undefined,
      notes: notes || undefined,
      projectDate: climb.createdAt,
    };

    if (climb.locationType === "indoor") {
      data.gymId = climb.gymId || climb.gym?.id;
    } else if (climb.locationType === "outdoor") {
      data.cragId = climb.cragId || climb.crag?.id;
    }

    createClimbMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {mode === "flash" ? "⚡ Flash!" : "✅ Top!"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">
              {climb.grade}
            </span>
            <span className="text-sm text-gray-600">
              {climb.gym?.name || climb.crag?.name}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "top" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attempts
              </label>
              <input
                type="number"
                min="1"
                value={attempts}
                onChange={(e) => setAttempts(e.target.value)}
                placeholder="How many attempts?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How did it feel?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createClimbMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium disabled:bg-gray-400 transition-colors"
            >
              {createClimbMutation.isPending ? "Logging..." : "Log Climb"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
