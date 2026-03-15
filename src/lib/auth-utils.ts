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

export type NavItemWithAccess = NavItem & { disabled: boolean };

// Unified navigation for all roles. Order is:
// Front Desk, Scan Pass, Residents, Incidents, Notifications, then everything else.
const ALL_NAV_ITEMS: NavItem[] = [
  { label: "Front Desk", href: "/dashboard/front-desk", icon: "🖥️" },
  { label: "Scan Pass", href: "/dashboard/front-desk/scan", icon: "📷" },
  { label: "Residents", href: "/dashboard/residents", icon: "👤" },
  { label: "Passes", href: "/dashboard/passes", icon: "🎫" },
  { label: "Incidents", href: "/dashboard/incidents", icon: "⚠️" },
  { label: "Notifications", href: "/dashboard/notifications", icon: "🔔" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Authorizations", href: "/dashboard/authorizations", icon: "📋" },
  { label: "Reports", href: "/dashboard/reports", icon: "📈" },
  { label: "Users", href: "/dashboard/users", icon: "👥" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

const FRONT_DESK_ALLOWED = new Set<string>([
  "/dashboard/front-desk",
  "/dashboard/front-desk/scan",
  "/dashboard/residents",
  "/dashboard/incidents",
  "/dashboard/notifications",
  "/dashboard/authorizations",
  "/dashboard/passes",
]);

export function getNavForRole(role: UserRole): NavItemWithAccess[] {
  // Admins, Case Managers, and Employment Specialists see all items active.
  if (role === "ADMIN" || role === "CASE_MANAGER" || role === "EMPLOYMENT_SPECIALIST") {
    return ALL_NAV_ITEMS.map((item) => ({ ...item, disabled: false }));
  }

  // Front Desk sees everything, but only some entries are active.
  if (role === "FRONT_DESK") {
    return ALL_NAV_ITEMS.map((item) => ({
      ...item,
      disabled: !FRONT_DESK_ALLOWED.has(item.href),
    }));
  }

  // Fallback: everything disabled (shouldn't normally happen).
  return ALL_NAV_ITEMS.map((item) => ({ ...item, disabled: true }));
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
