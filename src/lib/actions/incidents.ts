"use server";

import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { IncidentStatus, IncidentType, IncidentSeverity } from "@/generated/prisma/client";

// ─── Types ───

export type IncidentFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

// ─── Create Incident (Manual) ───

export async function createIncident(
  _prev: IncidentFormState,
  formData: FormData
): Promise<IncidentFormState> {
  const session = await requireRole("ADMIN", "CASE_MANAGER", "FRONT_DESK");

  const required = ["residentId", "type", "severity", "description"];
  const fieldErrors: Record<string, string> = {};
  for (const field of required) {
    if (!formData.get(field)?.toString().trim()) {
      fieldErrors[field] = "Required.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.incidentReport.count({
    where: {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
    },
  });
  const incidentDisplayId = `INC-${dateStr}-${String(count + 1).padStart(4, "0")}`;

  try {
    const incident = await prisma.incidentReport.create({
      data: {
        incidentDisplayId,
        type: formData.get("type") as IncidentType,
        severity: formData.get("severity") as IncidentSeverity,
        description: formData.get("description") as string,
        residentId: formData.get("residentId") as string,
        passId: (formData.get("passId") as string) || null,
        createdById: session.user.id,
      },
    });

    // Notify the resident's case manager
    const resident = await prisma.resident.findUnique({
      where: { id: formData.get("residentId") as string },
      select: { caseManagerId: true, firstName: true, lastName: true },
    });

    if (resident?.caseManagerId && resident.caseManagerId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: "INCIDENT",
          title: `New Incident: ${formData.get("type")}`,
          body: `${session.user.name} reported a ${(formData.get("severity") as string).toLowerCase()} severity ${(formData.get("type") as string).replace(/_/g, " ").toLowerCase()} incident for ${resident.firstName} ${resident.lastName}.`,
          recipientId: resident.caseManagerId,
          relatedEntityType: "IncidentReport",
          relatedEntityId: incident.id,
        },
      });
    }

    // Also notify admins
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN", isActive: true, id: { not: session.user.id } },
      select: { id: true },
    });

    if (admins.length > 0 && resident) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          type: "INCIDENT" as const,
          title: `New Incident: ${formData.get("type")}`,
          body: `${session.user.name} reported a ${(formData.get("severity") as string).toLowerCase()} severity incident for ${resident.firstName} ${resident.lastName}.`,
          recipientId: a.id,
          relatedEntityType: "IncidentReport",
          relatedEntityId: incident.id,
        })),
      });
    }
  } catch {
    return { error: "Failed to create incident report.", fieldErrors: {} };
  }

  revalidatePath("/dashboard/incidents");
  redirect("/dashboard/incidents");
}

// ─── Resolve Incident ───

export async function resolveIncident(id: string, resolutionNotes: string) {
  const session = await requireRole("ADMIN", "CASE_MANAGER");

  await prisma.incidentReport.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolutionNotes,
      resolvedAt: new Date(),
      resolvedById: session.user.id,
    },
  });

  revalidatePath(`/dashboard/incidents/${id}`);
  revalidatePath("/dashboard/incidents");
}

// ─── Reopen Incident ───

export async function reopenIncident(id: string) {
  await requireRole("ADMIN");

  await prisma.incidentReport.update({
    where: { id },
    data: {
      status: "OPEN",
      resolutionNotes: null,
      resolvedAt: null,
      resolvedById: null,
    },
  });

  revalidatePath(`/dashboard/incidents/${id}`);
  revalidatePath("/dashboard/incidents");
}

// ─── Close Incident ───

export async function closeIncident(id: string) {
  await requireRole("ADMIN");

  await prisma.incidentReport.update({
    where: { id },
    data: { status: "CLOSED" },
  });

  revalidatePath(`/dashboard/incidents/${id}`);
  revalidatePath("/dashboard/incidents");
}

// ─── Update Status to Under Review ───

export async function markUnderReview(id: string) {
  await requireRole("ADMIN", "CASE_MANAGER");

  await prisma.incidentReport.update({
    where: { id },
    data: { status: "UNDER_REVIEW" },
  });

  revalidatePath(`/dashboard/incidents/${id}`);
  revalidatePath("/dashboard/incidents");
}

// ─── Queries ───

export async function getIncidents(params: {
  status?: IncidentStatus;
  type?: IncidentType;
  severity?: IncidentSeverity;
}) {
  await getSession();

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.type) where.type = params.type;
  if (params.severity) where.severity = params.severity;

  return prisma.incidentReport.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      resident: { select: { firstName: true, lastName: true, inmateNumber: true } },
      createdBy: { select: { name: true } },
    },
  });
}

export async function getIncident(id: string) {
  await getSession();

  return prisma.incidentReport.findUnique({
    where: { id },
    include: {
      resident: {
        select: { id: true, firstName: true, lastName: true, inmateNumber: true, status: true },
      },
      pass: {
        select: { id: true, passDisplayId: true, date: true, employerName: true, status: true },
      },
      createdBy: { select: { id: true, name: true } },
      resolvedBy: { select: { id: true, name: true } },
    },
  });
}

export async function getResidentsForIncident() {
  await getSession();

  return prisma.resident.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, inmateNumber: true },
    orderBy: { lastName: "asc" },
  });
}
