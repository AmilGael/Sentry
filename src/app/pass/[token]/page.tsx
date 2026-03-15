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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4">
      {/* 8.5" x 11" page with 1" margins — scaled to fit viewport */}
      <div
        className="flex flex-col bg-white text-gray-900 shadow-2xl overflow-hidden"
        style={{
          width: "min(90vw, calc(100vh * 8.5 / 11))",
          aspectRatio: "8.5 / 11",
          maxHeight: "100vh",
        }}
      >
        {/* 1" border: content area = 6.5" x 9" */}
        <div className="flex flex-col flex-1 min-h-0 p-[1in]">
          {/* Top: title + pass ID */}
          <div className="flex items-baseline justify-between border-b border-gray-300 pb-2 mb-3">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Movement Pass</p>
            <p className="text-sm font-mono text-gray-600">{pass.passDisplayId}</p>
          </div>

          {/* Main: QR left, details right — fills content area */}
          <div className="flex flex-1 min-h-0 gap-6">
            {/* QR: larger, ~2" so it scans easily */}
            <div className="flex-shrink-0 flex items-start justify-center rounded-lg bg-gray-100 p-3">
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="w-[2in] h-[2in] min-w-[120px] min-h-[120px] max-w-[180px] max-h-[180px]"
                width={192}
                height={192}
              />
            </div>

            {/* Details: readable sizes */}
            <div className="flex-1 min-w-0 flex flex-col gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Name</p>
                <p className="text-lg font-bold text-gray-900 leading-tight">{pass.residentFullName}</p>
                <p className="text-sm text-gray-600">{pass.residentInmateNumber}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">From (Facility)</p>
                  <p className="text-base text-gray-800 leading-snug">Re-Entry Facility</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">To (Work Site)</p>
                  <p className="text-base font-semibold text-gray-900 leading-snug">{pass.employerName}</p>
                  <p className="text-sm text-gray-600 leading-snug">
                    {pass.authorization?.employerAddress ?? ""}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-auto pt-4 border-t border-gray-300">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Depart</p>
                  <p className="text-base font-semibold text-gray-900">
                    {pass.date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}{" "}
                    {pass.scheduledDeparture.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-gray-500 font-medium">Return By</p>
                  <p className="text-base font-semibold text-gray-900">
                    {pass.scheduledReturn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <p className="text-sm text-green-700 font-semibold">Active</p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-500 text-center pt-4 mt-3 border-t border-gray-200">
            Show this QR at Front Desk for check-out. You may photograph for your records.
          </p>
        </div>
      </div>
    </main>
  );
}
