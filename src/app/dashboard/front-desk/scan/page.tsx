"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { QRScanner } from "@/components/qr-scanner";
import { FrontDeskActions } from "@/components/front-desk-actions";
import { verifyQRCode, lookupPass, type VerifyResult } from "@/lib/actions/front-desk";

export default function ScanPage() {
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleScan(data: string) {
    startTransition(async () => {
      const res = await verifyQRCode(data);
      setResult(res);
    });
  }

  function handleManualLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    startTransition(async () => {
      const res = await lookupPass(manualQuery.trim());
      setResult(res);
    });
  }

  function handleReset() {
    setResult(null);
    setManualQuery("");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/front-desk"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Front Desk
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Scan / Verify Pass</h1>
      </div>

      {!result ? (
        <div className="space-y-8">
          {/* QR Scanner */}
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white text-center">Scan QR Code</h2>
            <QRScanner onScan={handleScan} />
            {isPending && (
              <p className="text-sm text-gray-400 text-center">Verifying…</p>
            )}
          </section>

          {/* Manual Lookup */}
          <section className="rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Manual Lookup</h2>
            <p className="text-xs text-gray-400">
              Enter a Pass ID (e.g. MP-20260311-0001) or Inmate Number
            </p>
            <form onSubmit={handleManualLookup} className="flex gap-2">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Pass ID or Inmate #"
                className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {isPending ? "…" : "Look Up"}
              </button>
            </form>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Result */}
          {result.valid && result.pass ? (
            <div className="rounded-lg border border-green-800 bg-green-950/30 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900 text-2xl">
                  ✓
                </div>
                <div>
                  <h2 className="text-lg font-bold text-green-300">Pass Verified</h2>
                  <p className="text-sm text-green-400">{result.pass.passDisplayId}</p>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Resident</dt>
                  <dd className="text-white font-medium">{result.pass.residentFullName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Inmate #</dt>
                  <dd className="text-white font-medium">{result.pass.residentInmateNumber}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Employer</dt>
                  <dd className="text-white">{result.pass.employerName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Type</dt>
                  <dd className="text-white">{result.pass.passType.replace(/_/g, " ")}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Departure</dt>
                  <dd className="text-white text-lg font-bold">
                    {result.pass.scheduledDeparture.toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}{" "}
                    {result.pass.scheduledDeparture.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Return By</dt>
                  <dd className="text-white text-lg font-bold">
                    {result.pass.scheduledReturn.toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}{" "}
                    {result.pass.scheduledReturn.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Status</dt>
                  <dd className="text-white font-medium">{result.pass.status}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Address</dt>
                  <dd className="text-white">{result.pass.employerAddress}</dd>
                </div>
              </dl>

              <div className="flex items-center gap-3 pt-2">
                <FrontDeskActions passId={result.pass.id} passStatus={result.pass.status} />
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-red-800 bg-red-950/30 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900 text-2xl">
                  ✕
                </div>
                <div>
                  <h2 className="text-lg font-bold text-red-300">Verification Failed</h2>
                  <p className="text-sm text-red-400">{result.error}</p>
                </div>
              </div>

              {result.pass && (
                <dl className="grid grid-cols-2 gap-3 text-sm mt-4">
                  <div>
                    <dt className="text-gray-500">Resident</dt>
                    <dd className="text-white">{result.pass.residentFullName}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Status</dt>
                    <dd className="text-red-300 font-medium">{result.pass.status}</dd>
                  </div>
                </dl>
              )}

              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-600 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
