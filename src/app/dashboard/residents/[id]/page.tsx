import Link from "next/link";
import { notFound } from "next/navigation";
import { getResident } from "@/lib/actions/residents";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { StatusActions } from "@/components/status-actions";

export default async function ResidentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSession();
  const resident = await getResident(id);
  if (!resident) notFound();

  const canEdit = session.user.role === "ADMIN" || session.user.role === "CASE_MANAGER";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/residents"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Residents
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {resident.firstName} {resident.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {resident.inmateNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={resident.status} />
            {canEdit && (
              <Link
                href={`/dashboard/residents/${id}/edit`}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                Edit
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <StatusActions
        residentId={id}
        currentStatus={resident.status}
        userRole={session.user.role}
      />

      {/* Profile Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Profile</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Date of Birth" value={resident.dateOfBirth.toLocaleDateString()} />
            <Detail label="Room / Bed" value={resident.roomAssignment ?? "—"} />
            <Detail label="Intake Date" value={resident.intakeDate.toLocaleDateString()} />
            <Detail label="Expected Release" value={resident.expectedReleaseDate.toLocaleDateString()} />
            <Detail label="Case Manager" value={resident.caseManager.name} />
            <Detail label="Status" value={resident.status.replace(/_/g, " ")} />
          </dl>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Emergency Contact</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Name" value={resident.emergencyContactName} />
            <Detail label="Phone" value={resident.emergencyContactPhone} />
          </dl>

          {resident.conditions && (
            <>
              <h3 className="text-sm font-medium text-gray-300 pt-2">
                Conditions / Restrictions
              </h3>
              <p className="text-sm text-gray-400">{resident.conditions}</p>
            </>
          )}

          {resident.notes && (
            <>
              <h3 className="text-sm font-medium text-gray-300 pt-2">Notes</h3>
              <p className="text-sm text-gray-400">{resident.notes}</p>
            </>
          )}
        </section>
      </div>

      {/* Recent Authorizations */}
      <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Recent Authorizations
        </h2>
        {resident.authorizations.length === 0 ? (
          <p className="text-sm text-gray-500">No authorizations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Employer
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Job Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Requested By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {resident.authorizations.map((auth) => (
                  <tr key={auth.id}>
                    <td className="px-4 py-2 text-gray-300">
                      {auth.employerName}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {auth.jobTitle}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={auth.status} />
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {auth.requestedBy.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Movement Log */}
      <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">
          Recent Movement Log
        </h2>
        {resident.movementLogs.length === 0 ? (
          <p className="text-sm text-gray-500">No movement history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Direction
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Pass
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-400">
                    Recorded By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {resident.movementLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2">
                      <span
                        className={
                          log.direction === "OUT"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }
                      >
                        {log.direction === "OUT" ? "↑ OUT" : "↓ IN"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-300">
                      {log.timestamp.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {log.pass.passDisplayId} — {log.pass.employerName}
                    </td>
                    <td className="px-4 py-2 text-gray-400">
                      {log.recordedBy.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-200">{value}</dd>
    </div>
  );
}
