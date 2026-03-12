"use client";

import { useEffect, useState } from "react";

function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function OverdueTimer({ since }: { since: string }) {
  const sinceMs = new Date(since).getTime();
  const [elapsed, setElapsed] = useState(() => Date.now() - sinceMs);

  useEffect(() => {
    setElapsed(Date.now() - sinceMs);
    const id = setInterval(() => setElapsed(Date.now() - sinceMs), 1000);
    return () => clearInterval(id);
  }, [sinceMs]);

  return (
    <span className="font-mono tabular-nums text-red-300">{formatElapsed(elapsed)}</span>
  );
}

export function OverdueStatCard({
  count,
  earliestOverdueSince,
}: {
  count: number;
  earliestOverdueSince: string | null;
}) {
  const [elapsed, setElapsed] = useState(() =>
    earliestOverdueSince ? Date.now() - new Date(earliestOverdueSince).getTime() : 0
  );
  const [flashOn, setFlashOn] = useState(true);

  useEffect(() => {
    if (!earliestOverdueSince) return;
    const sinceMs = new Date(earliestOverdueSince).getTime();
    setElapsed(Date.now() - sinceMs);
    const timerId = setInterval(() => setElapsed(Date.now() - sinceMs), 1000);
    return () => clearInterval(timerId);
  }, [earliestOverdueSince]);

  useEffect(() => {
    if (count === 0) return;
    const id = setInterval(() => setFlashOn((prev) => !prev), 750);
    return () => clearInterval(id);
  }, [count]);

  const isOverdue = count > 0;

  return (
    <div
      className={`rounded-lg border p-4 transition-colors duration-300 ${
        isOverdue
          ? flashOn
            ? "border-red-600 bg-red-900/60"
            : "border-red-800 bg-red-950/30"
          : "border-gray-800 bg-gray-950"
      }`}
    >
      <p className="text-xs text-gray-500 uppercase tracking-wider">Overdue</p>
      <p className={`mt-1 text-3xl font-bold ${isOverdue ? "text-red-400" : "text-gray-500"}`}>
        {count}
      </p>
      {isOverdue && (
        <p className="mt-1 font-mono tabular-nums text-sm text-red-300">
          {formatElapsed(elapsed)}
        </p>
      )}
    </div>
  );
}
