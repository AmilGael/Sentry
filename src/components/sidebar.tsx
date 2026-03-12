import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNavForRole, getRoleDisplayName } from "@/lib/auth-utils";
import { LogoutButton } from "@/components/logout-button";

export async function Sidebar() {
  const session = await auth();
  if (!session?.user) return null;

  const navItems = getNavForRole(session.user.role);
  const roleLabel = getRoleDisplayName(session.user.role);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-800 bg-gray-950">
      <div className="border-b border-gray-800 px-6 py-5">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Re-Entry
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
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
