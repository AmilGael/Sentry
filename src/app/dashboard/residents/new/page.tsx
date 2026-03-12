import Link from "next/link";
import { requireRole } from "@/lib/auth-utils";
import { getCaseManagers, createResident } from "@/lib/actions/residents";
import { ResidentForm } from "@/components/resident-form";

export default async function NewResidentPage() {
  await requireRole("ADMIN", "CASE_MANAGER");
  const caseManagers = await getCaseManagers();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/residents"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Residents
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Add New Resident</h1>
        <p className="mt-1 text-sm text-gray-400">
          New residents are created with INTAKE status.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <ResidentForm
          action={createResident}
          caseManagers={caseManagers}
          submitLabel="Create Resident"
        />
      </div>
    </div>
  );
}
