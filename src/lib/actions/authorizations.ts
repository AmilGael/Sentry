"use server";

import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AuthorizationStatus } from "@/generated/prisma/client";

// ─── Types ───

export type AuthFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

// ─── Create Authorization (Case Manager) ───

export async function createAuthorization(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await requireRole("ADMIN", "CASE_MANAGER");

  const required = [
    "residentId", "employerName", "employerAddress", "employerPhone",
    "employerContact", "jobTitle", "employmentType", "scheduleType",
    "scheduleStartDate", "departureTime", "returnTime",
    "transportationMethod",
  ];

  const fieldErrors: Record<string, string> = {};
  for (const field of required) {
    if (!formData.get(field)?.toString().trim()) {
      fieldErrors[field] = "Required.";
    }
  }

  const scheduleType = formData.get("scheduleType") as string;
  if (scheduleType === "RECURRING") {
    const days = formData.getAll("scheduleDays");
    if (days.length === 0) {
      fieldErrors.scheduleDays = "Select at least one day.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const scheduleDays = scheduleType === "RECURRING"
    ? (formData.getAll("scheduleDays") as string[])
    : [];

  try {
    await prisma.employmentAuthorization.create({
      data: {
        residentId: formData.get("residentId") as string,
        requestedById: session.user.id,
        employerName: formData.get("employerName") as string,
        employerAddress: formData.get("employerAddress") as string,
        employerPhone: formData.get("employerPhone") as string,
        employerContact: formData.get("employerContact") as string,
        jobTitle: formData.get("jobTitle") as string,
        payRate: (formData.get("payRate") as string) || null,
        employmentType: formData.get("employmentType") as "FULL_TIME" | "PART_TIME" | "TEMPORARY" | "DAY_LABOR",
        scheduleType: scheduleType as "RECURRING" | "ONE_TIME",
        scheduleStartDate: new Date(formData.get("scheduleStartDate") as string),
        scheduleEndDate: formData.get("scheduleEndDate")
          ? new Date(formData.get("scheduleEndDate") as string)
          : null,
        scheduleDays,
        departureTime: formData.get("departureTime") as string,
        returnTime: formData.get("returnTime") as string,
        travelBufferMin: parseInt(formData.get("travelBufferMin") as string) || 30,
        transportationMethod: formData.get("transportationMethod") as "PUBLIC_TRANSIT" | "PERSONAL_VEHICLE" | "EMPLOYER_TRANSPORT" | "WALKING" | "OTHER",
        transportationDetails: (formData.get("transportationDetails") as string) || null,
        supportingDocuments: (formData.get("supportingDocuments") as string) || null,
        caseManagerNotes: (formData.get("caseManagerNotes") as string) || null,
        status: "PENDING",
      },
    });
  } catch {
    return { error: "Failed to create authorization.", fieldErrors: {} };
  }

  // Create notification for Employment Specialist(s)
  const specialists = await prisma.user.findMany({
    where: { role: "EMPLOYMENT_SPECIALIST", isActive: true },
    select: { id: true },
  });

  const resident = await prisma.resident.findUnique({
    where: { id: formData.get("residentId") as string },
    select: { firstName: true, lastName: true },
  });

  if (specialists.length > 0 && resident) {
    await prisma.notification.createMany({
      data: specialists.map((s) => ({
        type: "NEW_REQUEST" as const,
        title: "New Authorization Request",
        body: `${session.user.name} submitted an employment authorization for ${resident.firstName} ${resident.lastName} at ${formData.get("employerName")}.`,
        recipientId: s.id,
        relatedEntityType: "Authorization",
      })),
    });
  }

  revalidatePath("/dashboard/authorizations");
  redirect("/dashboard/authorizations");
}

// ─── Self-Approve (Case Manager Emergency) ───

export async function selfApproveAuthorization(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const session = await requireRole("ADMIN", "CASE_MANAGER");

  const required = [
    "residentId", "employerName", "employerAddress", "employerPhone",
    "employerContact", "jobTitle", "employmentType", "scheduleType",
    "scheduleStartDate", "departureTime", "returnTime",
    "transportationMethod", "selfApprovalJustification",
  ];

  const fieldErrors: Record<string, string> = {};
  for (const field of required) {
    if (!formData.get(field)?.toString().trim()) {
      fieldErrors[field] = "Required.";
    }
  }

  const scheduleType = formData.get("scheduleType") as string;
  if (scheduleType === "RECURRING") {
    const days = formData.getAll("scheduleDays");
    if (days.length === 0) {
      fieldErrors.scheduleDays = "Select at least one day.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const scheduleDays = scheduleType === "RECURRING"
    ? (formData.getAll("scheduleDays") as string[])
    : [];

  try {
    const auth = await prisma.employmentAuthorization.create({
      data: {
        residentId: formData.get("residentId") as string,
        requestedById: session.user.id,
        employerName: formData.get("employerName") as string,
        employerAddress: formData.get("employerAddress") as string,
        employerPhone: formData.get("employerPhone") as string,
        employerContact: formData.get("employerContact") as string,
        jobTitle: formData.get("jobTitle") as string,
        payRate: (formData.get("payRate") as string) || null,
        employmentType: formData.get("employmentType") as "FULL_TIME" | "PART_TIME" | "TEMPORARY" | "DAY_LABOR",
        scheduleType: scheduleType as "RECURRING" | "ONE_TIME",
        scheduleStartDate: new Date(formData.get("scheduleStartDate") as string),
        scheduleEndDate: formData.get("scheduleEndDate")
          ? new Date(formData.get("scheduleEndDate") as string)
          : null,
        scheduleDays,
        departureTime: formData.get("departureTime") as string,
        returnTime: formData.get("returnTime") as string,
        travelBufferMin: parseInt(formData.get("travelBufferMin") as string) || 30,
        transportationMethod: formData.get("transportationMethod") as "PUBLIC_TRANSIT" | "PERSONAL_VEHICLE" | "EMPLOYER_TRANSPORT" | "WALKING" | "OTHER",
        transportationDetails: (formData.get("transportationDetails") as string) || null,
        supportingDocuments: (formData.get("supportingDocuments") as string) || null,
        caseManagerNotes: (formData.get("caseManagerNotes") as string) || null,
        status: "CM_SELF_APPROVED",
        selfApprovedByCM: true,
        selfApprovalJustification: formData.get("selfApprovalJustification") as string,
        selfApprovalTimestamp: new Date(),
      },
    });

    // Notify Employment Specialists
    const specialists = await prisma.user.findMany({
      where: { role: "EMPLOYMENT_SPECIALIST", isActive: true },
      select: { id: true },
    });

    const resident = await prisma.resident.findUnique({
      where: { id: formData.get("residentId") as string },
      select: { firstName: true, lastName: true },
    });

    if (specialists.length > 0 && resident) {
      await prisma.notification.createMany({
        data: specialists.map((s) => ({
          type: "SELF_APPROVAL_ALERT" as const,
          title: "CM Self-Approval Requires Review",
          body: `${session.user.name} self-approved an authorization for ${resident.firstName} ${resident.lastName} at ${formData.get("employerName")}. Justification: ${formData.get("selfApprovalJustification")}`,
          recipientId: s.id,
          relatedEntityType: "Authorization",
          relatedEntityId: auth.id,
        })),
      });
    }
  } catch {
    return { error: "Failed to create self-approved authorization.", fieldErrors: {} };
  }

  revalidatePath("/dashboard/authorizations");
  redirect("/dashboard/authorizations");
}

// ─── Review Actions (Employment Specialist) ───

export async function approveAuthorization(id: string) {
  const session = await requireRole("ADMIN", "EMPLOYMENT_SPECIALIST");

  const auth = await prisma.employmentAuthorization.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedById: session.user.id,
    },
    include: { requestedBy: { select: { id: true } }, resident: { select: { firstName: true, lastName: true } } },
  });

  await prisma.notification.create({
    data: {
      type: "APPROVED",
      title: "Authorization Approved",
      body: `${session.user.name} approved the employment authorization for ${auth.resident.firstName} ${auth.resident.lastName} at ${auth.employerName}.`,
      recipientId: auth.requestedBy.id,
      relatedEntityType: "Authorization",
      relatedEntityId: id,
    },
  });

  revalidatePath(`/dashboard/authorizations/${id}`);
  revalidatePath("/dashboard/authorizations");
}

export async function denyAuthorization(id: string, reason: string) {
  const session = await requireRole("ADMIN", "EMPLOYMENT_SPECIALIST");

  const auth = await prisma.employmentAuthorization.update({
    where: { id },
    data: {
      status: "DENIED",
      reviewedById: session.user.id,
      denialReason: reason,
    },
    include: { requestedBy: { select: { id: true } }, resident: { select: { firstName: true, lastName: true } } },
  });

  await prisma.notification.create({
    data: {
      type: "DENIED",
      title: "Authorization Denied",
      body: `${session.user.name} denied the authorization for ${auth.resident.firstName} ${auth.resident.lastName} at ${auth.employerName}. Reason: ${reason}`,
      recipientId: auth.requestedBy.id,
      relatedEntityType: "Authorization",
      relatedEntityId: id,
    },
  });

  revalidatePath(`/dashboard/authorizations/${id}`);
  revalidatePath("/dashboard/authorizations");
}

export async function ratifyAuthorization(id: string) {
  const session = await requireRole("ADMIN", "EMPLOYMENT_SPECIALIST");

  const auth = await prisma.employmentAuthorization.update({
    where: { id },
    data: {
      status: "ES_RATIFIED",
      esRatifiedById: session.user.id,
      esRatifiedAt: new Date(),
    },
    include: { requestedBy: { select: { id: true } }, resident: { select: { firstName: true, lastName: true } } },
  });

  await prisma.notification.create({
    data: {
      type: "APPROVED",
      title: "Self-Approval Ratified",
      body: `${session.user.name} ratified the self-approved authorization for ${auth.resident.firstName} ${auth.resident.lastName} at ${auth.employerName}.`,
      recipientId: auth.requestedBy.id,
      relatedEntityType: "Authorization",
      relatedEntityId: id,
    },
  });

  revalidatePath(`/dashboard/authorizations/${id}`);
  revalidatePath("/dashboard/authorizations");
}

export async function revokeAuthorization(id: string, reason: string) {
  const session = await requireRole("ADMIN", "CASE_MANAGER", "EMPLOYMENT_SPECIALIST");

  const auth = await prisma.employmentAuthorization.update({
    where: { id },
    data: {
      status: "REVOKED",
      denialReason: reason,
    },
    include: { requestedBy: { select: { id: true } }, resident: { select: { firstName: true, lastName: true } } },
  });

  // Invalidate all future active passes
  await prisma.movementPass.updateMany({
    where: {
      authorizationId: id,
      status: "ACTIVE",
      date: { gte: new Date() },
    },
    data: { status: "CANCELLED" },
  });

  await prisma.notification.create({
    data: {
      type: "REVOKED",
      title: "Authorization Revoked",
      body: `${session.user.name} revoked the authorization for ${auth.resident.firstName} ${auth.resident.lastName} at ${auth.employerName}. Reason: ${reason}`,
      recipientId: auth.requestedBy.id,
      relatedEntityType: "Authorization",
      relatedEntityId: id,
    },
  });

  revalidatePath(`/dashboard/authorizations/${id}`);
  revalidatePath("/dashboard/authorizations");
}

// ─── Queries ───

export async function getAuthorizations(params: {
  status?: AuthorizationStatus;
  residentId?: string;
  requestedById?: string;
}) {
  await getSession();

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.residentId) where.residentId = params.residentId;
  if (params.requestedById) where.requestedById = params.requestedById;

  return prisma.employmentAuthorization.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      resident: { select: { id: true, firstName: true, lastName: true, inmateNumber: true } },
      requestedBy: { select: { name: true } },
      reviewedBy: { select: { name: true } },
    },
  });
}

export async function getAuthorization(id: string) {
  await getSession();

  return prisma.employmentAuthorization.findUnique({
    where: { id },
    include: {
      resident: {
        select: {
          id: true, firstName: true, lastName: true, inmateNumber: true,
          status: true, conditions: true,
        },
      },
      requestedBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
      esRatifiedBy: { select: { id: true, name: true } },
      passes: {
        orderBy: { date: "desc" },
        take: 10,
        select: { id: true, passDisplayId: true, date: true, status: true },
      },
    },
  });
}

export async function getResidentsForDropdown(caseManagerId?: string) {
  const where: Record<string, unknown> = {
    isActive: true,
    status: { in: ["INTAKE", "IN_FACILITY"] },
  };
  if (caseManagerId) where.caseManagerId = caseManagerId;

  return prisma.resident.findMany({
    where,
    select: { id: true, firstName: true, lastName: true, inmateNumber: true },
    orderBy: { lastName: "asc" },
  });
}
