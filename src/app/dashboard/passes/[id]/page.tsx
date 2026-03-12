import Link from "next/link";
import { notFound } from "next/navigation";
import { getPass, getPassSecureLink, cancelPass } from "@/lib/actions/passes";
import { generateQRDataUrl } from "@/lib/pass-engine";
import { getSession } from "@/lib/auth-utils";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function PassDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getSession();
  const pass = await getPass(id);
  if (!pass) notFound();

  const qrDataUrl = await generateQRDataUrl(pass.qrCodeData);
  const token = await getPassSecureLink(id);
  const passLink = `${process.env.AUTH_URL ?? "http://localhost:3000"}/pass/${token}`;

  const canCancel =
    pass.status === "ACTIVE" &&
    ["ADMIN", "CASE_MANAGER", "EMPLOYMENT_SPECIALIST"].includes(session.user.role);
  const isFrontDesk = session.user.role === "FRONT_DESK";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/passes"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Passes
        </Link>
        <div className="mt-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{pass.passDisplayId}</h1>
            <p className="mt-1 text-sm text-gray-400">
              {pass.residentFullName} · {pass.residentInmateNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={pass.status} />
            {canCancel && (
              <form action={async () => { "use server"; await cancelPass(id); }}>
                <button
                  type="submit"
                  className="rounded-lg border border-red-700 px-3 py-1.5 text-xs text-red-400 hover:bg-red-950 transition-colors"
                >
                  Cancel Pass
                </button>
              </form>
            )}
          </div>
        </div>
        {isFrontDesk && (
          <p className="mt-2 text-xs text-gray-500">
            Read-only view for Front Desk. Contact a Case Manager, Employment Specialist, or
            Administrator to change or cancel this pass.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* QR Code */}
        <div className="lg:col-span-1 flex flex-col items-center rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">QR Code</h2>
          <img src={qrDataUrl} alt="Pass QR Code" className="rounded-lg" width={250} height={250} />
          <p className="text-xs text-gray-500 text-center">
            Scan this code at the Front Desk for check-out
          </p>
        </div>

        {/* Pass Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Pass Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Type" value={pass.passType.replace(/_/g, " ")} />
              <Detail label="Date" value={pass.date.toLocaleDateString()} />
              <Detail label="Departure" value={pass.scheduledDeparture.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
              <Detail label="Return" value={pass.scheduledReturn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />
              <Detail label="Employer" value={pass.employerName} />
              <Detail label="Address" value={pass.employerAddress} />
              {pass.actualDeparture && (
                <Detail label="Actual Departure" value={pass.actualDeparture.toLocaleTimeString()} />
              )}
              {pass.actualReturn && (
                <Detail label="Actual Return" value={pass.actualReturn.toLocaleTimeString()} />
              )}
            </dl>
          </section>

          {/* Secure Link */}
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Resident Link</h2>
            <p className="text-xs text-gray-400">
              Share this link with the resident. Expires in 24 hours.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={passLink}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-300 font-mono"
              />
            </div>
          </section>

          {/* Cryptographic Info */}
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-3">
            <h2 className="text-lg font-semibold text-white">Security</h2>
            <dl className="text-sm space-y-2">
              <div>
                <dt className="text-gray-500">HMAC Signature</dt>
                <dd className="mt-0.5 font-mono text-xs text-gray-400 break-all">
                  {pass.hmacSignature}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Key Version</dt>
                <dd className="mt-0.5 text-gray-400">{pass.hmacKeyVersion}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Issued At</dt>
                <dd className="mt-0.5 text-gray-400">{pass.issuedAt.toLocaleString()}</dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-gray-200">{value}</dd>
    </div>
  );
}
