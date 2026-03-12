import Link from "next/link";
import { getUsers } from "@/lib/actions/users";
import { requireRole } from "@/lib/auth-utils";
import { ToggleActiveButton } from "@/components/toggle-active-button";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  CASE_MANAGER: "Case Manager",
  EMPLOYMENT_SPECIALIST: "Employment Specialist",
  FRONT_DESK: "Front Desk",
};

export default async function UsersPage() {
  await requireRole("ADMIN");
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-400">
            {users.length} user{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition-colors"
        >
          Add User
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Residents</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-800/50 transition-colors ${!user.isActive ? "opacity-50" : ""}`}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                  {user.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                  {ROLE_LABELS[user.role] ?? user.role}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-400">
                  {user._count.assignedResidents > 0 ? user._count.assignedResidents : "—"}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  {user.isActive ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/users/${user.id}/edit`}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      Edit
                    </Link>
                    <ToggleActiveButton userId={user.id} isActive={user.isActive} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
