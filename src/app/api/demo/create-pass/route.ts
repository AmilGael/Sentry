import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePassForDate, generatePassToken } from "@/lib/pass-engine";

const VALID_STATUSES = ["APPROVED", "CM_SELF_APPROVED", "ES_RATIFIED", "ACTIVE"] as const;

/**
 * GET /api/demo/create-pass
 * Creates a new ACTIVE pass for today with a randomly chosen resident who does NOT
 * already have a pass for today (not in any Front Desk category).
 */
export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysPasses = await prisma.movementPass.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      select: { residentId: true },
    });
    const residentIdsWithPassToday = [...new Set(todaysPasses.map((p) => p.residentId))];

    const authorizations = await prisma.employmentAuthorization.findMany({
      where: {
        status: { in: [...VALID_STATUSES] },
        resident:
          residentIdsWithPassToday.length > 0
            ? { id: { notIn: residentIdsWithPassToday } }
            : undefined,
      },
      select: { id: true },
    });

    if (authorizations.length === 0) {
      return NextResponse.json(
        {
          error:
            residentIdsWithPassToday.length > 0
              ? "No residents without a pass for today. Use the red demo to reset the board, then try again."
              : "No approved authorizations found. Run seed or create more.",
        },
        { status: 400 }
      );
    }

    const randomIndex = Math.floor(Math.random() * authorizations.length);
    const authId = authorizations[randomIndex].id;

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
