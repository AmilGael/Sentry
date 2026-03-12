import Link from "next/link";
import { getResidents, getCaseManagers } from "@/lib/actions/residents";
import { requireRole } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { ResidentStatus } from "@/generated/prisma/client";

export default async function ResidentsPage(props: {
  searchParams: Promise<{
    search?: string;
    status?: ResidentStatus;
    cm?: string;
    sort?: string;
    order?: "asc" | "desc";
  }>;
}) {
  await requireRole("ADMIN", "CASE_MANAGER", "FRONT_DESK");
  const searchParams = await props.searchParams;

  const [residents, caseManagers] = await Promise.all([
    getResidents({
      search: searchParams.search,
      status: searchParams.status,
      caseManagerId: searchParams.cm,
      sortBy: searchParams.sort,
      sortOrder: searchParams.order,
    }),
    getCaseManagers(),
  ]);

  const statuses: ResidentStatus[] = [
    "INTAKE",
    "IN_FACILITY",
    "AUTHORIZED_OUT",
    "OVERDUE",
    "AWOL",
    "RELEASED",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Residents</h1>
          <p className="mt-1 text-sm text-gray-400">
            {residents.length} resident{residents.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link
          href="/dashboard/residents/new"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-200 transition-colors"
        >
          + Add Resident
        </Link>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <input
          name="search"
          type="text"
          defaultValue={searchParams.search}
          placeholder="Search name or inmate #..."
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white w-64"
        />
        <select
          name="status"
          defaultValue={searchParams.status}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          name="cm"
          defaultValue={searchParams.cm}
          className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
        >
          <option value="">All Case Managers</option>
          {caseManagers.map((cm) => (
            <option key={cm.id} value={cm.id}>
              {cm.name}
            </option>
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Resident
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Inmate #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Case Manager
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Room
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Release Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {residents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No residents found.
                </td>
              </tr>
            ) : (
              residents.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-gray-800/50 transition-colors"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/dashboard/residents/${r.id}`}
                      className="text-sm font-medium text-white hover:underline"
                    >
                      {r.lastName}, {r.firstName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {r.inmateNumber}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {r.caseManager.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {r.roomAssignment ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {r.expectedReleaseDate.toLocaleDateString()}
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
