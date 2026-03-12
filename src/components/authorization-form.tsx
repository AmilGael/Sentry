"use client";

import { useActionState, useState } from "react";
import { FormField } from "@/components/ui/form-field";
import type { AuthFormState } from "@/lib/actions/authorizations";

type Resident = { id: string; firstName: string; lastName: string; inmateNumber: string };

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed",
  THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

export function AuthorizationForm({
  action,
  residents,
  isSelfApprove,
}: {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  residents: Resident[];
  isSelfApprove: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
    fieldErrors: {},
  });
  const [scheduleType, setScheduleType] = useState("RECURRING");

  return (
    <form action={formAction} className="space-y-8">
      {state.error && (
        <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      {isSelfApprove && (
        <div className="rounded-lg border border-orange-800 bg-orange-950/30 px-4 py-3 text-sm text-orange-300">
          Self-Approve (Emergency): This authorization will be immediately active.
          The Employment Specialist will be notified to review and ratify.
        </div>
      )}

      {/* Resident Selection */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Resident</h3>
        <FormField
          label="Resident"
          name="residentId"
          as="select"
          required
          options={residents.map((r) => ({
            value: r.id,
            label: `${r.lastName}, ${r.firstName} (${r.inmateNumber})`,
          }))}
          error={state.fieldErrors.residentId}
        />
      </section>

      {/* Employer Details */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Employer</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Employer Name" name="employerName" required error={state.fieldErrors.employerName} />
          <FormField label="Employer Phone" name="employerPhone" type="tel" required error={state.fieldErrors.employerPhone} />
          <FormField label="Employer Address" name="employerAddress" required error={state.fieldErrors.employerAddress} />
          <FormField label="Contact Person" name="employerContact" required error={state.fieldErrors.employerContact} />
          <FormField label="Job Title / Position" name="jobTitle" required error={state.fieldErrors.jobTitle} />
          <FormField label="Pay Rate" name="payRate" placeholder="$16.50/hr" error={state.fieldErrors.payRate} />
          <FormField
            label="Employment Type"
            name="employmentType"
            as="select"
            required
            options={[
              { value: "FULL_TIME", label: "Full-Time" },
              { value: "PART_TIME", label: "Part-Time" },
              { value: "TEMPORARY", label: "Temporary" },
              { value: "DAY_LABOR", label: "Day Labor" },
            ]}
            error={state.fieldErrors.employmentType}
          />
        </div>
      </section>

      {/* Schedule */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Schedule</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300">Schedule Type <span className="text-red-400">*</span></label>
            <select
              name="scheduleType"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
            >
              <option value="RECURRING">Recurring</option>
              <option value="ONE_TIME">One-Time</option>
            </select>
          </div>
          <FormField label="Travel Buffer (minutes)" name="travelBufferMin" type="number" defaultValue="30" />
          <FormField label="Start Date" name="scheduleStartDate" type="date" required error={state.fieldErrors.scheduleStartDate} />
          <FormField label="End Date" name="scheduleEndDate" type="date" placeholder="Leave blank for ongoing" />
          <FormField label="Departure Time" name="departureTime" type="time" required error={state.fieldErrors.departureTime} />
          <FormField label="Return Time" name="returnTime" type="time" required error={state.fieldErrors.returnTime} />
        </div>

        {scheduleType === "RECURRING" && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Days of Week <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-300 cursor-pointer hover:border-gray-500 has-[:checked]:border-white has-[:checked]:text-white transition-colors"
                >
                  <input type="checkbox" name="scheduleDays" value={day} className="accent-white" />
                  {DAY_SHORT[day]}
                </label>
              ))}
            </div>
            {state.fieldErrors.scheduleDays && (
              <p className="mt-1 text-xs text-red-400">{state.fieldErrors.scheduleDays}</p>
            )}
          </div>
        )}
      </section>

      {/* Transportation */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Transportation</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Method"
            name="transportationMethod"
            as="select"
            required
            options={[
              { value: "PUBLIC_TRANSIT", label: "Public Transit" },
              { value: "PERSONAL_VEHICLE", label: "Personal Vehicle" },
              { value: "EMPLOYER_TRANSPORT", label: "Employer Transport" },
              { value: "WALKING", label: "Walking" },
              { value: "OTHER", label: "Other" },
            ]}
            error={state.fieldErrors.transportationMethod}
          />
          <FormField label="Details" name="transportationDetails" placeholder="Bus route, pickup location, etc." />
        </div>
      </section>

      {/* Notes */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Additional Info</h3>
        <FormField label="Case Manager Notes" name="caseManagerNotes" as="textarea" placeholder="Context for the Employment Specialist..." />
        <FormField label="Supporting Documents" name="supportingDocuments" as="textarea" placeholder="Describe attached documents or reference numbers..." />
      </section>

      {/* Self-Approval Justification */}
      {isSelfApprove && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-orange-400">Emergency Justification</h3>
          <FormField
            label="Why is self-approval necessary?"
            name="selfApprovalJustification"
            as="textarea"
            required
            placeholder="e.g., Employment Specialist unavailable, employer requires immediate start..."
            error={state.fieldErrors.selfApprovalJustification}
          />
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-50 transition-colors ${
            isSelfApprove
              ? "bg-orange-600 text-white hover:bg-orange-500"
              : "bg-white text-gray-950 hover:bg-gray-200"
          }`}
        >
          {isPending
            ? "Submitting..."
            : isSelfApprove
              ? "Self-Approve & Submit"
              : "Submit for Review"}
        </button>
      </div>
    </form>
  );
}
