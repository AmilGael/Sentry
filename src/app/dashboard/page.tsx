import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/reports";
import { getRoleDisplayName } from "@/lib/auth-utils";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const roleLabel = getRoleDisplayName(stats.role);

  const isFrontDesk = stats.role === "FRONT_DESK";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {stats.userName}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Signed in as {roleLabel}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active Residents" value={stats.activeResidents} />
        <StatCard
          label="Currently Out"
          value={stats.currentlyOut}
          color="text-yellow-400"
          href={isFrontDesk ? "/dashboard/front-desk" : undefined}
        />
        <StatCard
          label="Overdue"
          value={stats.overdueCount}
          color={stats.overdueCount > 0 ? "text-red-400" : "text-gray-500"}
          href={isFrontDesk ? "/dashboard/front-desk" : undefined}
        />
        <StatCard
          label="Pending Reviews"
          value={stats.pendingAuths}
          color={stats.pendingAuths > 0 ? "text-blue-400" : "text-gray-500"}
          href="/dashboard/authorizations?status=PENDING"
        />
        <StatCard label="Today's Passes" value={stats.todaysPasses} href="/dashboard/passes" />
        <StatCard label="Today's Movements" value={stats.todaysMovements} />
        <StatCard
          label="Open Incidents"
          value={stats.openIncidents}
          color={stats.openIncidents > 0 ? "text-orange-400" : "text-gray-500"}
          href="/dashboard/incidents?status=OPEN"
        />
        <StatCard label="Total Residents" value={stats.totalResidents} href="/dashboard/residents" />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.overdueCount > 0 && (
          <AlertCard
            title="Overdue Returns"
            message={`${stats.overdueCount} resident${stats.overdueCount !== 1 ? "s" : ""} past scheduled return time`}
            href={isFrontDesk ? "/dashboard/front-desk" : "/dashboard/reports/movements"}
            color="border-red-800 bg-red-950/20"
            textColor="text-red-300"
          />
        )}
        {stats.pendingAuths > 0 && (
          <AlertCard
            title="Pending Authorizations"
            message={`${stats.pendingAuths} authorization${stats.pendingAuths !== 1 ? "s" : ""} awaiting review`}
            href="/dashboard/authorizations?status=PENDING"
            color="border-blue-800 bg-blue-950/20"
            textColor="text-blue-300"
          />
        )}
        {stats.openIncidents > 0 && (
          <AlertCard
            title="Open Incidents"
            message={`${stats.openIncidents} incident${stats.openIncidents !== 1 ? "s" : ""} require attention`}
            href="/dashboard/incidents?status=OPEN"
            color="border-orange-800 bg-orange-950/20"
            textColor="text-orange-300"
          />
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "text-white",
  href,
}: {
  label: string;
  value: number;
  color?: string;
  href?: string;
}) {
  const content = (
    <div className={`rounded-lg border border-gray-800 bg-gray-950 p-4 ${href ? "hover:border-gray-600 transition-colors" : ""}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function AlertCard({
  title,
  message,
  href,
  color,
  textColor,
}: {
  title: string;
  message: string;
  href: string;
  color: string;
  textColor: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border p-4 ${color} hover:opacity-90 transition-opacity`}
    >
      <h3 className={`text-sm font-semibold ${textColor}`}>{title}</h3>
      <p className="mt-1 text-xs text-gray-400">{message}</p>
    </Link>
  );
}
