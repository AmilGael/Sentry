import Link from "next/link";
import { getIncidentSummaryReport } from "@/lib/actions/reports";
import { requireRole } from "@/lib/auth-utils";

const TYPE_LABELS: Record<string, string> = {
  LATE_RETURN: "Late Return",
  OVERDUE: "Overdue",
  AWOL: "AWOL",
  PASS_TAMPERING: "Pass Tampering",
  UNAUTHORIZED_ATTEMPT: "Unauthorized Attempt",
  OTHER: "Other",
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-500",
  MEDIUM: "bg-yellow-500",
  HIGH: "bg-orange-500",
  CRITICAL: "bg-red-500",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-500",
  UNDER_REVIEW: "bg-blue-500",
  RESOLVED: "bg-green-500",
  CLOSED: "bg-gray-500",
};

export default async function IncidentsReportPage(props: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await requireRole("ADMIN");
  const searchParams = await props.searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const startDate = searchParams.start ?? thirtyDaysAgo;
  const endDate = searchParams.end ?? today;

  const report = await getIncidentSummaryReport(startDate, endDate);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/reports" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Reports
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Incident Summary Report</h1>
      </div>

      {/* Date Range */}
      <form className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Start Date</label>
          <input
            name="start"
            type="date"
            defaultValue={startDate}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">End Date</label>
          <input
            name="end"
            type="date"
            defaultValue={endDate}
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Generate
        </button>
      </form>

      {/* Total */}
      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Total Incidents</p>
        <p className="mt-1 text-4xl font-bold text-white">{report.total}</p>
        <p className="mt-1 text-sm text-gray-400">
          {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* By Type */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">By Type</h2>
          {Object.keys(report.byType).length === 0 ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(report.byType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{TYPE_LABELS[type] ?? type}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/30"
                        style={{ width: `${report.total > 0 ? Math.round((count / report.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* By Severity */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">By Severity</h2>
          {Object.keys(report.bySeverity).length === 0 ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <div className="space-y-3">
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"]
                .filter((s) => report.bySeverity[s])
                .map((severity) => (
                  <div key={severity} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{severity}</span>
                      <span className="text-gray-400">{report.bySeverity[severity]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${SEVERITY_COLORS[severity]}`}
                        style={{ width: `${report.total > 0 ? Math.round((report.bySeverity[severity] / report.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* By Status */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">By Status</h2>
          {Object.keys(report.byStatus).length === 0 ? (
            <p className="text-sm text-gray-500">No data.</p>
          ) : (
            <div className="space-y-3">
              {["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"]
                .filter((s) => report.byStatus[s])
                .map((status) => (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{status.replace(/_/g, " ")}</span>
                      <span className="text-gray-400">{report.byStatus[status]}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_COLORS[status]}`}
                        style={{ width: `${report.total > 0 ? Math.round((report.byStatus[status] / report.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
