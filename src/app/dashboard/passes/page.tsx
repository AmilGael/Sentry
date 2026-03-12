import Link from "next/link";
import { getPasses } from "@/lib/actions/passes";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PassStatus } from "@/generated/prisma/client";

export default async function PassesPage(props: {
  searchParams: Promise<{ status?: PassStatus; date?: string }>;
}) {
  await getSession();
  const searchParams = await props.searchParams;

  const today = new Date().toISOString().slice(0, 10);

  const passes = await getPasses({
    status: searchParams.status,
    date: searchParams.date,
  });

  const statuses: PassStatus[] = ["ACTIVE", "USED", "COMPLETED", "EXPIRED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Movement Passes</h1>
        <p className="mt-1 text-sm text-gray-400">
          {passes.length} pass{passes.length !== 1 ? "es" : ""} found
        </p>
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          name="date"
          type="date"
          defaultValue={searchParams.date ?? today}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        />
        <select
          name="status"
          defaultValue={searchParams.status}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
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

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Pass ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Resident</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Employer</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Departure</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Return</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {passes.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No passes found.
                </td>
              </tr>
            ) : (
              passes.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/dashboard/passes/${p.id}`}
                      className="text-sm font-medium text-white hover:underline"
                    >
                      {p.passDisplayId}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {p.residentFullName}
                    <span className="ml-2 text-xs text-gray-500">{p.residentInmateNumber}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {p.employerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {p.date.toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {p.scheduledDeparture.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {p.scheduledReturn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={p.status} />
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
