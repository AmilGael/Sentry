import Link from "next/link";
import { getPassUtilizationReport } from "@/lib/actions/reports";
import { requireRole } from "@/lib/auth-utils";

export default async function PassesReportPage(props: {
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  await requireRole("ADMIN");
  const searchParams = await props.searchParams;

  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const startDate = searchParams.start ?? thirtyDaysAgo;
  const endDate = searchParams.end ?? today;

  const report = await getPassUtilizationReport(startDate, endDate);

  const utilized = report.completed + report.used;
  const utilizationRate = report.total > 0 ? Math.round((utilized / report.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/reports" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Reports
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Pass Utilization Report</h1>
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

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard label="Total Generated" value={report.total} />
        <MetricCard label="Utilization Rate" value={`${utilizationRate}%`} color="text-green-400" />
        <MetricCard label="Active (Pending Use)" value={report.active} color="text-blue-400" />
        <MetricCard label="Currently In Use" value={report.used} color="text-yellow-400" />
        <MetricCard label="Completed" value={report.completed} color="text-green-400" />
        <MetricCard label="Cancelled" value={report.cancelled} color="text-red-400" />
        <MetricCard label="Expired" value={report.expired} color="text-gray-400" />
      </div>

      {/* Visual Breakdown */}
      {report.total > 0 && (
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Breakdown</h2>
          <div className="space-y-3">
            <BarRow label="Completed" count={report.completed} total={report.total} color="bg-green-500" />
            <BarRow label="In Use" count={report.used} total={report.total} color="bg-yellow-500" />
            <BarRow label="Active" count={report.active} total={report.total} color="bg-blue-500" />
            <BarRow label="Cancelled" count={report.cancelled} total={report.total} color="bg-red-500" />
            <BarRow label="Expired" count={report.expired} total={report.total} color="bg-gray-500" />
          </div>
        </section>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-400">{count} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
