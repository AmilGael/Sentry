import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generatePassForDate } from "@/lib/pass-engine";

const VALID_STATUSES = ["APPROVED", "CM_SELF_APPROVED", "ES_RATIFIED", "ACTIVE"] as const;

/**
 * GET /api/demo/setup-front-desk
 * One-click demo: 1 overdue, 1 returning soon, 1 currently out, 2 scheduled, 3 returned.
 */
export async function GET() {
  try {
    const now = new Date();
    // Use same date range as getTodaysPasses so we clear exactly what the dashboard shows
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Clear today's passes and their movement logs
    const existingPasses = await prisma.movementPass.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      select: { id: true },
    });
    const passIds = existingPasses.map((p) => p.id);
    if (passIds.length > 0) {
      await prisma.movementLog.deleteMany({ where: { passId: { in: passIds } } });
      await prisma.movementPass.deleteMany({ where: { id: { in: passIds } } });
    }

    // Need at least 8 approved authorizations
    const authorizations = await prisma.employmentAuthorization.findMany({
      where: { status: { in: [...VALID_STATUSES] } },
      select: { id: true },
    });
    if (authorizations.length < 8) {
      return NextResponse.json(
        { error: "Need at least 8 approved authorizations. Run seed or create more." },
        { status: 400 }
      );
    }

    const authIds = authorizations.slice(0, 8).map((a) => a.id);

    // User for movement log
    const recorder = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "FRONT_DESK"] }, isActive: true },
      select: { id: true },
    });
    const recordedById = recorder?.id ?? authIds[0];

    // Create 8 passes
    const passes: Awaited<ReturnType<typeof generatePassForDate>>[] = [];
    for (const authId of authIds) {
      const pass = await generatePassForDate(authId, today, "WORK");
      passes.push(pass);
    }

    const ms = (m: number) => m * 60 * 1000;

    // 1 overdue: left 2h ago, was due back 1h ago
    const overdueDep = new Date(now.getTime() - ms(120));
    const overdueRet = new Date(now.getTime() - ms(60));
    await prisma.$transaction([
      prisma.movementPass.update({
        where: { id: passes[0].id },
        data: {
          scheduledDeparture: overdueDep,
          scheduledReturn: overdueRet,
          actualDeparture: overdueDep,
          status: "USED",
        },
      }),
      prisma.movementLog.create({
        data: {
          direction: "OUT",
          timestamp: overdueDep,
          residentId: passes[0].residentId,
          passId: passes[0].id,
          recordedById,
        },
      }),
    ]);

    // 2: returning soon (due back in 30 min)
    const soonDep = new Date(now.getTime() - ms(60));
    const soonRet = new Date(now.getTime() + ms(30));
    await prisma.$transaction([
      prisma.movementPass.update({
        where: { id: passes[1].id },
        data: {
          scheduledDeparture: soonDep,
          scheduledReturn: soonRet,
          actualDeparture: soonDep,
          status: "USED",
        },
      }),
      prisma.movementLog.create({
        data: {
          direction: "OUT",
          timestamp: soonDep,
          residentId: passes[1].residentId,
          passId: passes[1].id,
          recordedById,
        },
      }),
    ]);

    // 3: currently out (due back in 2h)
    const outDep = new Date(now.getTime() - ms(45));
    const outRet = new Date(now.getTime() + ms(120));
    await prisma.$transaction([
      prisma.movementPass.update({
        where: { id: passes[2].id },
        data: {
          scheduledDeparture: outDep,
          scheduledReturn: outRet,
          actualDeparture: outDep,
          status: "USED",
        },
      }),
      prisma.movementLog.create({
        data: {
          direction: "OUT",
          timestamp: outDep,
          residentId: passes[2].residentId,
          passId: passes[2].id,
          recordedById,
        },
      }),
    ]);

    // 4–5: scheduled (depart in 20 and 40 min)
    await prisma.movementPass.update({
      where: { id: passes[3].id },
      data: {
        scheduledDeparture: new Date(now.getTime() + ms(20)),
        scheduledReturn: new Date(now.getTime() + ms(140)),
        status: "ACTIVE",
      },
    });
    await prisma.movementPass.update({
      where: { id: passes[4].id },
      data: {
        scheduledDeparture: new Date(now.getTime() + ms(40)),
        scheduledReturn: new Date(now.getTime() + ms(160)),
        status: "ACTIVE",
      },
    });

    // 6–8: returned (COMPLETED, with OUT + IN logs)
    for (let i = 5; i <= 7; i++) {
      const dep = new Date(now.getTime() - ms(180 + (i - 5) * 60));
      const ret = new Date(now.getTime() - ms(120 + (i - 5) * 60));
      await prisma.$transaction([
        prisma.movementPass.update({
          where: { id: passes[i].id },
          data: {
            scheduledDeparture: dep,
            scheduledReturn: ret,
            actualDeparture: dep,
            actualReturn: ret,
            status: "COMPLETED",
          },
        }),
        prisma.movementLog.create({
          data: {
            direction: "OUT",
            timestamp: dep,
            residentId: passes[i].residentId,
            passId: passes[i].id,
            recordedById,
          },
        }),
        prisma.movementLog.create({
          data: {
            direction: "IN",
            timestamp: ret,
            residentId: passes[i].residentId,
            passId: passes[i].id,
            recordedById,
          },
        }),
      ]);
    }

    revalidatePath("/dashboard/front-desk");
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/dashboard/front-desk`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to setup demo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
