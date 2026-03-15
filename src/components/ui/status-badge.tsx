import type { ResidentStatus, AuthorizationStatus, PassStatus, IncidentStatus } from "@/generated/prisma/client";

type AllStatuses = ResidentStatus | AuthorizationStatus | PassStatus | IncidentStatus;

const STATUS_STYLES: Record<string, string> = {
  // Resident statuses
  INTAKE: "bg-blue-950 text-blue-300 border-blue-800",
  IN_FACILITY: "bg-green-950 text-green-300 border-green-800",
  AUTHORIZED_OUT: "bg-yellow-950 text-yellow-300 border-yellow-800",
  OVERDUE: "bg-red-950 text-red-300 border-red-800",
  AWOL: "bg-red-900 text-red-200 border-red-700",
  RELEASED: "bg-gray-800 text-gray-300 border-gray-700",

  // Authorization statuses
  PENDING: "bg-yellow-950 text-yellow-300 border-yellow-800",
  UNDER_REVIEW: "bg-blue-950 text-blue-300 border-blue-800",
  APPROVED: "bg-green-950 text-green-300 border-green-800",
  CM_SELF_APPROVED: "bg-orange-950 text-orange-300 border-orange-800",
  ES_RATIFIED: "bg-green-950 text-green-300 border-green-800",
  ACTIVE: "bg-green-950 text-green-300 border-green-800",
  DENIED: "bg-red-950 text-red-300 border-red-800",
  REVOKED: "bg-red-900 text-red-200 border-red-700",
  EXPIRED: "bg-gray-800 text-gray-300 border-gray-700",

  // Pass statuses
  USED: "bg-blue-950 text-blue-300 border-blue-800",
  COMPLETED: "bg-green-950 text-green-300 border-green-800",
  CANCELLED: "bg-red-950 text-red-300 border-red-800",

  // Incident statuses
  OPEN: "bg-red-950 text-red-300 border-red-800",
  RESOLVED: "bg-green-950 text-green-300 border-green-800",
  CLOSED: "bg-gray-800 text-gray-300 border-gray-700",
};

const STATUS_LABELS: Record<string, string> = {
  IN_FACILITY: "In Facility",
  AUTHORIZED_OUT: "Authorized Out",
  CM_SELF_APPROVED: "CM Self-Approved",
  ES_RATIFIED: "ES Ratified",
  UNDER_REVIEW: "Under Review",
  DAY_LABOR: "Day Labor",
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  PUBLIC_TRANSIT: "Public Transit",
  PERSONAL_VEHICLE: "Personal Vehicle",
  EMPLOYER_TRANSPORT: "Employer Transport",
  JOB_SEARCH: "Job Search",
  LATE_RETURN: "Late Return",
  PASS_TAMPERING: "Pass Tampering",
  UNAUTHORIZED_ATTEMPT: "Unauthorized Attempt",
  COMPLETED: "Returned",
};

function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");
}

export function StatusBadge({ status }: { status: AllStatuses | string }) {
  const style = STATUS_STYLES[status] ?? "bg-gray-800 text-gray-300 border-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {formatStatus(status)}
    </span>
  );
}
