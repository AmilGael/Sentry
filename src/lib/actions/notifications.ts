"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const session = await getSession();

  return prisma.notification.findMany({
    where: { recipientId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadCount() {
  const session = await getSession();

  return prisma.notification.count({
    where: { recipientId: session.user.id, isRead: false },
  });
}

export async function markAsRead(id: string) {
  const session = await getSession();

  await prisma.notification.updateMany({
    where: { id, recipientId: session.user.id },
    data: { isRead: true },
  });

  revalidatePath("/dashboard");
}

export async function markAllAsRead() {
  const session = await getSession();

  await prisma.notification.updateMany({
    where: { recipientId: session.user.id, isRead: false },
    data: { isRead: true },
  });

  revalidatePath("/dashboard");
}
