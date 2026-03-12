import { prisma } from "@/lib/prisma";
import { signPass } from "@/lib/crypto";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

const QR_SCHEMA_VERSION = 1;

function generatePassDisplayId(date: Date, sequence: number): string {
  const d = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `MP-${d}-${String(sequence).padStart(4, "0")}`;
}

async function getNextSequence(date: Date): Promise<number> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await prisma.movementPass.count({
    where: { date: { gte: startOfDay, lte: endOfDay } },
  });
  return count + 1;
}

function buildQRPayload(pass: {
  passDisplayId: string;
  residentId: string;
  date: string;
  departureTime: string;
  returnTime: string;
  employerName: string;
  passType: string;
  hmacSignature: string;
}): string {
  return JSON.stringify({
    v: QR_SCHEMA_VERSION,
    pid: pass.passDisplayId,
    rid: pass.residentId,
    d: pass.date,
    dep: pass.departureTime,
    ret: pass.returnTime,
    emp: pass.employerName,
    pt: pass.passType,
    sig: pass.hmacSignature,
  });
}

export async function generateQRDataUrl(qrPayload: string): Promise<string> {
  return QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
  });
}

export async function generatePassForDate(
  authId: string,
  date: Date,
  passType: "WORK" | "JOB_SEARCH" | "INTERVIEW" = "WORK"
) {
  const auth = await prisma.employmentAuthorization.findUnique({
    where: { id: authId },
    include: {
      resident: { select: { id: true, firstName: true, lastName: true, inmateNumber: true, status: true } },
    },
  });

  if (!auth) throw new Error("Authorization not found");

  const validStatuses = ["APPROVED", "CM_SELF_APPROVED", "ES_RATIFIED", "ACTIVE"];
  if (!validStatuses.includes(auth.status)) {
    throw new Error(`Cannot generate pass: authorization status is ${auth.status}`);
  }

  if (auth.resident.status === "AWOL" || auth.resident.status === "RELEASED") {
    throw new Error(`Cannot generate pass: resident status is ${auth.resident.status}`);
  }

  if (auth.scheduleEndDate && date > auth.scheduleEndDate) {
    throw new Error("Cannot generate pass: date is beyond authorization expiration");
  }

  // Build departure/return datetimes
  const [depH, depM] = auth.departureTime.split(":").map(Number);
  const [retH, retM] = auth.returnTime.split(":").map(Number);

  const scheduledDeparture = new Date(date);
  scheduledDeparture.setHours(depH, depM, 0, 0);

  const scheduledReturn = new Date(date);
  scheduledReturn.setHours(retH, retM, 0, 0);

  const seq = await getNextSequence(date);
  const passDisplayId = generatePassDisplayId(date, seq);

  const issuedAt = new Date().toISOString();
  const dateStr = date.toISOString().slice(0, 10);

  const hmacSignature = signPass({
    passId: passDisplayId,
    residentId: auth.resident.id,
    date: dateStr,
    departureTime: auth.departureTime,
    returnTime: auth.returnTime,
    employerName: auth.employerName,
    passType: passType,
    issuedAt: issuedAt,
  });

  const qrPayload = buildQRPayload({
    passDisplayId,
    residentId: auth.resident.id,
    date: dateStr,
    departureTime: auth.departureTime,
    returnTime: auth.returnTime,
    employerName: auth.employerName,
    passType: passType,
    hmacSignature,
  });

  const pass = await prisma.movementPass.create({
    data: {
      passDisplayId,
      residentId: auth.resident.id,
      authorizationId: auth.id,
      residentFullName: `${auth.resident.firstName} ${auth.resident.lastName}`,
      residentInmateNumber: auth.resident.inmateNumber,
      employerName: auth.employerName,
      employerAddress: auth.employerAddress,
      passType: passType,
      date: date,
      scheduledDeparture,
      scheduledReturn,
      status: "ACTIVE",
      hmacSignature,
      qrCodeData: qrPayload,
      issuedAt: new Date(issuedAt),
    },
  });

  // Set authorization to ACTIVE if not already
  if (auth.status !== "ACTIVE") {
    await prisma.employmentAuthorization.update({
      where: { id: authId },
      data: { status: "ACTIVE" },
    });
  }

  return pass;
}

export async function generatePassesForAuthorization(authId: string) {
  const auth = await prisma.employmentAuthorization.findUnique({
    where: { id: authId },
  });

  if (!auth) throw new Error("Authorization not found");

  if (auth.scheduleType === "ONE_TIME") {
    const existing = await prisma.movementPass.findFirst({
      where: { authorizationId: authId, date: auth.scheduleStartDate },
    });
    if (!existing) {
      return [await generatePassForDate(authId, auth.scheduleStartDate)];
    }
    return [];
  }

  // For recurring, generate tomorrow's pass
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayName = tomorrow.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();

  if (!auth.scheduleDays.includes(dayName)) return [];
  if (auth.scheduleEndDate && tomorrow > auth.scheduleEndDate) return [];
  if (tomorrow < auth.scheduleStartDate) return [];

  const existing = await prisma.movementPass.findFirst({
    where: { authorizationId: authId, date: tomorrow },
  });
  if (existing) return [];

  return [await generatePassForDate(authId, tomorrow)];
}

export function generatePassToken(passId: string): string {
  const secret = process.env.PASS_SIGNING_SECRET ?? "dev-secret-do-not-use-in-production";
  return jwt.sign({ passId }, secret, { expiresIn: "24h" });
}

export function verifyPassToken(token: string): { passId: string } | null {
  try {
    const secret = process.env.PASS_SIGNING_SECRET ?? "dev-secret-do-not-use-in-production";
    return jwt.verify(token, secret) as { passId: string };
  } catch {
    return null;
  }
}
