"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export type SettingsFormState = {
  error: string | null;
  success: boolean;
};

export async function getFacilitySettings() {
  await requireRole("ADMIN");

  let config = await prisma.facilityConfiguration.findFirst();
  if (!config) {
    config = await prisma.facilityConfiguration.create({ data: {} });
  }
  return config;
}

export async function updateFacilitySettings(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireRole("ADMIN");

  const id = formData.get("id") as string;
  if (!id) return { error: "Configuration ID is missing.", success: false };

  try {
    await prisma.facilityConfiguration.update({
      where: { id },
      data: {
        facilityName: (formData.get("facilityName") as string) || "Re-Entry Facility",
        overdueThresholdMinutes: parseInt(formData.get("overdueThresholdMinutes") as string) || 15,
        awolThresholdMinutes: parseInt(formData.get("awolThresholdMinutes") as string) || 120,
        passGenerationTime: (formData.get("passGenerationTime") as string) || "22:00",
        maximumHoursOut: parseInt(formData.get("maximumHoursOut") as string) || 14,
        earlyDepartureWindowMin: parseInt(formData.get("earlyDepartureWindowMin") as string) || 15,
        qrCodeExpiryHours: parseInt(formData.get("qrCodeExpiryHours") as string) || 24,
        audioAlertsEnabled: formData.get("audioAlertsEnabled") === "true",
        selfApprovalEnabled: formData.get("selfApprovalEnabled") === "true",
        timezone: (formData.get("timezone") as string) || "America/New_York",
      },
    });
  } catch {
    return { error: "Failed to update settings.", success: false };
  }

  revalidatePath("/dashboard/settings");
  return { error: null, success: true };
}
