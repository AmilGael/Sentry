import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNavForRole, getRoleDisplayName } from "@/lib/auth-utils";
import { getUnreadCount } from "@/lib/actions/notifications";
import { LogoutButton } from "@/components/logout-button";
import { SidebarNav } from "@/components/sidebar-nav";

export async function Sidebar() {
  const session = await auth();
  if (!session?.user) return null;

  const navItems = getNavForRole(session.user.role);
  const roleLabel = getRoleDisplayName(session.user.role);
  const unreadCount = await getUnreadCount();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-950">
      <div className="border-b border-gray-800 px-6 py-5">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Re-Entry
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SidebarNav items={navItems} unreadCount={unreadCount} />
      </nav>

      <div className="border-t border-gray-800 px-4 py-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-white truncate">
            {session.user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">{roleLabel}</p>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
