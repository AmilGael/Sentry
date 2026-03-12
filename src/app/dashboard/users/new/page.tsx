import Link from "next/link";
import { requireRole } from "@/lib/auth-utils";
import { UserForm } from "@/components/user-form";

export default async function NewUserPage() {
  await requireRole("ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/users" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Back to Users
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Create User</h1>
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <UserForm />
      </div>
    </div>
  );
}
