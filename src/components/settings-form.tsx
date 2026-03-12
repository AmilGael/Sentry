"use client";

import { useActionState } from "react";
import { updateFacilitySettings, type SettingsFormState } from "@/lib/actions/settings";
import { FormField } from "@/components/ui/form-field";

type Config = {
  id: string;
  facilityName: string;
  overdueThresholdMinutes: number;
  awolThresholdMinutes: number;
  passGenerationTime: string;
  maximumHoursOut: number;
  earlyDepartureWindowMin: number;
  qrCodeExpiryHours: number;
  audioAlertsEnabled: boolean;
  selfApprovalEnabled: boolean;
  timezone: string;
};

export function SettingsForm({ config }: { config: Config }) {
  const [state, formAction, isPending] = useActionState<SettingsFormState, FormData>(
    updateFacilitySettings,
    { error: null, success: false }
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="id" value={config.id} />

      {state.error && (
        <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-300">{state.error}</p>
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-green-800 bg-green-950/30 px-4 py-3">
          <p className="text-sm text-green-300">Settings saved successfully.</p>
        </div>
      )}

      {/* General */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">General</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <FormField
            label="Facility Name"
            name="facilityName"
            defaultValue={config.facilityName}
            required
          />
          <FormField
            label="Timezone"
            name="timezone"
            type="select"
            defaultValue={config.timezone}
            options={[
              { value: "America/New_York", label: "Eastern (America/New_York)" },
              { value: "America/Chicago", label: "Central (America/Chicago)" },
              { value: "America/Denver", label: "Mountain (America/Denver)" },
              { value: "America/Los_Angeles", label: "Pacific (America/Los_Angeles)" },
            ]}
          />
        </div>
      </section>

      {/* Thresholds */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Thresholds</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField
            label="Overdue Threshold (minutes)"
            name="overdueThresholdMinutes"
            type="number"
            defaultValue={String(config.overdueThresholdMinutes)}
            placeholder="15"
          />
          <FormField
            label="AWOL Threshold (minutes)"
            name="awolThresholdMinutes"
            type="number"
            defaultValue={String(config.awolThresholdMinutes)}
            placeholder="120"
          />
          <FormField
            label="Maximum Hours Out"
            name="maximumHoursOut"
            type="number"
            defaultValue={String(config.maximumHoursOut)}
            placeholder="14"
          />
        </div>
      </section>

      {/* Pass Settings */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Pass Settings</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FormField
            label="Daily Pass Generation Time"
            name="passGenerationTime"
            type="time"
            defaultValue={config.passGenerationTime}
          />
          <FormField
            label="Early Departure Window (minutes)"
            name="earlyDepartureWindowMin"
            type="number"
            defaultValue={String(config.earlyDepartureWindowMin)}
            placeholder="15"
          />
          <FormField
            label="QR Code Link Expiry (hours)"
            name="qrCodeExpiryHours"
            type="number"
            defaultValue={String(config.qrCodeExpiryHours)}
            placeholder="24"
          />
        </div>
      </section>

      {/* Toggles */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-gray-800 pb-2">Feature Toggles</h2>
        <div className="space-y-3">
          <Toggle
            name="audioAlertsEnabled"
            label="Audio Alerts for Overdue Returns"
            description="Play an audio alert when a resident becomes overdue"
            defaultChecked={config.audioAlertsEnabled}
          />
          <Toggle
            name="selfApprovalEnabled"
            label="CM Self-Approval"
            description="Allow Case Managers to emergency self-approve authorizations"
            defaultChecked={config.selfApprovalEnabled}
          />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Save Settings"}
      </button>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-colors">
      <input
        type="hidden"
        name={name}
        value="false"
      />
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-900 text-white focus:ring-white focus:ring-offset-gray-950"
      />
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
    </label>
  );
}
