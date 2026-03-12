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

  function handleCheckOut() {
    setError(null);
    startTransition(async () => {
      try {
        await checkOutResident(passId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Check-out failed");
      }
    });
  }

  function handleCheckIn() {
    setError(null);
    startTransition(async () => {
      try {
        await checkInResident(passId);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Check-in failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {passStatus === "ACTIVE" && (
        <button
          onClick={handleCheckOut}
          disabled={isPending}
          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-500 transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : "Check Out"}
        </button>
      )}
      {passStatus === "USED" && (
        <button
          onClick={handleCheckIn}
          disabled={isPending}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 transition-colors disabled:opacity-50"
        >
          {isPending ? "…" : "Check In"}
        </button>
      )}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
