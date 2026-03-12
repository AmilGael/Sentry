"use client";

import { useState } from "react";
import {
  approveAuthorization,
  denyAuthorization,
  ratifyAuthorization,
  revokeAuthorization,
} from "@/lib/actions/authorizations";
import type { AuthorizationStatus, UserRole } from "@/generated/prisma/client";

export function AuthorizationActions({
  authId,
  status,
  userRole,
}: {
  authId: string;
  status: AuthorizationStatus;
  userRole: UserRole;
}) {
  const [showDeny, setShowDeny] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isES = userRole === "EMPLOYMENT_SPECIALIST" || userRole === "ADMIN";
  const canReview = isES && (status === "PENDING" || status === "UNDER_REVIEW");
  const canRatify = isES && status === "CM_SELF_APPROVED";
  const canRevoke =
    (userRole === "ADMIN" || userRole === "CASE_MANAGER" || userRole === "EMPLOYMENT_SPECIALIST") &&
    ["APPROVED", "CM_SELF_APPROVED", "ES_RATIFIED", "ACTIVE"].includes(status);

  if (!canReview && !canRatify && !canRevoke) return null;

  async function handleApprove() {
    setLoading(true);
    await approveAuthorization(authId);
    setLoading(false);
  }

  async function handleRatify() {
    setLoading(true);
    await ratifyAuthorization(authId);
    setLoading(false);
  }

  async function handleDeny() {
    if (!reason.trim()) return;
    setLoading(true);
    await denyAuthorization(authId, reason);
    setLoading(false);
  }

  async function handleRevoke() {
    if (!reason.trim()) return;
    setLoading(true);
    await revokeAuthorization(authId, reason);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {canReview && (
          <>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setShowDeny(true)}
              disabled={loading}
              className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Deny
            </button>
          </>
        )}
        {canRatify && (
          <button
            onClick={handleRatify}
            disabled={loading}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            Ratify Self-Approval
          </button>
        )}
        {canRevoke && (
          <button
            onClick={() => setShowRevoke(true)}
            disabled={loading}
            className="rounded-lg border border-red-700 px-4 py-2 text-sm text-red-400 hover:bg-red-950 disabled:opacity-50 transition-colors"
          >
            Revoke Authorization
          </button>
        )}
      </div>

      {(showDeny || showRevoke) && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            {showDeny ? "Denial Reason" : "Revocation Reason"} (required)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="block w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
            placeholder="Provide a reason..."
          />
          <div className="flex gap-2">
            <button
              onClick={showDeny ? handleDeny : handleRevoke}
              disabled={loading || !reason.trim()}
              className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Processing..." : showDeny ? "Confirm Deny" : "Confirm Revoke"}
            </button>
            <button
              onClick={() => { setShowDeny(false); setShowRevoke(false); setReason(""); }}
              className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
