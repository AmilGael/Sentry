import Link from "next/link";
import { getEmploymentPlacementReport } from "@/lib/actions/reports";
import { requireRole } from "@/lib/auth-utils";

export default async function PlacementsReportPage() {
  await requireRole("ADMIN");
  const placements = await getEmploymentPlacementReport();

  const totalResidents = placements.reduce((s, cm) => s + cm.totalResidents, 0);
  const totalEmployed = placements.reduce((s, cm) => s + cm.residentsWithEmployment, 0);
  const placementRate = totalResidents > 0 ? Math.round((totalEmployed / totalResidents) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard/reports" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Reports
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Employment Placement Report</h1>
        <p className="mt-1 text-sm text-gray-400">
          Active employment authorizations by Case Manager
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Total Residents" value={totalResidents} />
        <MetricCard label="With Employment" value={totalEmployed} color="text-green-400" />
        <MetricCard label="Placement Rate" value={`${placementRate}%`} color="text-blue-400" />
        <MetricCard label="Case Managers" value={placements.length} />
      </div>

      {/* Per Case Manager */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Case Manager</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Total Residents</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">With Employment</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Active Authorizations</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Placement Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {placements.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                  No case managers found.
                </td>
              </tr>
            ) : (
              placements.map((cm) => {
                const rate = cm.totalResidents > 0
                  ? Math.round((cm.residentsWithEmployment / cm.totalResidents) * 100)
                  : 0;
                return (
                  <tr key={cm.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-3 text-sm font-medium text-white">{cm.name}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{cm.totalResidents}</td>
                    <td className="px-6 py-3 text-sm text-green-400">{cm.residentsWithEmployment}</td>
                    <td className="px-6 py-3 text-sm text-gray-300">{cm.totalActiveAuths}</td>
                    <td className="px-6 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green-500"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="text-gray-400">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
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
