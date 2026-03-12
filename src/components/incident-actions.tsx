"use client";

import { useState, useTransition } from "react";
import {
  resolveIncident,
  reopenIncident,
  closeIncident,
  markUnderReview,
} from "@/lib/actions/incidents";

export function IncidentActions({
  incidentId,
  status,
  userRole,
}: {
  incidentId: string;
  status: string;
  userRole: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [showResolve, setShowResolve] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isAdmin = userRole === "ADMIN";
  const isCM = userRole === "CASE_MANAGER";

  function handleAction(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Action failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Mark Under Review */}
        {status === "OPEN" && (isAdmin || isCM) && (
          <button
            onClick={() => handleAction(() => markUnderReview(incidentId))}
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            Mark Under Review
          </button>
        )}

        {/* Resolve */}
        {(status === "OPEN" || status === "UNDER_REVIEW") && (isAdmin || isCM) && (
          <>
            {!showResolve ? (
              <button
                onClick={() => setShowResolve(true)}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
              >
                Resolve
              </button>
            ) : (
              <div className="w-full space-y-2">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Resolution notes (required)…"
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (!notes.trim()) {
                        setError("Resolution notes are required.");
                        return;
                      }
                      handleAction(() => resolveIncident(incidentId, notes));
                    }}
                    disabled={isPending}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50"
                  >
                    {isPending ? "…" : "Confirm Resolve"}
                  </button>
                  <button
                    onClick={() => { setShowResolve(false); setNotes(""); setError(null); }}
                    className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Reopen */}
        {status === "RESOLVED" && isAdmin && (
          <button
            onClick={() => handleAction(() => reopenIncident(incidentId))}
            disabled={isPending}
            className="rounded-lg border border-yellow-700 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-950 transition-colors disabled:opacity-50"
          >
            Reopen
          </button>
        )}

        {/* Close */}
        {status === "RESOLVED" && isAdmin && (
          <button
            onClick={() => handleAction(() => closeIncident(incidentId))}
            disabled={isPending}
            className="rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
