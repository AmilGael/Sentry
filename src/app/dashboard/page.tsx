import { getSession } from "@/lib/auth-utils";
import { getRoleDisplayName } from "@/lib/auth-utils";

export default async function DashboardPage() {
  const session = await getSession();
  const role = session.user.role;
  const roleLabel = getRoleDisplayName(role);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Signed in as {roleLabel}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Residents" value="—" />
        <StatCard label="Currently Out" value="—" />
        <StatCard label="Overdue" value="—" alert />
        <StatCard label="Pending Authorizations" value="—" />
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <h2 className="text-lg font-semibold text-white">Phase 2 Complete</h2>
        <p className="mt-2 text-sm text-gray-400">
          Authentication and role-based access control are active. Dashboard
          statistics and module pages will be built in subsequent phases.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950 p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p
        className={`mt-1 text-3xl font-bold ${alert ? "text-red-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
