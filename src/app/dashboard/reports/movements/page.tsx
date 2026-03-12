import Link from "next/link";
import { getDailyMovementLog, getCurrentlyOutReport } from "@/lib/actions/reports";
import { requireRole } from "@/lib/auth-utils";

export default async function MovementsReportPage(props: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireRole("ADMIN", "FRONT_DESK");
  const searchParams = await props.searchParams;
  const dateStr = searchParams.date ?? new Date().toISOString().slice(0, 10);

  const [logs, currentlyOut] = await Promise.all([
    getDailyMovementLog(dateStr),
    getCurrentlyOutReport(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/reports" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Reports
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Daily Movement Log</h1>
      </div>

      {/* Date Filter */}
      <form className="flex gap-3">
        <input
          name="date"
          type="date"
          defaultValue={dateStr}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        />
        <button
          type="submit"
          className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
        >
          Load
        </button>
      </form>

      {/* Currently Out */}
      {currentlyOut.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-yellow-400">
            Currently Out ({currentlyOut.length})
          </h2>
          <div className="overflow-x-auto rounded-lg border border-yellow-800/50">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-yellow-950/30">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Resident</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Inmate #</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Employer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Departure</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Expected Return</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 bg-gray-900">
                {currentlyOut.map((p) => {
                  const isOverdue = p.scheduledReturn < new Date();
                  return (
                    <tr key={p.id} className={isOverdue ? "bg-red-950/20" : ""}>
                      <td className="px-4 py-2 text-sm text-white">
                        {p.resident.firstName} {p.resident.lastName}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-400">{p.resident.inmateNumber}</td>
                      <td className="px-4 py-2 text-sm text-gray-300">{p.employerName}</td>
                      <td className="px-4 py-2 text-sm text-gray-400">
                        {p.actualDeparture?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-400">
                        {p.scheduledReturn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {isOverdue ? (
                          <span className="text-red-400 font-medium">OVERDUE</span>
                        ) : (
                          <span className="text-yellow-400">Out</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Movement Log */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">
          Movement Log — {new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          <span className="ml-2 text-sm font-normal text-gray-400">({logs.length} entries)</span>
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-950">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Direction</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Resident</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Inmate #</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Pass</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Employer</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                    No movements recorded for this date.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-sm text-gray-300">
                      {log.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={log.direction === "OUT" ? "text-yellow-400" : "text-green-400"}>
                        {log.direction === "OUT" ? "↑ OUT" : "↓ IN"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-white">
                      {log.resident.firstName} {log.resident.lastName}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-400">{log.resident.inmateNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-400">
                      <Link href={`/dashboard/passes/${log.passId}`} className="hover:underline">
                        {log.pass.passDisplayId}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-400">{log.pass.employerName}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">{log.recordedBy.name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
