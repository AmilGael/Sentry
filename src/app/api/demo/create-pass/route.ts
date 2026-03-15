import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePassForDate, generatePassToken } from "@/lib/pass-engine";

const VALID_STATUSES = ["APPROVED", "CM_SELF_APPROVED", "ES_RATIFIED", "ACTIVE"] as const;

/**
 * GET /api/demo/create-pass
 * Creates a new ACTIVE pass for today with a randomly chosen resident (from approved
 * authorizations) so each click can show a different name.
 */
export async function GET() {
  try {
    const authorizations = await prisma.employmentAuthorization.findMany({
      where: { status: { in: [...VALID_STATUSES] } },
      select: { id: true },
    });

    if (authorizations.length === 0) {
      return NextResponse.json(
        { error: "No approved authorizations found. Create and approve one first." },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * authorizations.length);
    const authId = authorizations[randomIndex].id;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const pass = await generatePassForDate(authId, today, "WORK");

    const scheduledDeparture = new Date(now.getTime() + 10 * 60 * 1000);
    const scheduledReturn = new Date(now.getTime() + 70 * 60 * 1000);

    await prisma.movementPass.update({
      where: { id: pass.id },
      data: { scheduledDeparture, scheduledReturn },
    });

    const token = generatePassToken(pass.id);

    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    const passUrl = `${baseUrl}/pass/${token}`;

    return NextResponse.redirect(passUrl);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create demo pass";
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
