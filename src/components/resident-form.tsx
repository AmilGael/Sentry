"use client";

import { useActionState } from "react";
import { FormField } from "@/components/ui/form-field";
import type { ResidentFormState } from "@/lib/actions/residents";

type CaseManager = { id: string; name: string };

type ResidentData = {
  inmateNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  intakeDate: string;
  expectedReleaseDate: string;
  caseManagerId: string;
  roomAssignment: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  conditions: string;
  notes: string;
};

export function ResidentForm({
  action,
  caseManagers,
  defaults,
  submitLabel,
}: {
  action: (prev: ResidentFormState, formData: FormData) => Promise<ResidentFormState>;
  caseManagers: CaseManager[];
  defaults?: Partial<ResidentData>;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    fieldErrors: {},
  });

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormField
          label="Inmate Number"
          name="inmateNumber"
          required
          defaultValue={defaults?.inmateNumber}
          placeholder="DOC-2024-XXXXX"
          error={state.fieldErrors.inmateNumber}
        />
        <FormField
          label="Room / Bed Assignment"
          name="roomAssignment"
          defaultValue={defaults?.roomAssignment}
          placeholder="B-204"
          error={state.fieldErrors.roomAssignment}
        />
        <FormField
          label="First Name"
          name="firstName"
          required
          defaultValue={defaults?.firstName}
          error={state.fieldErrors.firstName}
        />
        <FormField
          label="Last Name"
          name="lastName"
          required
          defaultValue={defaults?.lastName}
          error={state.fieldErrors.lastName}
        />
        <FormField
          label="Date of Birth"
          name="dateOfBirth"
          type="date"
          required
          defaultValue={defaults?.dateOfBirth}
          error={state.fieldErrors.dateOfBirth}
        />
        <FormField
          label="Assigned Case Manager"
          name="caseManagerId"
          as="select"
          required
          defaultValue={defaults?.caseManagerId}
          options={caseManagers.map((cm) => ({ value: cm.id, label: cm.name }))}
          error={state.fieldErrors.caseManagerId}
        />
        <FormField
          label="Intake Date"
          name="intakeDate"
          type="date"
          required
          defaultValue={defaults?.intakeDate}
          error={state.fieldErrors.intakeDate}
        />
        <FormField
          label="Expected Release Date"
          name="expectedReleaseDate"
          type="date"
          required
          defaultValue={defaults?.expectedReleaseDate}
          error={state.fieldErrors.expectedReleaseDate}
        />
        <FormField
          label="Emergency Contact Name"
          name="emergencyContactName"
          required
          defaultValue={defaults?.emergencyContactName}
          error={state.fieldErrors.emergencyContactName}
        />
        <FormField
          label="Emergency Contact Phone"
          name="emergencyContactPhone"
          type="tel"
          required
          defaultValue={defaults?.emergencyContactPhone}
          placeholder="(555) 123-4567"
          error={state.fieldErrors.emergencyContactPhone}
        />
      </div>

      <FormField
        label="Conditions / Restrictions"
        name="conditions"
        as="textarea"
        defaultValue={defaults?.conditions}
        placeholder="e.g., No travel beyond 10 miles of facility."
        error={state.fieldErrors.conditions}
      />

      <FormField
        label="Notes"
        name="notes"
        as="textarea"
        defaultValue={defaults?.notes}
        placeholder="Internal notes..."
        error={state.fieldErrors.notes}
      />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-gray-950 hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
