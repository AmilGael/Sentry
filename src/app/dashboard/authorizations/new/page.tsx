import Link from "next/link";
import { requireRole, getSession } from "@/lib/auth-utils";
import {
  createAuthorization,
  selfApproveAuthorization,
  getResidentsForDropdown,
} from "@/lib/actions/authorizations";
import { AuthorizationForm } from "@/components/authorization-form";

export default async function NewAuthorizationPage(props: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const session = await requireRole("ADMIN", "CASE_MANAGER");
  const searchParams = await props.searchParams;

  const isSelfApprove = searchParams.mode === "emergency";
  const isCM = session.user.role === "CASE_MANAGER";

  const residents = await getResidentsForDropdown(
    isCM ? session.user.id : undefined
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/authorizations"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Authorizations
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {isSelfApprove
            ? "Self-Approve Authorization (Emergency)"
            : "New Employment Authorization"}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {isSelfApprove
            ? "This authorization will be active immediately. The Employment Specialist will be notified."
            : "Submit for Employment Specialist review."}
        </p>

        {!isSelfApprove && (
          <Link
            href="/dashboard/authorizations/new?mode=emergency"
            className="mt-3 inline-block text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            Need emergency self-approval? →
          </Link>
        )}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-950 p-6">
        <AuthorizationForm
          action={isSelfApprove ? selfApproveAuthorization : createAuthorization}
          residents={residents}
          isSelfApprove={isSelfApprove}
        />
      </div>
    </div>
  );
}
