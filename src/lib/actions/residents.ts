"use server";

import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ResidentStatus } from "@/generated/prisma/client";

// ─── Types ───

export type ResidentFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

const emptyState: ResidentFormState = { error: null, fieldErrors: {} };

// ─── Validation ───

function validateResidentForm(formData: FormData): ResidentFormState & { valid: boolean } {
  const fieldErrors: Record<string, string> = {};

  const required = [
    "inmateNumber",
    "firstName",
    "lastName",
    "dateOfBirth",
    "intakeDate",
    "expectedReleaseDate",
    "caseManagerId",
    "emergencyContactName",
    "emergencyContactPhone",
  ];

  for (const field of required) {
    if (!formData.get(field)?.toString().trim()) {
      fieldErrors[field] = "This field is required.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors, valid: false };
  }

  return { error: null, fieldErrors: {}, valid: true };
}

// ─── Create ───

export async function createResident(
  _prev: ResidentFormState,
  formData: FormData
): Promise<ResidentFormState> {
  await requireRole("ADMIN", "CASE_MANAGER");

  const validation = validateResidentForm(formData);
  if (!validation.valid) return validation;

  try {
    await prisma.resident.create({
      data: {
        inmateNumber: formData.get("inmateNumber") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        dateOfBirth: new Date(formData.get("dateOfBirth") as string),
        intakeDate: new Date(formData.get("intakeDate") as string),
        expectedReleaseDate: new Date(formData.get("expectedReleaseDate") as string),
        caseManagerId: formData.get("caseManagerId") as string,
        roomAssignment: (formData.get("roomAssignment") as string) || null,
        emergencyContactName: formData.get("emergencyContactName") as string,
        emergencyContactPhone: formData.get("emergencyContactPhone") as string,
        conditions: (formData.get("conditions") as string) || null,
        notes: (formData.get("notes") as string) || null,
        status: "INTAKE",
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: null, fieldErrors: { inmateNumber: "This inmate number already exists." } };
    }
    return { error: "Failed to create resident. Please try again.", fieldErrors: {} };
  }

  revalidatePath("/dashboard/residents");
  redirect("/dashboard/residents");
}

// ─── Update ───

export async function updateResident(
  id: string,
  _prev: ResidentFormState,
  formData: FormData
): Promise<ResidentFormState> {
  await requireRole("ADMIN", "CASE_MANAGER");

  const validation = validateResidentForm(formData);
  if (!validation.valid) return validation;

  try {
    await prisma.resident.update({
      where: { id },
      data: {
        inmateNumber: formData.get("inmateNumber") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        dateOfBirth: new Date(formData.get("dateOfBirth") as string),
        intakeDate: new Date(formData.get("intakeDate") as string),
        expectedReleaseDate: new Date(formData.get("expectedReleaseDate") as string),
        caseManagerId: formData.get("caseManagerId") as string,
        roomAssignment: (formData.get("roomAssignment") as string) || null,
        emergencyContactName: formData.get("emergencyContactName") as string,
        emergencyContactPhone: formData.get("emergencyContactPhone") as string,
        conditions: (formData.get("conditions") as string) || null,
        notes: (formData.get("notes") as string) || null,
      },
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: null, fieldErrors: { inmateNumber: "This inmate number already exists." } };
    }
    return { error: "Failed to update resident. Please try again.", fieldErrors: {} };
  }

  revalidatePath(`/dashboard/residents/${id}`);
  revalidatePath("/dashboard/residents");
  redirect(`/dashboard/residents/${id}`);
}

// ─── Update Status ───

export async function updateResidentStatus(
  id: string,
  newStatus: ResidentStatus
) {
  const session = await getSession();

  if (newStatus === "RELEASED") {
    await requireRole("ADMIN");
  } else {
    await requireRole("ADMIN", "CASE_MANAGER");
  }

  await prisma.resident.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath(`/dashboard/residents/${id}`);
  revalidatePath("/dashboard/residents");
}

// ─── Queries ───

export async function getResidents(params: {
  search?: string;
  status?: ResidentStatus;
  caseManagerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  await getSession();

  const where: Record<string, unknown> = { isActive: true };

  if (params.search) {
    where.OR = [
      { firstName: { contains: params.search, mode: "insensitive" } },
      { lastName: { contains: params.search, mode: "insensitive" } },
      { inmateNumber: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.status) {
    where.status = params.status;
  }

  if (params.caseManagerId) {
    where.caseManagerId = params.caseManagerId;
  }

  const orderBy: Record<string, string> = {};
  const sortField = params.sortBy || "lastName";
  orderBy[sortField] = params.sortOrder || "asc";

  return prisma.resident.findMany({
    where,
    orderBy,
    include: {
      caseManager: { select: { id: true, name: true } },
    },
  });
}

export async function getResident(id: string) {
  await getSession();

  return prisma.resident.findUnique({
    where: { id },
    include: {
      caseManager: { select: { id: true, name: true } },
      authorizations: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { requestedBy: { select: { name: true } } },
      },
      movementLogs: {
        orderBy: { timestamp: "desc" },
        take: 10,
        include: {
          pass: { select: { passDisplayId: true, employerName: true } },
          recordedBy: { select: { name: true } },
        },
      },
    },
  });
}

export async function getCaseManagers() {
  return prisma.user.findMany({
    where: { role: "CASE_MANAGER", isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
