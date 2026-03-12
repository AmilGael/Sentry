"use client";

import { useActionState } from "react";
import { createIncident, type IncidentFormState } from "@/lib/actions/incidents";
import { FormField } from "@/components/ui/form-field";

type Resident = {
  id: string;
  firstName: string;
  lastName: string;
  inmateNumber: string;
};

export function IncidentForm({ residents }: { residents: Resident[] }) {
  const [state, formAction, isPending] = useActionState<IncidentFormState, FormData>(
    createIncident,
    { error: null, fieldErrors: {} }
  );

  const types = [
    { value: "LATE_RETURN", label: "Late Return" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "AWOL", label: "AWOL" },
    { value: "PASS_TAMPERING", label: "Pass Tampering" },
    { value: "UNAUTHORIZED_ATTEMPT", label: "Unauthorized Attempt" },
    { value: "OTHER", label: "Other" },
  ];

  const severities = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "CRITICAL", label: "Critical" },
  ];

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormField
          label="Resident"
          name="residentId"
          as="select"
          required
          error={state.fieldErrors.residentId}
          options={residents.map((r) => ({
            value: r.id,
            label: `${r.lastName}, ${r.firstName} (${r.inmateNumber})`,
          }))}
        />

        <FormField
          label="Incident Type"
          name="type"
          as="select"
          required
          error={state.fieldErrors.type}
          options={types}
        />

        <FormField
          label="Severity"
          name="severity"
          as="select"
          required
          error={state.fieldErrors.severity}
          options={severities}
        />

        <FormField
          label="Related Pass ID (optional)"
          name="passId"
          placeholder="Leave blank if not pass-related"
        />
      </div>

      <FormField
        label="Description"
        name="description"
        as="textarea"
        required
        error={state.fieldErrors.description}
        placeholder="Describe the incident in detail: what happened, when, where, and any relevant context..."
      />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Submit Incident Report"}
        </button>
      </div>
    </form>
  );
}
