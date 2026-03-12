import Link from "next/link";
import { getAuthorizations } from "@/lib/actions/authorizations";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import type { AuthorizationStatus } from "@/generated/prisma/client";

export default async function AuthorizationsPage(props: {
  searchParams: Promise<{ status?: AuthorizationStatus }>;
}) {
  const session = await getSession();
  const searchParams = await props.searchParams;

  const isES = session.user.role === "EMPLOYMENT_SPECIALIST";
  const isCM = session.user.role === "CASE_MANAGER";

  const authorizations = await getAuthorizations({
    status: searchParams.status,
    requestedById: isCM ? session.user.id : undefined,
  });

  const statuses: AuthorizationStatus[] = [
    "PENDING", "UNDER_REVIEW", "APPROVED", "CM_SELF_APPROVED",
    "ES_RATIFIED", "ACTIVE", "DENIED", "REVOKED", "EXPIRED",
  ];

  const pendingReview = authorizations.filter(
    (a) => a.status === "PENDING" || a.status === "CM_SELF_APPROVED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isES ? "Review Queue" : "Authorizations"}
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {authorizations.length} authorization{authorizations.length !== 1 ? "s" : ""}
            {pendingReview > 0 && (
              <span className="ml-2 text-yellow-400">
                ({pendingReview} awaiting review)
              </span>
            )}
          </p>
        </div>
        {(isCM || session.user.role === "ADMIN") && (
          <Link
            href="/dashboard/authorizations/new"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-200 transition-colors"
          >
            + New Authorization
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
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
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
                Employer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Job Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                Requested By
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {authorizations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  No authorizations found.
                </td>
              </tr>
            ) : (
              authorizations.map((auth) => (
                <tr key={auth.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/dashboard/authorizations/${auth.id}`}
                      className="text-sm font-medium text-white hover:underline"
                    >
                      {auth.resident.lastName}, {auth.resident.firstName}
                    </Link>
                    <p className="text-xs text-gray-500">{auth.resident.inmateNumber}</p>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                    {auth.employerName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {auth.jobTitle}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={auth.employmentType} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={auth.status} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                    {auth.requestedBy.name}
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
