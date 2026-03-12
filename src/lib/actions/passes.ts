"use server";

import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth-utils";
import { generatePassForDate, generatePassToken } from "@/lib/pass-engine";
import { revalidatePath } from "next/cache";
import type { PassStatus } from "@/generated/prisma/client";

// ─── Generate Pass (manual trigger) ───

export async function generatePassAction(authorizationId: string, dateStr: string) {
  await requireRole("ADMIN", "CASE_MANAGER", "EMPLOYMENT_SPECIALIST");

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);

  const pass = await generatePassForDate(authorizationId, date);

  revalidatePath("/dashboard/passes");
  revalidatePath(`/dashboard/authorizations/${authorizationId}`);
  return pass;
}

// ─── Get Passes ───

export async function getPasses(params: {
  status?: PassStatus;
  residentId?: string;
  date?: string;
}) {
  await getSession();

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status;
  if (params.residentId) where.residentId = params.residentId;
  if (params.date) {
    const d = new Date(params.date);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.date = { gte: d, lt: next };
  }

  return prisma.movementPass.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      authorization: { select: { id: true, employerName: true } },
    },
  });
}

// ─── Get Single Pass ───

export async function getPass(id: string) {
  await getSession();

  return prisma.movementPass.findUnique({
    where: { id },
    include: {
      authorization: {
        select: { id: true, employerName: true, employerAddress: true, transportationMethod: true },
      },
    },
  });
}

// ─── Get Pass for Public View (by token) ───

export async function getPassByToken(passId: string) {
  return prisma.movementPass.findUnique({
    where: { id: passId },
  });
}

// ─── Generate Secure Link Token ───

export async function getPassSecureLink(passId: string) {
  await getSession();
  const token = generatePassToken(passId);
  return token;
}

// ─── Cancel Pass ───

export async function cancelPass(passId: string) {
  await requireRole("ADMIN", "CASE_MANAGER", "EMPLOYMENT_SPECIALIST");

  await prisma.movementPass.update({
    where: { id: passId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/passes");
}
