"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { verifyPass } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

// ─── Verify QR Payload ───

export type VerifyResult = {
  valid: boolean;
  pass?: {
    id: string;
    authorizationId: string;
    passDisplayId: string;
    residentFullName: string;
    residentInmateNumber: string;
    employerName: string;
    employerAddress: string;
    passType: string;
    date: Date;
    scheduledDeparture: Date;
    scheduledReturn: Date;
    actualDeparture: Date | null;
    actualReturn: Date | null;
    status: string;
  };
  authorization?: {
    id: string;
    employerPhone: string;
    employerContact: string;
    jobTitle: string;
    employmentType: string;
    transportationMethod: string;
  };
  error?: string;
};

export async function verifyQRCode(qrData: string): Promise<VerifyResult> {
  await requireRole("ADMIN", "FRONT_DESK");

  let parsed: {
    v: number;
    pid: string;
    rid: string;
    d: string;
    dep: string;
    ret: string;
    emp: string;
    pt: string;
    sig: string;
  };

  try {
    parsed = JSON.parse(qrData);
  } catch {
    return { valid: false, error: "Invalid QR code format" };
  }

  if (!parsed.pid || !parsed.sig) {
    return { valid: false, error: "Missing required QR fields" };
  }

  const pass = await prisma.movementPass.findUnique({
    where: { passDisplayId: parsed.pid },
    include: {
      authorization: {
        select: {
          id: true,
          employerPhone: true,
          employerContact: true,
          jobTitle: true,
          employmentType: true,
          transportationMethod: true,
        },
      },
    },
  });

  if (!pass) {
    return { valid: false, error: `Pass ${parsed.pid} not found` };
  }

  if (pass.status !== "ACTIVE" && pass.status !== "USED") {
    return {
      valid: false,
      error: `Pass is ${pass.status.toLowerCase()} — cannot be used`,
      pass: {
        id: pass.id,
        authorizationId: pass.authorizationId,
        passDisplayId: pass.passDisplayId,
        residentFullName: pass.residentFullName,
        residentInmateNumber: pass.residentInmateNumber,
        employerName: pass.employerName,
        employerAddress: pass.employerAddress,
        passType: pass.passType,
        date: pass.date,
        scheduledDeparture: pass.scheduledDeparture,
        scheduledReturn: pass.scheduledReturn,
        actualDeparture: pass.actualDeparture,
        actualReturn: pass.actualReturn,
        status: pass.status,
      },
      authorization: pass.authorization
        ? {
            id: pass.authorization.id,
            employerPhone: pass.authorization.employerPhone,
            employerContact: pass.authorization.employerContact,
            jobTitle: pass.authorization.jobTitle,
            employmentType: pass.authorization.employmentType,
            transportationMethod: pass.authorization.transportationMethod,
          }
        : undefined,
    };
  }

  return {
    valid: true,
    pass: {
      id: pass.id,
      authorizationId: pass.authorizationId,
      passDisplayId: pass.passDisplayId,
      residentFullName: pass.residentFullName,
      residentInmateNumber: pass.residentInmateNumber,
      employerName: pass.employerName,
      employerAddress: pass.employerAddress,
      passType: pass.passType,
      date: pass.date,
      scheduledDeparture: pass.scheduledDeparture,
      scheduledReturn: pass.scheduledReturn,
      actualDeparture: pass.actualDeparture,
      actualReturn: pass.actualReturn,
      status: pass.status,
    },
    authorization: pass.authorization
      ? {
          id: pass.authorization.id,
          employerPhone: pass.authorization.employerPhone,
          employerContact: pass.authorization.employerContact,
          jobTitle: pass.authorization.jobTitle,
          employmentType: pass.authorization.employmentType,
          transportationMethod: pass.authorization.transportationMethod,
        }
      : undefined,
  };
}

// ─── Manual Lookup ───

export async function lookupPass(query: string): Promise<VerifyResult> {
  await requireRole("ADMIN", "FRONT_DESK");

  const pass = await prisma.movementPass.findFirst({
    where: {
      OR: [
        { passDisplayId: query.toUpperCase() },
        { residentInmateNumber: query },
      ],
    },
    orderBy: { date: "desc" },
  });

  if (!pass) {
    return { valid: false, error: "No pass found for that ID or inmate number" };
  }

  const auth = await prisma.employmentAuthorization.findUnique({
    where: { id: pass.authorizationId },
    select: {
      id: true,
      employerPhone: true,
      employerContact: true,
      jobTitle: true,
      employmentType: true,
      transportationMethod: true,
    },
  });

  return {
    valid: true,
    pass: {
      id: pass.id,
      authorizationId: pass.authorizationId,
      passDisplayId: pass.passDisplayId,
      residentFullName: pass.residentFullName,
      residentInmateNumber: pass.residentInmateNumber,
      employerName: pass.employerName,
      employerAddress: pass.employerAddress,
      passType: pass.passType,
      date: pass.date,
      scheduledDeparture: pass.scheduledDeparture,
      scheduledReturn: pass.scheduledReturn,
      actualDeparture: pass.actualDeparture,
      actualReturn: pass.actualReturn,
      status: pass.status,
    },
    authorization: auth
      ? {
          id: auth.id,
          employerPhone: auth.employerPhone,
          employerContact: auth.employerContact,
          jobTitle: auth.jobTitle,
          employmentType: auth.employmentType,
          transportationMethod: auth.transportationMethod,
        }
      : undefined,
  };
}

// ─── Check Out (DEPARTURE) ───

export async function checkOutResident(passId: string) {
  const session = await requireRole("ADMIN", "FRONT_DESK");

  const pass = await prisma.movementPass.findUnique({ where: { id: passId } });
  if (!pass) throw new Error("Pass not found");
  if (pass.status !== "ACTIVE") throw new Error(`Cannot check out: pass is ${pass.status}`);
  if (pass.actualDeparture) throw new Error("Resident already checked out on this pass");

  const now = new Date();

  await prisma.$transaction([
    prisma.movementPass.update({
      where: { id: passId },
      data: { actualDeparture: now, status: "USED" },
    }),
    prisma.movementLog.create({
      data: {
        direction: "OUT",
        timestamp: now,
        residentId: pass.residentId,
        passId: passId,
        recordedById: session.user.id,
      },
    }),
  ]);

  revalidatePath("/dashboard/front-desk");
  revalidatePath(`/dashboard/passes/${passId}`);
}

// ─── Check In (RETURN) ───

export async function checkInResident(passId: string) {
  const session = await requireRole("ADMIN", "FRONT_DESK");

  const pass = await prisma.movementPass.findUnique({ where: { id: passId } });
  if (!pass) throw new Error("Pass not found");
  if (pass.status !== "USED") throw new Error(`Cannot check in: pass is ${pass.status}`);
  if (!pass.actualDeparture) throw new Error("Resident has not checked out yet");
  if (pass.actualReturn) throw new Error("Resident already checked in");

  const now = new Date();
  const isLate = now > pass.scheduledReturn;

  await prisma.$transaction([
    prisma.movementPass.update({
      where: { id: passId },
      data: { actualReturn: now, status: "COMPLETED" },
    }),
    prisma.movementLog.create({
      data: {
        direction: "IN",
        timestamp: now,
        residentId: pass.residentId,
        passId: passId,
        recordedById: session.user.id,
      },
    }),
  ]);

  // Auto-create late return incident
  if (isLate) {
    const minutesLate = Math.round((now.getTime() - pass.scheduledReturn.getTime()) / 60000);

    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const incidentCount = await prisma.incidentReport.count({
      where: {
        createdAt: {
          gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
      },
    });
    const incidentDisplayId = `INC-${dateStr}-${String(incidentCount + 1).padStart(4, "0")}`;

    await prisma.incidentReport.create({
      data: {
        incidentDisplayId,
        type: "LATE_RETURN",
        severity: minutesLate > 60 ? "HIGH" : minutesLate > 30 ? "MEDIUM" : "LOW",
        description: `${pass.residentFullName} (${pass.residentInmateNumber}) returned ${minutesLate} minutes late from ${pass.employerName}. Scheduled return: ${pass.scheduledReturn.toLocaleTimeString()}, Actual: ${now.toLocaleTimeString()}.`,
        residentId: pass.residentId,
        passId: passId,
        createdById: session.user.id,
      },
    });

    // Notify case managers
    const resident = await prisma.resident.findUnique({
      where: { id: pass.residentId },
      select: { caseManagerId: true },
    });

    if (resident?.caseManagerId) {
      await prisma.notification.create({
        data: {
          type: "LATE_RETURN",
          title: "Late Return",
          body: `${pass.residentFullName} returned ${minutesLate} minutes late from ${pass.employerName}.`,
          recipientId: resident.caseManagerId,
          relatedEntityType: "IncidentReport",
        },
      });
    }
  }

  revalidatePath("/dashboard/front-desk");
  revalidatePath(`/dashboard/passes/${passId}`);
}

// ─── Today's Passes ───

export async function getTodaysPasses() {
  await requireRole("ADMIN", "FRONT_DESK");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.movementPass.findMany({
    where: { date: { gte: today, lt: tomorrow } },
    orderBy: [{ status: "asc" }, { scheduledDeparture: "asc" }],
  });
}

// ─── Today's Passes for Offline Cache ───

export async function getTodaysPassesForCache() {
  await requireRole("ADMIN", "FRONT_DESK");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.movementPass.findMany({
    where: { date: { gte: today, lt: tomorrow }, status: { in: ["ACTIVE", "USED"] } },
    select: {
      id: true,
      passDisplayId: true,
      residentFullName: true,
      residentInmateNumber: true,
      employerName: true,
      scheduledDeparture: true,
      scheduledReturn: true,
      status: true,
      qrCodeData: true,
      hmacSignature: true,
    },
  });
}
