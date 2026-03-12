import Link from "next/link";
import { requireRole } from "@/lib/auth-utils";
import { getDashboardStats } from "@/lib/actions/reports";

const REPORTS = [
  {
    title: "Daily Movement Log",
    description: "All check-ins and check-outs for a given date",
    href: "/dashboard/reports/movements",
    roles: ["ADMIN", "FRONT_DESK"],
  },
  {
    title: "Pass Utilization",
    description: "Passes generated vs. used vs. cancelled by date range",
    href: "/dashboard/reports/passes",
    roles: ["ADMIN"],
  },
  {
    title: "Employment Placements",
    description: "Residents with approved employment, by Case Manager",
    href: "/dashboard/reports/placements",
    roles: ["ADMIN"],
  },
  {
    title: "Incident Summary",
    description: "Incidents by type, severity, and resolution status",
    href: "/dashboard/reports/incidents",
    roles: ["ADMIN"],
  },
];

export default async function ReportsPage() {
  const stats = await getDashboardStats();
  const role = stats.role;

  const available = REPORTS.filter((r) => r.roles.includes(role));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Facility overview and downloadable reports
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Residents" value={stats.activeResidents} />
        <StatCard label="Currently Out" value={stats.currentlyOut} color="text-yellow-400" />
        <StatCard
          label="Overdue"
          value={stats.overdueCount}
          color={stats.overdueCount > 0 ? "text-red-400" : "text-gray-500"}
        />
        <StatCard
          label="Open Incidents"
          value={stats.openIncidents}
          color={stats.openIncidents > 0 ? "text-orange-400" : "text-gray-500"}
        />
        <StatCard label="Today's Passes" value={stats.todaysPasses} />
        <StatCard label="Today's Movements" value={stats.todaysMovements} />
        <StatCard label="Pending Reviews" value={stats.pendingAuths} color="text-blue-400" />
        <StatCard label="Total Residents" value={stats.totalResidents} />
      </div>

      {/* Report Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {available.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="group rounded-lg border border-gray-800 bg-gray-950 p-6 hover:border-gray-600 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white group-hover:text-gray-200">
              {report.title}
            </h3>
            <p className="mt-1 text-sm text-gray-400">{report.description}</p>
            <span className="mt-3 inline-block text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
              View report →
            </span>
          </Link>
        ))}
      </div>

      {available.length === 0 && (
        <div className="rounded-lg border border-gray-800 bg-gray-950 px-6 py-12 text-center">
          <p className="text-gray-500">No reports available for your role.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
