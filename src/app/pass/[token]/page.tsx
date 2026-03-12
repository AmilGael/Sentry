import { verifyPassToken } from "@/lib/pass-engine";
import { generateQRDataUrl } from "@/lib/pass-engine";
import { getPassByToken } from "@/lib/actions/passes";

export default async function PublicPassPage(props: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await props.params;
  const decoded = verifyPassToken(token);

  if (!decoded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">⛔</div>
          <h1 className="text-xl font-bold text-red-400">Link Expired or Invalid</h1>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            This pass link has expired or is invalid. Contact your Case Manager
            for a new link.
          </p>
        </div>
      </main>
    );
  }

  const pass = await getPassByToken(decoded.passId);

  if (!pass) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="text-center space-y-4">
          <div className="text-5xl">❌</div>
          <h1 className="text-xl font-bold text-red-400">Pass Not Found</h1>
          <p className="text-sm text-gray-400">This pass does not exist.</p>
        </div>
      </main>
    );
  }

  if (pass.status !== "ACTIVE") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="text-center space-y-4 max-w-sm mx-auto">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-yellow-400">Pass Not Active</h1>
          <p className="text-sm text-gray-400">
            This pass has a status of <span className="font-semibold text-white">{pass.status}</span> and
            cannot be used for check-out.
          </p>
        </div>
      </main>
    );
  }

  const qrDataUrl = await generateQRDataUrl(pass.qrCodeData);

  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-950 px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-gray-500">Movement Pass</p>
          <h1 className="mt-1 text-2xl font-bold text-white">{pass.passDisplayId}</h1>
        </div>

        {/* QR Code */}
        <div className="flex justify-center rounded-xl bg-white p-4">
          <img src={qrDataUrl} alt="QR Code" width={280} height={280} />
        </div>

        {/* Pass Info */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-4">
          <div className="text-center">
            <p className="text-lg font-bold text-white">{pass.residentFullName}</p>
            <p className="text-sm text-gray-400">{pass.residentInmateNumber}</p>
          </div>

          <div className="h-px bg-gray-800" />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Employer</p>
              <p className="text-white font-medium">{pass.employerName}</p>
            </div>
            <div>
              <p className="text-gray-500">Type</p>
              <p className="text-white font-medium">{pass.passType.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="text-white font-medium">{pass.date.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="text-green-400 font-medium">Active</p>
            </div>
            <div>
              <p className="text-gray-500">Depart</p>
              <p className="text-white font-medium text-lg">
                {pass.scheduledDeparture.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Return By</p>
              <p className="text-white font-medium text-lg">
                {pass.scheduledReturn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600">
          Show this QR code at the Front Desk for check-out.
          <br />
          You may photograph this screen for your records.
        </p>
      </div>
    </main>
  );
}
