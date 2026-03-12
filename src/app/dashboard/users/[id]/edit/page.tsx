import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-utils";
import { getUser } from "@/lib/actions/users";
import { UserForm } from "@/components/user-form";

export default async function EditUserPage(props: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await props.params;
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/users" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Users
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Edit User — {user.name}</h1>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <UserForm user={user} />
      </div>

      {/* Activity Summary */}
      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-3">
        <h2 className="text-lg font-semibold text-white">Activity</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-5">
          <div>
            <dt className="text-gray-500">Assigned Residents</dt>
            <dd className="mt-0.5 text-2xl font-bold text-white">{user._count.assignedResidents}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Auths Requested</dt>
            <dd className="mt-0.5 text-2xl font-bold text-white">{user._count.requestedAuthorizations}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Auths Reviewed</dt>
            <dd className="mt-0.5 text-2xl font-bold text-white">{user._count.reviewedAuthorizations}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Movements Logged</dt>
            <dd className="mt-0.5 text-2xl font-bold text-white">{user._count.recordedMovementLogs}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Incidents Created</dt>
            <dd className="mt-0.5 text-2xl font-bold text-white">{user._count.createdIncidents}</dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500">
          Account created {user.createdAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
