"use client";

import { useState, useTransition } from "react";
import { generatePassAction } from "@/lib/actions/passes";

export function GeneratePassButton({
  authorizationId,
  defaultDate,
}: {
  authorizationId: string;
  defaultDate?: string;
}) {
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function handleGenerate() {
    setResult(null);
    startTransition(async () => {
      try {
        await generatePassAction(authorizationId, date);
        setResult({ success: true });
      } catch (e: unknown) {
        setResult({ error: e instanceof Error ? e.message : "Failed to generate pass" });
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {isPending ? "Generating…" : "Generate Pass"}
        </button>
      </div>
      {result?.success && (
        <p className="text-sm text-green-400">Pass generated successfully.</p>
      )}
      {result?.error && (
        <p className="text-sm text-red-400">{result.error}</p>
      )}
    </div>
  );
}
