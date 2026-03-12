import { requireRole } from "@/lib/auth-utils";
import { getFacilitySettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  await requireRole("ADMIN");
  const config = await getFacilitySettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Facility Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure facility-wide parameters and thresholds.
        </p>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <SettingsForm config={config} />
      </div>
    </div>
  );
}
