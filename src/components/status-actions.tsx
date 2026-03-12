"use client";

import { updateResidentStatus } from "@/lib/actions/residents";
import type { ResidentStatus, UserRole } from "@/generated/prisma/client";

const TRANSITIONS: Record<ResidentStatus, { label: string; target: ResidentStatus; roles: UserRole[] }[]> = {
  INTAKE: [
    { label: "Mark In Facility", target: "IN_FACILITY", roles: ["ADMIN", "CASE_MANAGER"] },
  ],
  IN_FACILITY: [
    { label: "Release Resident", target: "RELEASED", roles: ["ADMIN"] },
  ],
  AUTHORIZED_OUT: [],
  OVERDUE: [
    { label: "Escalate to AWOL", target: "AWOL", roles: ["ADMIN", "CASE_MANAGER"] },
  ],
  AWOL: [],
  RELEASED: [],
};

export function StatusActions({
  residentId,
  currentStatus,
  userRole,
}: {
  residentId: string;
  currentStatus: ResidentStatus;
  userRole: UserRole;
}) {
  const available = TRANSITIONS[currentStatus]?.filter((t) =>
    t.roles.includes(userRole)
  ) ?? [];

  if (available.length === 0) return null;

  return (
    <div className="flex gap-2">
      {available.map((t) => (
        <form key={t.target} action={() => updateResidentStatus(residentId, t.target)}>
          <button
            type="submit"
            className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            {t.label}
          </button>
        </form>
      ))}
    </div>
  );
}
