import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-utils";
import { getResident, getCaseManagers, updateResident } from "@/lib/actions/residents";
import { ResidentForm } from "@/components/resident-form";

export default async function EditResidentPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN", "CASE_MANAGER", "FRONT_DESK");
  const { id } = await props.params;

  const [resident, caseManagers] = await Promise.all([
    getResident(id),
    getCaseManagers(),
  ]);

  if (!resident) notFound();

  const updateAction = updateResident.bind(null, id);

  const defaults = {
    inmateNumber: resident.inmateNumber,
    firstName: resident.firstName,
    lastName: resident.lastName,
    dateOfBirth: resident.dateOfBirth.toISOString().split("T")[0],
    intakeDate: resident.intakeDate.toISOString().split("T")[0],
    expectedReleaseDate: resident.expectedReleaseDate.toISOString().split("T")[0],
    caseManagerId: resident.caseManagerId,
    roomAssignment: resident.roomAssignment ?? "",
    emergencyContactName: resident.emergencyContactName,
    emergencyContactPhone: resident.emergencyContactPhone,
    conditions: resident.conditions ?? "",
    notes: resident.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/dashboard/residents/${id}`}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to {resident.firstName} {resident.lastName}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit Resident</h1>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <ResidentForm
          action={updateAction}
          caseManagers={caseManagers}
          defaults={defaults}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
