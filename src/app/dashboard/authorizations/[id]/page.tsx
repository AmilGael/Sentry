import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthorization } from "@/lib/actions/authorizations";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { AuthorizationActions } from "@/components/authorization-actions";

const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

export default async function AuthorizationDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSession();
  const auth = await getAuthorization(id);
  if (!auth) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/authorizations"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Authorizations
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {auth.resident.firstName} {auth.resident.lastName} — {auth.employerName}
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {auth.jobTitle} · {auth.resident.inmateNumber}
            </p>
          </div>
          <StatusBadge status={auth.status} />
        </div>
      </div>

      {/* Self-Approval Banner */}
      {auth.selfApprovedByCM && (
        <div className="rounded-lg border border-orange-800 bg-orange-950/30 px-4 py-3 space-y-1">
          <p className="text-sm font-medium text-orange-300">
            CM Self-Approved — {auth.status === "CM_SELF_APPROVED" ? "Pending ES Review" : "Ratified"}
          </p>
          <p className="text-sm text-orange-400/80">
            <span className="font-medium">Justification:</span> {auth.selfApprovalJustification}
          </p>
          <p className="text-xs text-orange-400/60">
            Self-approved by {auth.requestedBy.name} on{" "}
            {auth.selfApprovalTimestamp?.toLocaleString()}
          </p>
          {auth.esRatifiedBy && (
            <p className="text-xs text-green-400">
              Ratified by {auth.esRatifiedBy.name} on {auth.esRatifiedAt?.toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <AuthorizationActions
        authId={id}
        status={auth.status}
        userRole={session.user.role}
      />

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Employer Info */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Employer Details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Employer Name" value={auth.employerName} />
            <Detail label="Contact Person" value={auth.employerContact} />
            <Detail label="Address" value={auth.employerAddress} />
            <Detail label="Phone" value={auth.employerPhone} />
            <Detail label="Job Title" value={auth.jobTitle} />
            <Detail label="Pay Rate" value={auth.payRate ?? "—"} />
            <Detail label="Employment Type" value={auth.employmentType.replace(/_/g, " ")} />
          </dl>
        </section>

        {/* Schedule */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Schedule</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Type" value={auth.scheduleType === "RECURRING" ? "Recurring" : "One-Time"} />
            <Detail label="Start Date" value={auth.scheduleStartDate.toLocaleDateString()} />
            <Detail label="End Date" value={auth.scheduleEndDate?.toLocaleDateString() ?? "Ongoing"} />
            <Detail label="Departure" value={auth.departureTime} />
            <Detail label="Return" value={auth.returnTime} />
            <Detail label="Travel Buffer" value={`${auth.travelBufferMin} min`} />
            {auth.scheduleType === "RECURRING" && (
              <div className="col-span-2">
                <dt className="text-gray-500">Days</dt>
                <dd className="mt-0.5 flex flex-wrap gap-1">
                  {auth.scheduleDays.map((d) => (
                    <span key={d} className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300">
                      {DAY_SHORT[d] ?? d}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* Transportation */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Transportation</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Method" value={auth.transportationMethod.replace(/_/g, " ")} />
            <Detail label="Details" value={auth.transportationDetails ?? "—"} />
          </dl>
        </section>

        {/* Review Info */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Review Info</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Requested By" value={auth.requestedBy.name} />
            <Detail label="Reviewed By" value={auth.reviewedBy?.name ?? "—"} />
            <Detail label="Created" value={auth.createdAt.toLocaleString()} />
            {auth.denialReason && (
              <div className="col-span-2">
                <dt className="text-gray-500">Denial / Revocation Reason</dt>
                <dd className="mt-0.5 text-red-300">{auth.denialReason}</dd>
              </div>
            )}
          </dl>
          {auth.caseManagerNotes && (
            <>
              <h3 className="text-sm font-medium text-gray-300 pt-2">Case Manager Notes</h3>
              <p className="text-sm text-gray-400">{auth.caseManagerNotes}</p>
            </>
          )}
        </section>

        {/* Resident Info */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Resident</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Name" value={`${auth.resident.firstName} ${auth.resident.lastName}`} />
            <Detail label="Inmate #" value={auth.resident.inmateNumber} />
            <Detail label="Status" value={auth.resident.status.replace(/_/g, " ")} />
          </dl>
          {auth.resident.conditions && (
            <>
              <h3 className="text-sm font-medium text-gray-300 pt-2">Conditions / Restrictions</h3>
              <p className="text-sm text-yellow-400">{auth.resident.conditions}</p>
            </>
          )}
          <Link
            href={`/dashboard/residents/${auth.resident.id}`}
            className="inline-block text-sm text-gray-400 hover:text-white transition-colors pt-2"
          >
            View full profile →
          </Link>
        </section>

        {/* Generated Passes */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Generated Passes</h2>
          {auth.passes.length === 0 ? (
            <p className="text-sm text-gray-500">No passes generated yet.</p>
          ) : (
            <div className="space-y-2">
              {auth.passes.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2">
                  <span className="text-sm text-gray-300">{p.passDisplayId}</span>
                  <span className="text-xs text-gray-400">{p.date.toLocaleDateString()}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
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
