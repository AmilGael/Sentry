import Link from "next/link";
import { notFound } from "next/navigation";
import { getIncident } from "@/lib/actions/incidents";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { IncidentActions } from "@/components/incident-actions";

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "text-gray-300 bg-gray-800 border-gray-700",
  MEDIUM: "text-yellow-300 bg-yellow-950 border-yellow-800",
  HIGH: "text-orange-300 bg-orange-950 border-orange-800",
  CRITICAL: "text-red-300 bg-red-950 border-red-800",
};

export default async function IncidentDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSession();
  const incident = await getIncident(id);
  if (!incident) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/incidents"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Incidents
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{incident.incidentDisplayId}</h1>
            <p className="mt-1 text-sm text-gray-400">
              {incident.type.replace(/_/g, " ")} ·{" "}
              {incident.resident.firstName} {incident.resident.lastName}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${
                SEVERITY_COLORS[incident.severity] ?? SEVERITY_COLORS.LOW
              }`}
            >
              {incident.severity}
            </span>
            <StatusBadge status={incident.status} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <IncidentActions
        incidentId={id}
        status={incident.status}
        userRole={session.user.role}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Description */}
        <section className="lg:col-span-2 rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">Description</h2>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {incident.description}
          </p>
        </section>

        {/* Incident Details */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Details</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Type" value={incident.type.replace(/_/g, " ")} />
            <Detail label="Severity" value={incident.severity} />
            <Detail label="Reported By" value={incident.createdBy.name} />
            <Detail label="Date" value={incident.createdAt.toLocaleString()} />
          </dl>
        </section>

        {/* Resident */}
        <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Resident</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <Detail
              label="Name"
              value={`${incident.resident.firstName} ${incident.resident.lastName}`}
            />
            <Detail label="Inmate #" value={incident.resident.inmateNumber} />
            <Detail label="Status" value={incident.resident.status.replace(/_/g, " ")} />
          </dl>
          <Link
            href={`/dashboard/residents/${incident.resident.id}`}
            className="inline-block text-sm text-gray-400 hover:text-white transition-colors"
          >
            View profile →
          </Link>
        </section>

        {/* Related Pass */}
        {incident.pass && (
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Related Pass</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Pass ID" value={incident.pass.passDisplayId} />
              <Detail label="Employer" value={incident.pass.employerName} />
              <Detail label="Date" value={incident.pass.date.toLocaleDateString()} />
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="mt-0.5"><StatusBadge status={incident.pass.status} /></dd>
              </div>
            </dl>
            <Link
              href={`/dashboard/passes/${incident.pass.id}`}
              className="inline-block text-sm text-gray-400 hover:text-white transition-colors"
            >
              View pass →
            </Link>
          </section>
        )}

        {/* Resolution */}
        {incident.resolvedAt && (
          <section className="rounded-lg border border-green-800 bg-green-950/20 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-green-300">Resolution</h2>
            <dl className="text-sm space-y-3">
              <div>
                <dt className="text-gray-500">Resolved By</dt>
                <dd className="mt-0.5 text-gray-200">{incident.resolvedBy?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Resolved At</dt>
                <dd className="mt-0.5 text-gray-200">{incident.resolvedAt.toLocaleString()}</dd>
              </div>
              {incident.resolutionNotes && (
                <div>
                  <dt className="text-gray-500">Resolution Notes</dt>
                  <dd className="mt-0.5 text-gray-300 whitespace-pre-wrap">
                    {incident.resolutionNotes}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}
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
