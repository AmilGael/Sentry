"use client";

import { useTransition, useState } from "react";
import { checkOutResident, checkInResident } from "@/lib/actions/front-desk";

export function FrontDeskActions({
  passId,
  passStatus,
}: {
  passId: string;
  passStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(passStatus);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleCheckOut() {
    setError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        await checkOutResident(passId);
        setStatus("USED");
        setSuccessMsg("Checked out successfully");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Check-out failed");
      }
    });
  }

  function handleCheckIn() {
    setError(null);
    setSuccessMsg(null);
    startTransition(async () => {
      try {
        await checkInResident(passId);
        setStatus("COMPLETED");
        setSuccessMsg("Checked in successfully");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Check-in failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "ACTIVE" && (
        <button
          onClick={handleCheckOut}
          disabled={isPending}
          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : "Check Out"}
        </button>
      )}
      {status === "USED" && (
        <button
          onClick={handleCheckIn}
          disabled={isPending}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : "Check In"}
        </button>
      )}
      {status === "COMPLETED" && (
        <span className="text-xs font-medium text-green-400">Trip Complete</span>
      )}
      {successMsg && <span className="text-xs text-green-400">{successMsg}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
