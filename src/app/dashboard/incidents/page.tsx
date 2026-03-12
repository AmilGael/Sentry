import Link from "next/link";
import { getIncidents } from "@/lib/actions/incidents";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { IncidentStatus, IncidentType, IncidentSeverity } from "@/generated/prisma/client";

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "text-gray-300",
  MEDIUM: "text-yellow-400",
  HIGH: "text-orange-400",
  CRITICAL: "text-red-400 font-bold",
};

export default async function IncidentsPage(props: {
  searchParams: Promise<{ status?: IncidentStatus; type?: IncidentType; severity?: IncidentSeverity }>;
}) {
  const session = await getSession();
  const searchParams = await props.searchParams;

  const incidents = await getIncidents({
    status: searchParams.status,
    type: searchParams.type,
    severity: searchParams.severity,
  });

  const openCount = incidents.filter((i) => i.status === "OPEN" || i.status === "UNDER_REVIEW").length;

  const statuses: IncidentStatus[] = ["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"];
  const types: IncidentType[] = ["LATE_RETURN", "OVERDUE", "AWOL", "PASS_TAMPERING", "UNAUTHORIZED_ATTEMPT", "OTHER"];
  const severities: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

  const canCreate = ["ADMIN", "CASE_MANAGER", "FRONT_DESK"].includes(session.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Incident Reports</h1>
          <p className="mt-1 text-sm text-gray-400">
            {incidents.length} incident{incidents.length !== 1 ? "s" : ""}
            {openCount > 0 && (
              <span className="ml-2 text-red-400">· {openCount} open</span>
            )}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/dashboard/incidents/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition-colors"
          >
            Report Incident
          </Link>
        )}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={searchParams.status}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={searchParams.type}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          name="severity"
          defaultValue={searchParams.severity}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="">All Severities</option>
          {severities.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Severity</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Resident</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Reported By</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {incidents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No incidents found.
                </td>
              </tr>
            ) : (
              incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/dashboard/incidents/${inc.id}`}
                      className="text-sm font-medium text-white hover:underline"
                    >
                      {inc.incidentDisplayId}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {inc.type.replace(/_/g, " ")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`text-sm font-medium ${SEVERITY_COLORS[inc.severity] ?? "text-gray-300"}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {inc.resident.firstName} {inc.resident.lastName}
                    <span className="ml-2 text-xs text-gray-500">{inc.resident.inmateNumber}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {inc.createdBy.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {inc.createdAt.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={inc.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
