"use server";

import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth-utils";

// ─── Dashboard Stats ───

export async function getDashboardStats() {
  const session = await getSession();
  const role = session.user.role;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalResidents,
    activeResidents,
    currentlyOut,
    overdueCount,
    pendingAuths,
    todaysPasses,
    openIncidents,
    todaysMovements,
  ] = await Promise.all([
    prisma.resident.count({ where: { isActive: true } }),
    prisma.resident.count({ where: { isActive: true, status: "IN_FACILITY" } }),
    prisma.movementPass.count({
      where: { status: "USED", date: { gte: today, lt: tomorrow } },
    }),
    prisma.movementPass.count({
      where: {
        status: "USED",
        scheduledReturn: { lt: new Date() },
        actualReturn: null,
      },
    }),
    prisma.employmentAuthorization.count({
      where: { status: { in: ["PENDING", "CM_SELF_APPROVED"] } },
    }),
    prisma.movementPass.count({
      where: { date: { gte: today, lt: tomorrow } },
    }),
    prisma.incidentReport.count({
      where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    }),
    prisma.movementLog.count({
      where: { timestamp: { gte: today, lt: tomorrow } },
    }),
  ]);

  return {
    totalResidents,
    activeResidents,
    currentlyOut,
    overdueCount,
    pendingAuths,
    todaysPasses,
    openIncidents,
    todaysMovements,
    role,
    userName: session.user.name,
  };
}

// ─── Daily Movement Log ───

export async function getDailyMovementLog(dateStr: string) {
  await requireRole("ADMIN", "FRONT_DESK");

  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const next = new Date(date);
  next.setDate(next.getDate() + 1);

  return prisma.movementLog.findMany({
    where: { timestamp: { gte: date, lt: next } },
    orderBy: { timestamp: "desc" },
    include: {
      resident: { select: { firstName: true, lastName: true, inmateNumber: true } },
      pass: { select: { passDisplayId: true, employerName: true } },
      recordedBy: { select: { name: true } },
    },
  });
}

// ─── Currently Out Report ───

export async function getCurrentlyOutReport() {
  await requireRole("ADMIN", "FRONT_DESK");

  return prisma.movementPass.findMany({
    where: { status: "USED", actualReturn: null },
    orderBy: { scheduledReturn: "asc" },
    include: {
      resident: { select: { firstName: true, lastName: true, inmateNumber: true } },
    },
  });
}

// ─── Resident Movement History ───

export async function getResidentMovementHistory(residentId: string) {
  await requireRole("ADMIN", "CASE_MANAGER");

  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    select: { firstName: true, lastName: true, inmateNumber: true },
  });

  const logs = await prisma.movementLog.findMany({
    where: { residentId },
    orderBy: { timestamp: "desc" },
    take: 100,
    include: {
      pass: { select: { passDisplayId: true, employerName: true, date: true } },
      recordedBy: { select: { name: true } },
    },
  });

  return { resident, logs };
}

// ─── Pass Utilization Report ───

export async function getPassUtilizationReport(startDate: string, endDate: string) {
  await requireRole("ADMIN");

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const [total, active, used, completed, cancelled, expired] = await Promise.all([
    prisma.movementPass.count({ where: { date: { gte: start, lte: end } } }),
    prisma.movementPass.count({ where: { date: { gte: start, lte: end }, status: "ACTIVE" } }),
    prisma.movementPass.count({ where: { date: { gte: start, lte: end }, status: "USED" } }),
    prisma.movementPass.count({ where: { date: { gte: start, lte: end }, status: "COMPLETED" } }),
    prisma.movementPass.count({ where: { date: { gte: start, lte: end }, status: "CANCELLED" } }),
    prisma.movementPass.count({ where: { date: { gte: start, lte: end }, status: "EXPIRED" } }),
  ]);

  return { total, active, used, completed, cancelled, expired, startDate, endDate };
}

// ─── Employment Placement Report ───

export async function getEmploymentPlacementReport() {
  await requireRole("ADMIN");

  const caseManagers = await prisma.user.findMany({
    where: { role: "CASE_MANAGER", isActive: true },
    select: { id: true, name: true },
  });

  const residents = await prisma.resident.findMany({
    where: { isActive: true, caseManagerId: { in: caseManagers.map((cm) => cm.id) } },
    select: {
      id: true,
      caseManagerId: true,
      authorizations: {
        where: { status: { in: ["APPROVED", "CM_SELF_APPROVED", "ES_RATIFIED", "ACTIVE"] } },
        select: { id: true },
      },
    },
  });

  return caseManagers.map((cm) => {
    const cmResidents = residents.filter((r) => r.caseManagerId === cm.id);
    return {
      id: cm.id,
      name: cm.name,
      totalResidents: cmResidents.length,
      residentsWithEmployment: cmResidents.filter((r) => r.authorizations.length > 0).length,
      totalActiveAuths: cmResidents.reduce((sum, r) => sum + r.authorizations.length, 0),
    };
  });
}

// ─── Incident Summary ───

export async function getIncidentSummaryReport(startDate: string, endDate: string) {
  await requireRole("ADMIN");

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const incidents = await prisma.incidentReport.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { type: true, severity: true, status: true },
  });

  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const inc of incidents) {
    byType[inc.type] = (byType[inc.type] ?? 0) + 1;
    bySeverity[inc.severity] = (bySeverity[inc.severity] ?? 0) + 1;
    byStatus[inc.status] = (byStatus[inc.status] ?? 0) + 1;
  }

  return { total: incidents.length, byType, bySeverity, byStatus, startDate, endDate };
}

// ─── Residents list for dropdowns ───

export async function getResidentsForReport() {
  await requireRole("ADMIN", "CASE_MANAGER");

  return prisma.resident.findMany({
    where: { isActive: true },
    select: { id: true, firstName: true, lastName: true, inmateNumber: true },
    orderBy: { lastName: "asc" },
  });
}
