import Link from "next/link";
import { requireRole } from "@/lib/auth-utils";
import { getResidentsForIncident } from "@/lib/actions/incidents";
import { IncidentForm } from "@/components/incident-form";

export default async function NewIncidentPage() {
  await requireRole("ADMIN", "CASE_MANAGER", "FRONT_DESK");
  const residents = await getResidentsForIncident();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/incidents"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Incidents
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Report Incident</h1>
        <p className="mt-1 text-sm text-gray-400">
          Create a new incident report for a resident.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <IncidentForm residents={residents} />
      </div>
    </div>
  );
}
