import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/generated/prisma/client";

export async function getSession() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await getSession();
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/dashboard");
  }
  return session;
}

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Residents", href: "/dashboard/residents", icon: "👤" },
    { label: "Authorizations", href: "/dashboard/authorizations", icon: "📋" },
    { label: "Passes", href: "/dashboard/passes", icon: "🎫" },
    { label: "Front Desk", href: "/dashboard/front-desk", icon: "🖥️" },
    { label: "Incidents", href: "/dashboard/incidents", icon: "⚠️" },
    { label: "Reports", href: "/dashboard/reports", icon: "📈" },
    { label: "Users", href: "/dashboard/users", icon: "👥" },
    { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
  ],
  CASE_MANAGER: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "My Residents", href: "/dashboard/residents", icon: "👤" },
    { label: "Authorizations", href: "/dashboard/authorizations", icon: "📋" },
    { label: "Passes", href: "/dashboard/passes", icon: "🎫" },
    { label: "Incidents", href: "/dashboard/incidents", icon: "⚠️" },
  ],
  EMPLOYMENT_SPECIALIST: [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Review Queue", href: "/dashboard/authorizations", icon: "📋" },
    { label: "Passes", href: "/dashboard/passes", icon: "🎫" },
  ],
  FRONT_DESK: [
    { label: "Front Desk", href: "/dashboard/front-desk", icon: "🖥️" },
    { label: "Scan Pass", href: "/dashboard/front-desk/scan", icon: "📷" },
    { label: "Residents", href: "/dashboard/residents", icon: "👤" },
    { label: "Incidents", href: "/dashboard/incidents", icon: "⚠️" },
  ],
};

export function getNavForRole(role: UserRole): NavItem[] {
  return NAV_BY_ROLE[role] ?? [];
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  ADMIN: "Administrator",
  CASE_MANAGER: "Case Manager",
  EMPLOYMENT_SPECIALIST: "Employment Specialist",
  FRONT_DESK: "Front Desk Officer",
};

export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] ?? role;
}
