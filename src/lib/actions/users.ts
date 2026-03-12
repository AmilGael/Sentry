"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/generated/prisma/client";

export type UserFormState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

// ─── List Users ───

export async function getUsers() {
  await requireRole("ADMIN");

  return prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { assignedResidents: true } },
    },
  });
}

// ─── Get Single User ───

export async function getUser(id: string) {
  await requireRole("ADMIN");

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedResidents: true,
          requestedAuthorizations: true,
          reviewedAuthorizations: true,
          recordedMovementLogs: true,
          createdIncidents: true,
        },
      },
    },
  });
}

// ─── Create User ───

export async function createUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireRole("ADMIN");

  const required = ["email", "name", "role", "password"];
  const fieldErrors: Record<string, string> = {};
  for (const field of required) {
    if (!formData.get(field)?.toString().trim()) {
      fieldErrors[field] = "Required.";
    }
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Invalid email format.";
  }

  const password = formData.get("password") as string;
  if (password && password.length < 8) {
    fieldErrors.password = "Must be at least 8 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists.", fieldErrors: {} };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        name: (formData.get("name") as string).trim(),
        role: formData.get("role") as UserRole,
        password: hashedPassword,
      },
    });
  } catch {
    return { error: "Failed to create user.", fieldErrors: {} };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// ─── Update User ───

export async function updateUser(
  _prev: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireRole("ADMIN");

  const id = formData.get("id") as string;
  if (!id) return { error: "User ID is missing.", fieldErrors: {} };

  const required = ["email", "name", "role"];
  const fieldErrors: Record<string, string> = {};
  for (const field of required) {
    if (!formData.get(field)?.toString().trim()) {
      fieldErrors[field] = "Required.";
    }
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Invalid email format.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { error: "Please fix the errors below.", fieldErrors };
  }

  const existing = await prisma.user.findFirst({
    where: { email, id: { not: id } },
  });
  if (existing) {
    return { error: "Another user with this email already exists.", fieldErrors: {} };
  }

  const data: Record<string, unknown> = {
    email,
    name: (formData.get("name") as string).trim(),
    role: formData.get("role") as UserRole,
  };

  const newPassword = (formData.get("password") as string)?.trim();
  if (newPassword) {
    if (newPassword.length < 8) {
      return { error: null, fieldErrors: { password: "Must be at least 8 characters." } };
    }
    data.password = await bcrypt.hash(newPassword, 12);
  }

  try {
    await prisma.user.update({ where: { id }, data });
  } catch {
    return { error: "Failed to update user.", fieldErrors: {} };
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

// ─── Toggle Active ───

export async function toggleUserActive(id: string) {
  await requireRole("ADMIN");

  const user = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
  if (!user) throw new Error("User not found");

  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });

  revalidatePath("/dashboard/users");
}
